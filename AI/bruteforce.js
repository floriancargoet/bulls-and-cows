/*jshint  node:true */

function allDifferent(word){
    for (var i = 0; i < word.length; i++) {
        if (word.indexOf(word[i]) !== i) {
            return false;
        }
    }
    return true;
}

var letters = 'abcdefghijklmnopqrstuvwxyz';

function base26(i) {
    var r, s = '';
    while (i !== 0) {
        r = i%26;
        i = (i-r)/26;
        s = letters[r] + s;
    }
    return s;
}
var BruteForceAI = function() {
};

BruteForceAI.prototype.play = function (game) {
    switch (game.mode) {
        case 'mastermind' :
        case 'digits' :
            return this.playDigits(game);
        case 'letters' :
        case 'words' :
            return this.playLetters(game);
    }
};

BruteForceAI.prototype.playDigits = function(game) {
    var start = Math.pow(10, game.length - 1);
    var end = Math.pow(10, game.length);

    for (var i = start; i < end; i++) {
        var s = String(i);
        if (s.length < game.length) {
            s = '0' + s;
        }
        if (allDifferent(s)) {
            var result = game.guess(s);
            if (result.won) {
                return;
            }
        }
    }
};

BruteForceAI.prototype.playLetters = function(game) {
    var word;
    var start = Math.pow(26, game.length - 2); // start = "baaaa…"
    var end = Math.pow(26, game.length) - 1;       // end = "zzzz…"
    for (var i = start; i <= end; i++) {
        word = base26(i);
        if (word.length < game.length) {
            word = 'a' + word;
        }

        if (allDifferent(word)) {
            var result = game.guess(word);
            if (result.won) {
                return;
            }
        }
    }
};

module.exports = exports = BruteForceAI;
