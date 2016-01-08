// Requires ================================================================== #
var slackAPI = require('slackbotapi');
var moment = require('moment-timezone');
var ToukuFM = require('node-toukufm-api');
var Nyaa = require('node-nyaa-api');
var RoundupItem = require('../models/roundup');

var strings_welcome = require('./strings/welcome.json');

Date.prototype.getWeek = require('./get-week');


// Methods =================================================================== #

// Get the ToukuFM schedule and return as formatted message
var __getToukuSchedule = function(callback) {

    ToukuFM.get_schedule(function(err, result) {
        if (err == true) {
            callback("Sorry! Something went wrong while downloading " +
                "the ToukuFM schedule... Please try again in a minute.");
            console.log(err);
            console.log(result);
        }
        else {
            console.log('\n' + err + '\n');
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
    });
};

var __getHorribleSchedule = function(callback) {
    callback("Sorry, this function is not implemented yet.");
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
    return response;
};

// Prepare =================================================================== #

var _prepareWelcome = function(data, ctx, callback) {
    for (var string in strings_welcome) {
        slack.sendMsg(data.channel, strings_welcome[string]);
    }
    // callback('');
};

var _prepareHello = function(data, ctx, callback) {
    callback('Oh, hello @' + slack.getUser(data.user).name + ' !');
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
    __getToukuSchedule(callback);
};

var __prepareAnime = function(data, ctx, callback) {
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

var __prepareHelp = function(data, ctx, callback) {
    // TODO: strings_help.json file with command docs
    callback('Coming soon, ask @Bakaboykie for now!');
};

var __prepareSuggest = function(data, ctx, callback) {
    var response = '_*Hey! Somebody has suggested the following:*_ \n```';
    response += data.text.split('!suggest ')[1];
    response += '``` \n_Sent by @' + slack.getUser(data.user).name + '_';
    slack.sendMsg('D0EDB5EL8', response);
    
    callback('Thanks for letting me know! ' + 
    'Senpai will surely notice your suggestion!~ :heart:');
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

    'anime': __prepareAnime,
    'help': __prepareHelp,
    'suggest': __prepareSuggest,
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


// Snippets
// if (data.text === 'cake!!')  {
//    api.sendMsg(data.channel, '@' + api.getUser(data.user).name + ' OOH, CAKE!! :cake:')
// };

/*
    // Switch to check which command has been requested.
            switch (command[0].toLowerCase()) {
                case 'welcome':
                    
                    break;
                // If hello
                case 'helloaaa':
                    // Send message
                    api.sendMsg(data.channel, 'Oh, hello @' + api.getUser(data.user).name + ' !');
                    break;
    
                case 'say':
                    var say = data.text.split('!say ');
                    api.sendMsg(data.channel, say[1]);
                    break;
            }
*/