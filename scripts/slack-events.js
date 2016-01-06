// Requires ================================================================== #
var ToukuFM = require('node-toukufm-api');
var RoundupItem = require('../models/roundup');

// Constructor =============================================================== #
var events = function(slack) {

    // Reference the slack client
    this.slack = slack;

    // Events
    this.slack.on('message', this.onMessage);
    this.slack.on('team_join', this.onTeamJoin);
    // slack.on('channel_joined'); // TODO: Figure out how to autojoin channel
};

// Events ==================================================================== #
events.prototype.onMessage = function(data) {
    // If no text, return.
    if (typeof data.text == 'undefined') return;
    // If someone says `cake!!` respond to their message with 'user OOH, CAKE!! :cake:'
    if (data.text === 'cake!!') this.slack.sendMsg(data.channel, '@' + this.slack.getUser(data.user).name + ' OOH, CAKE!! :cake:');

    // If the first character starts with %, you can change this to your own prefix of course.
    if (data.text.charAt(0) === '%') {
        // Split the command and it's arguments into an array
        var command = data.text.substring(1).split(' ');

        // If command[2] is not undefined, use command[1] to have all arguments in command[1]
        if (typeof command[2] != 'undefined') {
            for (var i = 2; i < command.length; i++) {
                command[1] = command[1] + ' ' + command[i];
            }
        }

        // Switch to check which command has been requested.
        switch (command[0].toLowerCase()) {
            // If hello
            case 'hello':
                // Send message
                this.slack.sendMsg(data.channel, 'Oh, hello @' + this.slack.getUser(data.user).name + ' !');
                break;

            case 'say':
                var say = data.text.split('%say ');
                this.slack.sendMsg(data.channel, say[1]);
                break;
        }
    }
};

events.prototype.onTeamJoin = function(data) {
    this.slack.sendPM(data.user.id, 'Hello and welcome to the team! :simple_smile: :beers:');
    this.slack.sendPM(data.user.id, 'I am a bot that knows all kinds of useful things!');
};

module.exports = events;