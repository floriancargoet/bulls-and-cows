/*jshint  node:true */

var Game = require('../game.js');

var gd = new Game({
    length : 4,
    mode : 'digits',
    debug : true
});

// brute force method
var count = 0;
for (var i = 123; i < 10000; i++) {
    var s = String(i);
    if (s.length < 4) {
        s = '0' + s;
    }
    var unique = true;
    Array.prototype.slice.call(s).forEach(function (c, i) {
        if (s.indexOf(c) !== i) {
            unique = false;
        }
    });

    if (unique) {
        count++;
        var result = gd.guess(s);
        if (result.won) {
            console.log('Found', s, 'in', count, 'guesses');
            break;
        }
    }
}


var gl = new Game({
    length : 4,
    mode : 'letters',
    debug : true
});
var letters = 'abcdefghijklmnopqrstuvwxyz';

// brute force method
var count = 0, s;
var i, j, k, l;
outerloop:
for (i = 0; i < 26; i++) {
    for (j = 0; j < 26; j++) {
        if (i === j) continue;
        for (k = 0; k < 26; k++) {
            if (i === k || j === k) continue;
            for (l = 0; l < 26; l++) {
                if (i === l || j === l || k === l) continue;
                s = letters[i] + letters[j] + letters[k] + letters[l];
                count++;
                console.log(s);
                var result = gl.guess(s);
                if (result.won) {
                    console.log('Found', s, 'in', count, 'guesses');
                    break outerloop;
                }
            }
        }
    }
}
