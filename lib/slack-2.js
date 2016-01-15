'use strict';

// style guide: https://github.com/airbnb/javascript

// Requires ============================================================================ #
var Slack = require('slackbotapi');

// Exports ============================================================================= #
class SlackBot {

    constructor(options) {
        this.token = options.token;
        this.prefix = options.prefix ? options.prefix : '!';
        this.commands = options.commands ? options.commands : [];
        
        if (process.env.SLACK_BOTNAME)
            this.name = `<@${process.env.SLACK_BOTNAME}>`;
        else
            console.warn('No $SLACK_BOTNAME found. See the documentation.');
    }
    
    addCommand(command) {
        this.commands.push(command);
    }
    
    // Private methods ================================================================= #
    _onMessage(data) {
        console.log(data);
        // TODO: Go through the this.commands array and see what function to call
    }
    

    // API Setup ======================================================================= #
    connect() {
        this.api = new Slack({
            'token': this.token,
            'logging': true,
            'autoReconnect': true,
        });
        
        this.api.on('message', this._onMessage);
    }
    
}

class Command {
    constructor(options) {
        
    }
}

class HelloCommand extends Command {
    constructor(options) {
        super(options);
    }
}





new SlackBot({
    token: 'token',
    prefix: '!',
    commands: [
        'command object',
        'command object',
    ]
});