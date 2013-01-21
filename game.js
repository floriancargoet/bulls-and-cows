/*jshint  node:true */

var Game = function (options) {
    this.goal = generate(options);
    this.length = options.length;
    if (options.debug) {
        console.log('String to guess', this.goal);
    }
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
    if (result.good === l) {
        result.won = true;
    }
    return result;
};

function generate(options) {
    switch (options.mode) {
        case 'digits' :
            return generateDigits(options);
        case 'letters' :
            return generateLetters(options);
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

module.exports = exports = Game;
