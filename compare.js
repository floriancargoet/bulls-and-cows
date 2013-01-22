var Game = require('./game.js');
var bot1_file = process.argv[2];
var bot2_file = process.argv[3];

var bot1 = new (require(bot1_file));
var bot2 = new (require(bot2_file));

var scores = {
};
['digits', 'letters', 'words'].forEach(function (mode) {
    var score, t;
    scores[mode] = {};
    for (var i = 3; i < 5; i++) {
        score = scores[mode]['Length ' + i] = {};
        var game = new Game({
            length : i,
            mode : mode
        });

        console.log('Bot 1 playing mode ' + mode + ', length ' + i);
        t = new Date();
        bot1.play(game);
        score.guesses_1 = game.won ? game.guesses : 0;
        score.time_1 = new Date() - t;

        game.reset();

        console.log('Bot 2 playing mode ' + mode + ', length ' + i);
        t = new Date();
        bot2.play(game);
        score.guesses_2 = game.won ? game.guesses : 0;
        score.time_2 = new Date() - t;

        if (score.guesses_1 === score.guesses_2) {
            score.winner = 'draw';
        } else {
            score.winner = (score.guesses_1 > score.guesses_2 ? bot1_file : bot2_file);
        }
    }
});

console.log(JSON.stringify(scores, null, 4));
