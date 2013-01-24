/*jshint  node:true */
var fs = require('fs');

var Game = function (options) {
    this.reset();
    this.goal = generate(options);
    this.mode = options.mode;
    this.length = options.length;
    if (options.debug) {
        console.log('String to guess', this.goal);
    }
};

Game.prototype.reset = function () {
    this.guesses = 0;
    this.won = false;
};

Game.prototype.guess = function (s) {
    var l = this.length;

    if (typeof s !== 'string' || s.length !== l) {
        throw new Error('Bad input (' + s + '). Must be a string of length ' + l);
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
        result.won = this.won = true;
        result.guesses = this.guesses;
    }
    return result;
};

function generate(options) {
    switch (options.mode) {
        case 'mastermind':
            options.length = 4;
            options.alphabet = '01234567';
            return generateSymbols(options);
        case 'digits' :
            options.alphabet = '0123456789';
            return generateSymbols(options);
        case 'letters' :
            options.alphabet = 'abcdefghijklmnopqrstuvwxyz';
            return generateSymbols(options);
        case 'words' :
            return generateWords(options);
    }
}

function generateSymbols(options) {
    var n = options.length;
    var alphabet = options.alphabet;

    if (n > alphabet.length) {
        throw new Error('I cannot generate a string of length ' + n + ' because symbols must be unique');
    }
    var s = '';
    while (n--) {
        var c = alphabet[Math.floor(Math.random() * alphabet.length)];
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
    if (!dict) {
        dict = '/usr/share/dict/british-english';
    }
    if (!fs.existsSync(dict)) {
        console.log('File not found: ' + dict);
    }

    if (!cache[dict]) {
        // build a cache of words
        cache[dict] = fs.readFileSync(dict, 'utf8')
            .split('\n')
            .filter(function (word) {
                return /^[a-z]+$/.test(word);
            });
    }
    var words = cache[dict];
    words = words.filter(function (word) {
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
