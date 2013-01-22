/*jshint  node:true */
var fs = require('fs');

var Game = function (options) {
    this.goal = generate(options);
    this.guesses = 0;
    this.length = options.length;
    if (options.debug) {
        console.log('String to guess', this.goal);
    }
};

Game.prototype.reset = function () {
    this.guesses = 0;
};

Game.prototype.guess = function (s) {
    var l = this.length;

    if (typeof s !== 'string' || s.length !== l) {
        throw new Error('Bad input. Must be a string of length ' + l);
    }

    var result = {
        good : 0,
        bad : 0
    };
    var goal = this.goal;
    Array.prototype.slice.call(s).forEach(function (c, i) {
        if (goal.indexOf(c) === i) {
            result.good++;
        } else if (goal.indexOf(c) !== -1) {
            result.bad++;
        }
    });

    this.guesses++;
    if (result.good === l) {
        result.won = true;
        result.guesses = this.guesses;
    }
    return result;
};

function generate(options) {
    switch (options.mode) {
        case 'digits' :
            return generateDigits(options);
        case 'letters' :
            return generateLetters(options);
        case 'words' :
            return generateWords(options);
    }
}

function generateDigits(options) {
    var n = options.length;
    if (n > 10) {
        throw new Error('I cannot generate a string of length ' + n + ' because digits must be unique');
    }
    var s = '';
    while (n--) {
        var c = String(Math.floor(Math.random() * 10));
        if (s.indexOf(c) === -1) {
            s += c;
        } else {
            n++;
        }
    }
    return s;
}

var letters = 'abcdefghijklmnopqrstuvwxyz';
function generateLetters(options) {
    var n = options.length;
    if (n > 26) {
        throw new Error('I cannot generate a string of length ' + n + ' because letters must be unique');
    }
    var s = '';
    while (n--) {
        var c = letters[Math.floor(Math.random() * 26)];
        if (s.indexOf(c) === -1) {
            s += c;
        } else {
            n++;
        }
    }
    return s;
}

var cache = {};
function generateWords(options) {
    var dict = options.dict;
    if (!dict || !fs.existsSync(dict)) {
        console.log('File not found: ' + dict);
        dict = '/usr/share/dict/british-english';
    }

    if (!cache[dict]) {
        // build a cache of words
        cache[dict] = fs.readFileSync(dict, 'utf8')
            .split('\n')
            .filter(function (word){
                return /^[a-z]+$/.test(word);
            });
    }
    var words = cache[dict];
    words = words.filter(function(word) {
        if (word.length === options.length) {
            var allDifferent = true;
            for (var i = 0; i < word.length; i++) {
                if (word.indexOf(word[i]) !== i) {
                    allDifferent = false;
                    break;
                }
            }
            return allDifferent;
        }
    });

    return words[Math.floor(Math.random() * words.length)];
}

module.exports = exports = Game;
