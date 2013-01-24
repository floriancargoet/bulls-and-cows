/*jshint node:true */
var fs = require('fs');
var path = require('path');

var Game = require('./game.js');

var args = process.argv;
args.shift(); // node
args.shift(); // compare.js

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

var modes = ['digits', 'mastermind', 'letters', 'words'];
for (var j = 0; j < modes.length; j++) {
    var mode = modes[j];
    var score;
    scores[mode] = {};
    for (var i = 3; i < 5; i++) {
        var game = new Game({
            length : i,
            mode : mode
        });
        score = scores[mode]['Length ' + game.length] = {};
        score.goal = game.goal;

        bots.forEach(function (bot) {
            console.log('Bot ' + bot.name + ' playing mode ' + mode + ', length ' + game.length);
            var t = new Date();
            bot.instance.play(game);
            score['Guesses for Bot ' + bot.name] = game.won ? game.guesses : 0;
            score['Time for Bot ' + bot.name] = new Date() - t;

            game.reset();
            if (typeof bot.instance.reset === 'function') {
                bot.instance.reset();
            }
        });

        if (mode === 'mastermind') {
            // mastermind has only one length
            break;
        }
    }
}

console.log(JSON.stringify(scores, null, 4));
