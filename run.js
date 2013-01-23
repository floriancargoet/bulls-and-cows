var Game = require('./game.js');
var args = process.argv;
args.shift(); // node
args.shift(); // compare.js
var botFiles = args;

var bots = [];
var i = 1;
botFiles.forEach(function (botFile) {
    bots.push({
        name : i++,
        file : botFile,
        instance : new (require(botFile))
    });
});

var scores = {};

['digits', 'letters', 'words'].forEach(function (mode) {
    var score;
    scores[mode] = {};
    for (var i = 3; i < 5; i++) {
        score = scores[mode]['Length ' + i] = {};
        var game = new Game({
            length : i,
            mode : mode
        });
        score.goal = game.goal;

        bots.forEach(function (bot) {
            console.log('Bot ' + bot.name + ' playing mode ' + mode + ', length ' + i);
            var t = new Date();
            bot.instance.play(game);
            score['Guesses for Bot ' + bot.name] = game.won ? game.guesses : 0;
            score['Time for Bot ' + bot.name] = new Date() - t;

            game.reset();
            if (typeof bot.reset === 'function') {
                bot.reset();
            }
        });
    }
});

console.log(JSON.stringify(scores, null, 4));
