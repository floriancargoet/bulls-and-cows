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
if (
    'digits' === args[0] ||
    'mastermind' === args[0] ||
    'letters' === args[0] ||
    'words' === args[0]
) {
    mode = args.shift();
}

var alphabet = '';
if (args[0] === 'alphabet') {
    mode = args.shift();
    alphabet = args.shift();
}


var botFiles = args;
var bots = [];
var names = {};

botFiles.forEach(function (botFile) {
    var file = path.resolve(process.cwd(), botFile);
    if (fs.existsSync(file)) { // file or module ?
        botFile = file;
    }
    var instance = new (require(botFile));
    var name = instance.name || 'Unnamed Bot';
    if (name in names) {
        names[name]++;
        name = name + ' ' + names[name];
    } else {
        names[name] = 1;
    }

    bots.push({
        name : name,
        file : botFile,
        instance : instance
    });
});

console.log('Bots: ', botFiles);
console.log('Mode: ', mode);
if (alphabet) {
    console.log('Alphabet: ', alphabet);
}
if (mode !== 'mastermind') {
    console.log('Length:', l);
}
console.log('Runs:', count);

var scores = {};
for (var i = 0; i < count; i++) {
    var game = new Game({
        length : l,
        mode : mode,
        alphabet : alphabet
    });

    bots.forEach(function (bot) {
        var data = bot.instance.play(game);
        var score = scores[bot.name + ' - count'] || 0;
        scores[bot.name + ' - count'] = score + (game.won ? game.guesses : Infinity);
        if (data) {
            Object.keys(data).forEach(function (key) {
                if (typeof data[key] === 'number') {
                    var value = scores[bot.name + ' - ' + key] || 0;
                    scores[bot.name + ' - ' + key]  = value + data[key];
                }
            });
        }
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
