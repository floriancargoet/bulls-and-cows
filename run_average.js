/*jshint  node:true */

var fs = require('fs');
var path = require('path');

var Game = require('./game.js');

var args = process.argv;
args.shift(); // node
args.shift(); // digits_100.js

var l = 4;
if (/^[0-9]+$/.test(args[0])) {
    l = Number(args.shift());
}

var count = 100;
if (/^[0-9]+$/.test(args[0])) {
    count = Number(args.shift());
}

var mode = 'digits';
if ('digits' === args[0] || 'mastermind' === args[0] || 'letters' === args[0] || 'words' === args[0]) {
    mode = args.shift();
}

var botFiles = args;
var bots = [];
var i = 1;
botFiles.forEach(function (botFile) {
    var file = path.resolve(process.cwd(), botFile);
    if (fs.existsSync(file)) { // file or module ?
        botFile = file;
    }
    bots.push({
        name : i++,
        file : botFile,
        instance : new (require(botFile))
    });
});


var scores = {};
for (var i = 0; i < count; i++) {
    var game = new Game({
        length : l,
        mode : mode
    });

    bots.forEach(function (bot) {
        bot.instance.play(game);
        var score = scores['Bot ' + bot.name] || 0;
        scores['Bot ' + bot.name] = score + (game.won ? game.guesses : Infinity);

        game.reset();
        if (typeof bot.instance.reset === 'function') {
            bot.instance.reset();
        }
    });
}
Object.keys(scores).forEach(function (key) {
    scores[key] /= count;
});

console.log(JSON.stringify(scores, null, 4));
