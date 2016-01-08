'use strict';
// Requires ================================================================== #
var slackAPI = require('slackbotapi');
var moment = require('moment-timezone');
var extIP = require('external-ip')();
var ToukuFM = require('node-toukufm-api');
var Nyaa = require('node-nyaa-api');
var RoundupItem = require('../models/roundup');

// Strings files for responses
var strings_welcome = require('./strings/welcome.json');
var strings_help = require('./strings/help.json');
var strings_hello = require('./strings/hello.json');
var strings_waifu = require('./strings/waifu.json');
var strings_yukiko_options = require('./strings/yukiko_options.json');
var strings_yukiko_responses = require('./strings/yukiko_responses.json');

Date.prototype.getWeek = require('./get-week');


// Methods =================================================================== #

// Get the ToukuFM schedule and return as formatted message
var __getToukuSchedule = function(callback, command) {

    // Setup the callback
    var parseResults = function(err, result) {
        if (err == true) {
            callback("Sorry! Something went wrong while downloading " +
                "the ToukuFM schedule... Please try again in a minute.");
            console.log(err);
            console.log(result);
        }
        else {
            var response = '_*Upcoming shows:*_\n';

            for (var item in result.result) {
                var showtime = moment.tz(result.result[item].start_time,
                    'YYYY-MM-DD HH:mm:ss', 'UTC');

                // Build a schedule row
                response += '*' + showtime.format('HH:mm') + '*: ';
                response += result.result[item].name + ' with *';
                response += result.result[item].host + '* _(';
                response += showtime.fromNow() + ')_\n';
            }
            response += '_All timezones are in UTC. Current time: ' +
                moment.tz('UTC').format('HH:mm') + ' UTC_';

            callback(response);
        }
    };

    // Check which schedule to get
    var days = parseInt(command[1], 10);

    if (days >= 0)
        ToukuFM.get_schedule_days_ahead(days, parseResults);
    else
        ToukuFM.get_schedule(parseResults);

};

var __getToukuTeam = function(callback, command) {

    ToukuFM.get_team(function(err, result) {
        if (err == true) {
            callback('Sorry! Something went wrong while downloading ' +
                'the ToukuFM team... Please try again in a minute.');
            console.log(err);
            console.log(result);
        }
        else {
            var response = '_*Lookie! I found this:*_\n';
            var search = command[1] != '' && command[1] != null;

            for (var item in result.result) {
                if (search) {
                    var name = result.result[item].displayname.toLowerCase();
                    var needle = command[1].toLowerCase();

                    if (name.indexOf(needle) == -1)
                        continue;
                }

                response += '*' + result.result[item].displayname + '*: ';
                response += 'http://toukufm.com/team/' + result.result[item].id;

                if (result.result[item].showtext != '')
                    response += ' _(' + result.result[item].showtext + ')_';
                response += '\n';
            }

            if (response == '_*Lookie! I found this:*_\n')
                response = 'Sorry, I don\'t know anyone by that name...';
            callback(response);
        }
    });
};

var __getToukuNowPlaying = function(callback) {
    ToukuFM.get_now_playing(function(err, result) {
        if (err == true) {
            callback('Sorry! Something went wrong while downloading ' +
                'the current song name... Please try again in a minute.');
            console.log(err);
            console.log(result);
        }
        else {
            var res = '';

            for (var channel in result) {
                res += 'Now playing on *' + channel + '* with *' +
                    result[channel].listeners + ' listeners* _(On air: ' +
                    result[channel].onair + ')_\n';

                res += '*Song:* ' + result[channel].title;
                res += ' _by_ ' + result[channel].artist + '\n';
                res += '*Album:* ' + result[channel].album + '\n';
                res += '*Series:* ' + result[channel].series + '\n';
                res += '*Link:* ' + result[channel].link + '\n';
            }

            callback(res);
        }
    });
};

var ___animeHelpString = function() {
    var response = '_*You can use the following commands for this tool:*_ \n';
    response += '!anime latest\n';
    response += '!anime search [term]\n';
    return response;
};

// Parse a Nyaa feed and return as formatted message
var ___parseAnimeFeed = function(header, results) {
    var response = '_*' + header + '*_\n';

    var i = 0;

    for (var anime in results) {
        response += results[anime].title + ' - ';
        response += results[anime].link + '\n';
        i++;
        if (i > 6) break;
    }

    if (response == '_*' + header + '*_\n')
        return 'Sorry! I couldn\'t find anything about that... :disappointed:';
    else
        return response;
};

// Prepare =================================================================== #

var _prepareWelcome = function(data, ctx, callback) {
    var response = 'Hey, @' + slack.getUser(data.user).name;
    for (var string in strings_welcome)
        response += strings_welcome[string] + '\n';
    callback(response);
};

var _prepareHello = function(data, ctx, callback) {
    var index = Math.floor(Math.random() * strings_hello.length);
    var username = '@' + slack.getUser(data.user).name;
    callback(strings_hello[index].replace('[USERNAME]', username));
};

var _prepareSay = function(data, ctx, callback) {
    callback(data.text.split('!say ')[1]);
};

var _prepareSchedule = function(data, ctx, callback) {
    // var hsb = ['horrible', 'horriblesubs', 'hsubs', 'hs', 'anime'];
    // var tfm = ['toukufm', 'tfm', 'touku', 'radio', 'station', 'music', 'dj'];

    // // Check what kind of schedule is wanted
    // if (ctx[1] != null) {
    //     var command = ctx[1].toLowerCase();
    //     if (new RegExp(tfm.join('|')).test(command)) {
    //         __getToukuSchedule(callback);
    //     }
    //     else if (new RegExp(hsb.join('|')).test(command)) {
    //         __getHorribleSchedule(callback);
    //     }
    //     else {
    //         callback("Unknown command \"" + command + "\". You can use !schedule, with " +
    //             "[toukufm] or [horriblesubs]");
    //     }
    // }
    // else {
    //     __getToukuSchedule(callback);
    // }
    __getToukuSchedule(callback, ctx);
};

var _prepareTeam = function(data, ctx, callback) {
    __getToukuTeam(callback, ctx);
};

var _prepareNowPlaying = function(data, ctx, callback) {
    __getToukuNowPlaying(callback);
};

var _prepareAnime = function(data, ctx, callback) {
    if (ctx[1] != null) {
        var term = ctx[1].toLowerCase();

        if (term == 'latest') {
            Nyaa.get_latest(function(err, results) {
                if (err) {
                    callback('Sorry! Something went wrong... Please try again' +
                        ' in a few minutes.');
                }
                else {
                    var header = 'Here\'s the latest and greatest for you:';
                    callback(___parseAnimeFeed(header, results));
                }
            });
        }
        else if (term.startsWith('search ')) {
            console.log(term);
            var searchterm = term.split('search ');
            Nyaa.search(searchterm[1], function(err, results) {
                if (err) {
                    callback('Sorry! Something went wrong... Please try again' +
                        ' in a few minutes.');
                }
                else {
                    var header = 'I found this for you: ';
                    callback(___parseAnimeFeed(header, results));
                }
            });
        }
        else {
            callback(___animeHelpString());
        }
    }
    else {
        callback(___animeHelpString());
    }
};

var _prepareHelp = function(data, ctx, callback) {
    var response = '';
    for (var string in strings_help)
        response += strings_help[string] + '\n';
    callback(response);
};

var _prepareSuggest = function(data, ctx, callback) {
    var response = '_*Hey! Somebody has suggested the following:*_ \n```';
    response += data.text.split('!suggest ')[1];
    response += '``` \n_Sent by @' + slack.getUser(data.user).name + '_';

    callback('Thanks for letting me know! ' +
        'Senpai will surely notice your suggestion!~ :heart:');

    slack.sendMsg('D0EDB5EL8', response);
};

var _prepareWaifu = function(data, ctx, callback) {
    var response = '';

    if (strings_yukiko_options.indexOf(ctx[1].toLowerCase()) >= 0) {
        response = Math.floor(Math.random() * strings_yukiko_responses.length);
        response = strings_yukiko_responses[response];
    }
    else {
        response = Math.floor(Math.random() * strings_waifu.length);
        response = strings_waifu[response];

        if (response.includes('[WAIFU]')) {
            var waifu = ctx[1];
            response = response.replace('[WAIFU]', waifu);
        }
    }

    callback(response);
};

var _prepareIp = function(data, ctx, callback) {
    extIP(function(err, ip) {
        if (err) {
            callback('Uhhh... Something has gone wrong...' +
                ' Maybe later, okay? :disappointed:');
        }
        else {
            callback('*Don\'t abuse it*, okay? Here: ' + ip);
        }
    });
};

// Commands ================================================================== #

// Use the commands as a switch
var commands = {
    'welcome': _prepareWelcome,
    'hello': _prepareHello,
    'say': _prepareSay,

    'sch': _prepareSchedule,
    'schedule': _prepareSchedule,
    'upcoming': _prepareSchedule,
    'team': _prepareTeam,
    'member': _prepareTeam,
    'np': _prepareNowPlaying,
    'nowplaying': _prepareNowPlaying,

    'anime': _prepareAnime,
    'waifu': _prepareWaifu,
    'ratemywaifu': _prepareWaifu,

    'help': _prepareHelp,
    'suggest': _prepareSuggest,
    'ip': _prepareIp,
};


// Module ==================================================================== #

var slack = (function() {

    var api = new slackAPI({
        // $ export SLACK_TOKEN=[your-slack-token]
        'token': process.env.SLACK_TOKEN,
        'logging': true,
        'autoReconnect': true
    });

    var prefix = '!';

    // Handlers ============================================================== #
    var _onMessage = function(data) {
        if (typeof data.text == 'undefined') return;

        // Received a command
        if (data.text.charAt(0) === prefix) {
            // Split the command and it's arguments into an array
            var command = data.text.substring(1).split(' ');

            // if [command] [extra] [more], store all in [extra]
            if (typeof command[2] != 'undefined') {
                for (var i = 2; i < command.length; i++) {
                    command[1] = command[1] + ' ' + command[i];
                }
            }

            // Respond if the command is in the commands array
            var cmd = command[0].toLowerCase();
            if (typeof commands[cmd] == 'function') {
                commands[cmd](data, command, function(res) {
                    api.sendMsg(data.channel, res);
                });
            }
        }
    };

    var _onTeamJoin = function(data) {
        commands['welcome'](data, '', console.log);
    };


    // Events ================================================================ #
    api.on('message', _onMessage);
    api.on('team_join', _onTeamJoin);


    // Public ================================================================ #
    return {
        getUser: function(id) {
            return api.getUser(id);
        },
        sendMsg: function(channel, message) {
            api.sendMsg(channel, message);
        }
    };
})();


module.exports = slack;
