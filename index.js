// Setup ===================================================================== #
var mongoose = require('mongoose');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var app = express();

var slack = require('./lib/slack'); // Run the slackbot
var roundup = require('./models/roundup');
var url_regex = require('./lib/url');

Date.prototype.getWeek = require('./lib/get-week');
Date.prototype.getWeekNumber = function() {
    var d = new Date(+this);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};

mongoose.connect('mongodb://localhost/toukufm');


// Express =================================================================== #

// Express setup

app.set('view engine', 'ejs');
app.use(morgan('dev')); // Log to console
app.use(bodyParser.json()); // Get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));


// Routes

var categories = [{
    id: 0,
    name: 'Announcement'
}, {
    id: 1,
    name: 'News'
}, {
    id: 2,
    name: 'Release'
}, {
    id: 3,
    name: 'DJ Mix'
}, {
    id: 4,
    name: 'Other'
}, ];

app.route('/')
    .get(function(req, res, next) {
        res.render('index');
    });

app.route('/dialog')
    .get(function(req, res, next) {
        res.render('partials/dialog');
    });

app.route('/api/roundup/items/')
    .get(function(req, res, next) {
        roundup.find({}).sort('-date').exec(function(err, items) {
            if (err) throw err;
            
            var history = {};

            for (var item in items) {
                var fullyear = items[item].date.getFullYear();
                var week = items[item].date.getWeekNumber();

                if (!history[fullyear]) {
                    history[fullyear] = {};
                }

                if (!history[fullyear][week]) {
                    history[fullyear][week] = [];
                }

                history[fullyear][week].push(items[item]);
            }
            
            res.send(history);
        });
    })
    .post(function(req, res, next) {
        if (req.body.category &&
            req.body.text &&
            req.body.title &&
            req.body.creator) {

            var data = {
                title: req.body.title,
                category: categories[req.body.category].name,
                text: req.body.text,
                creator: req.body.creator,
            };

            if (req.body.url) {

                if (url_regex.regex.test(req.body.url)) {
                    data.url = req.body.url;
                    new roundup(data).save(function(err, item) {
                        if (err)
                            res.status(500).send(err);
                        else {
                            res.send(item._id);

                            var msg = '_@' + item.creator +
                                ' has added a new item to the roundup:_\n\n' +
                                '\n*' + item.title + '*\n' + item.text + '\n' +
                                '_Link:_ ' + item.url + '\n' +
                                '_Category:_ ' + item.category;
                            slack.sendMsg('C0EAXD8PL', msg);
                        }
                    });
                }
                else {
                    res.status(400).send("Invalid URL received");
                }
            }
            else {
                new roundup(data).save(function(err, item) {
                    if (err)
                        res.status(500).send(err);
                    else {
                        res.send(item._id);

                        var msg = '_@' + item.creator +
                            ' has added a new item to the roundup:_\n\n' +
                            '\n*' + item.title + '*\n' + item.text + '\n' +
                            '_Category:_ ' + item.category;
                        slack.sendMsg('C0EAXD8PL', msg);
                    }
                });
            }
        }
        else {
            res.status(400).send("Something went wrong. Please try again.");
        }
    });

app.route('/api/roundup/categories/')
    .get(function(req, res, next) {
        res.send(categories);
    });

// Serve static files
app.use(express.static(__dirname + '/public'));


// Start the server

app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Yukiko listening on port ' + process.env.PORT);
});
