// Setup ===================================================================== #
var mongoose = require('mongoose');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var app = express();

var slack = require('./lib/slack'); // Run the slackbot
var roundup = require('./models/roundup');
var url_regex = require('./lib/url');

mongoose.connect('mongodb://localhost/toukufm');


// Express =================================================================== #

// Express setup

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev')); // Log to console
app.use(bodyParser.json()); // Get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));


// Routes

app.route('/api/roundup/items/')
    .get(function(req, res, next) {
        roundup.find({}, function(err, items) {
            if (err) throw err;
            res.send(items);
        });
    })
    .post(function(req, res, next) {

        if (url_regex.regex.test(req.body.url) &&
            req.body.category &&
            req.body.text &&
            req.body.text.length <= 200 &&
            req.body.name) {

            new roundup({
                name: req.body.name,
                text: req.body.text,
                url: req.body.url,
                category: req.body.category
            }).save(function(err) {
                if (err) res.send({
                    status: false
                });
                res.send({
                    status: true
                });
            });
        }
        else {
            res.send({
                status: false
            });
        }
    });


// Start the server

app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Yukiko listening on port ' + process.env.PORT);
});
