// Setup ===================================================================== #
var mongoose = require('mongoose');
var slack = require('./lib/slack'); // Run the slackbot

// Connect to DB
mongoose.connect('mongodb://localhost/toukufm');

// slack.doSomething("ayy");
