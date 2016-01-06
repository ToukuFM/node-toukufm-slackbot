// Requires ================================================================== #
var mongoose = require('mongoose');
var slackAPI = require('slackbotapi');
var slackEventHandler = require('./scripts/slack-events');

// Setup ===================================================================== #
Date.prototype.getWeek = require('./scripts/get-week');

// Connect to DB
mongoose.connect('mongodb://localhost/toukufm');

// Connect to Slack
var slack = new slackAPI({
    'token': 'TOKENHERE',
    'logging': true,
    'autoReconnect': true
});

var events = new slackEventHandler(slack);