
var Game = require('../game.js');
 
var g = new Game(4);
 
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
        console.log(s);
        var result = g.guess(s);
        if (result.won) {
            console.log('Found', s, 'in', count, 'guesses');
            break;
        }
    }
}
