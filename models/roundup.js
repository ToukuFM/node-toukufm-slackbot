var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roundupSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    url: String,
    tweet: {
        text: String,
        id: String
    }
});

var roundup = mongoose.model('Roundup', roundupSchema);

module.exports = roundup;

/*
var example = new RoundupItem({
    creator: "Bakaboykie",
    text: "This is an example roundup",
    url: "google.com"
});

example.save(function (err) {
    if (err) throw err;
    console.log("RoundupItem saved successfully!");
});

RoundupItem.find({}, function (err, items) {
    if (err) throw err;
    console.log(items);
});


var dates = new Date().getWeek();
RoundupItem.find({'date': {'$gte':dates.start, '$lt': dates.end}}, function(err, items) {
    if (err) throw err;
    
    console.log(items);
});

*/