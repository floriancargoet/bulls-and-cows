/*jshint  node:true */

/*********
 * Utils *
 *********/
function generateWord(n, alphabet) {
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

function generatePermutations(list) {
    var permutations = [];
    function addNext(current) {
        if (current.length === list.length) {
            permutations.push(current);
            return;
        }
        list.forEach(function (item) {
            if (current.indexOf(item) === -1) {
                addNext(current.concat(item));
            }
        });
    }
    addNext([]);
    return permutations;
}

function each(str, fn, scope) {
    Array.prototype.forEach.call(str, function () {
        fn.apply(scope, arguments);
    });
}

/*******
 * Bot *
 *******/
var BAC_AI = function () {
    this.author = 'Florian Cargoët';
    this.name   = 'Tuesday';
};

BAC_AI.prototype.reset = function () {
    delete this.allDigitsFound;
    delete this.data;
    delete this.game;
};

BAC_AI.prototype.play = function (game) {
    switch (game.mode) {
        case 'mastermind' :
        case 'digits' :
        case 'alphabet' :
        case 'letters' :
        case 'words' :
            return this.playSymbols(game);
    }
};

BAC_AI.prototype.playSymbols = function (game) {
    this.data = new Data(game.length, game.alphabet);
    this.game = game;
    this.findDigits();
    var findStepGuesses = game.guesses;
    if (!game.won) {
        this.sortDigits();
    }
    var sortStepGuesses = game.guesses - findStepGuesses;
    return {
        find : findStepGuesses,
        sort : sortStepGuesses,
        learned_1_noReduce : this.data.learned_1_noReduce,
        learned_1_reduce : this.data.learned_1_reduce,
        learned_relearn : this.data.learned_relearn
    };
};

BAC_AI.prototype.findDigits = function () {
    while (! this.allDigitsFound) {
        var guess = this.nextFindGuess();
        var result = this.game.guess(guess);
        this.learn(guess, result);
    }
};

BAC_AI.prototype.sortDigits = function () {
    var known = [];
    var unknown = [];
    this.data.eachSymbol(function (s) {
        if (s.inWord) {
            if (s.positionIfGood == null) {
                unknown.push(s);
            } else {
                known.push(s);
            }
        }
    });
    known = known.sort(function (a, b) {
        return a.positionIfGood - b.positionIfGood;
    });

    // generate permutations
    var permutations = generatePermutations(unknown);
    var guesses = permutations.map(function (permutation) {
        // inject known symbols
        known.forEach(function (symbolInfo) {
            permutation.splice(symbolInfo.positionIfGood, 0, symbolInfo);
        });
        return permutation.map(function (s) {
            return s.symbol;
        }).join('');
    });

    for (var i = 0; i < guesses.length; i++) {
        var guess = guesses[i];
        var result = this.game.guess(guess);
        // this.learnPosition(guess, result);
        if (result.won) {
            break;
        }
    }
};

BAC_AI.prototype.nextFindGuess = function () {
    var possibleAlphabet = this.data.getPossibleDigits();
    return generateWord(this.game.length, possibleAlphabet);
};

BAC_AI.prototype.learn = function (guess, result) {
    this.data.learn(guess, result);
    this.allDigitsFound = this.data.allDigitsFound();
};

var Data = function (length, alphabet) {
    this.symbols = {};
    this.results = [];
    this.gameLength = length;
    this.alphabet = alphabet;
    // stats
    this.learned_1_noReduce = 0;
    this.learned_1_reduce = 0;
    this.learned_relearn = 0;
    

    each(alphabet, function (symbol) {
        this.symbols[symbol] = new Symbol(symbol);
    }, this);
};

Data.prototype.eachSymbol = function (fn, scope) {
    scope = scope || this;
    var symbols = this.symbols;
    Object.keys(symbols).forEach(function (symbol) {
        fn.call(scope, symbols[symbol]);
    });
};

Data.prototype.learn = function (guess, result) {
    result.guess = guess;
    this.results.push(result);
    var learned_1_noReduce = this.learnFrom(result, false);
    var learned_1_reduce = this.learnFrom(result, true);
    var learnedSomething = learned_1_noReduce + learned_1_reduce;
    
    this.learned_1_noReduce += learned_1_noReduce;
    this.learned_1_reduce   += learned_1_reduce;
     
    while (learnedSomething ) {
        learnedSomething = 0;
        for (var i = 0; i < this.results.length; i++) {
            /* In the current form, relearning without reducing is useless
            learnedSomething += this.learnFrom(this.results[i], false)
            */
            learnedSomething += this.learnFrom(this.results[i], true)
        }
        this.learned_relearn += learnedSomething;
    }
};

Data.prototype.learnFrom = function (result, doReduce) {
    var guess = result.guess;
    var learnedSomething = 0;
    var bad = result.bad;
    var good = result.good;
    var wordLength = this.gameLength;
    var reducedGuess = guess;

    if (doReduce) {
        // reduce the word if we already know that a symbol is (or is not) in the word
        each(guess, function (symbol, position) {
            var symbolInfo = this.symbols[symbol];
            
            if (symbolInfo.inWord === true && symbolInfo.positionIfGood != null) {
                if (symbolInfo.positionIfGood === position) {
                    good--;
                } else {
                    bad--;
                }
                wordLength--;
                reducedGuess = reducedGuess.replace(symbol, '');
            }
            
            if (symbolInfo.inWord === false) {
                wordLength--;
                reducedGuess = reducedGuess.replace(symbol, '');
            }
        }, this);
        /*
        if (reducedGuess != guess) {
            console.log(guess, 'was reduced to', reducedGuess);
            console.log('Bad', result.bad, '→', bad);
            console.log('Good', result.good, '→', good);
        }*/
        if (good < 0 || bad < 0) {
            throw 'Bug';
        }
    }
    each(reducedGuess, function (symbol) {
        var position = guess.indexOf(symbol);
        var symbolInfo = this.symbols[symbol];
        if (bad + good === 0) {
            if (symbolInfo.inWord !== false) {
                learnedSomething++;
                symbolInfo.inWord = false;
            }
        }
        if (bad + good === wordLength) {
            if (symbolInfo.inWord !== true) {
                learnedSomething++;
                symbolInfo.inWord = true;
            }
        }
        /*
        if (good === 0) {
            if (symbolInfo.badPositions.indexOf(position) === -1) {
                learnedSomething++;
                symbolInfo.badPositions.push(position);
            }
        }
        */

        if (bad === 0) {
            // if all are good, all inWord symbols are positionned
            each(reducedGuess, function (symbol) {
                var position = guess.indexOf(symbol);
                var symbol = this.symbols[symbol];
                if (symbol.positionIfGood == null) {
                    learnedSomething++;
                    symbol.positionIfGood = position;
                }
            }, this);
        }
    }, this);

    // if gameLength symbols are inWord, the others are not inWord
    // if (alphabet.length - gameLength) symbols are not inWord, the gameLength others are inWord

    var notInWordCount = 0;
    this.eachSymbol(function (symbol) {
        if (symbol.inWord === false) {
            notInWordCount++;
        }
    });
    if (notInWordCount === (this.alphabet.length - this.gameLength)) {
        this.eachSymbol(function (symbol) {
            if (symbol.inWord == null) {
                symbol.inWord = true;
                learnedSomething++;
            }
        });
    }

    var inWordCount = 0;
    this.eachSymbol(function (symbol) {
        if (symbol.inWord === true) {
            inWordCount++;
        }
    });
    if (inWordCount === this.gameLength) {
        this.eachSymbol(function (symbol) {
            if (symbol.inWord == null) {
                symbol.inWord = false;
                learnedSomething++;
            }
        });
    }
    this.inWordCount = inWordCount;
    return learnedSomething;
};

Data.prototype.allDigitsFound = function () {
    return this.inWordCount === this.gameLength;
};

Data.prototype.getPossibleDigits = function () {
    var digits = [];
    this.eachSymbol(function (s) {
        if (s.inWord !== false) {
            digits.push(s.symbol);
        }
    });
    return digits;
};


var Symbol = function (symbol) {
    this.symbol = symbol;
    this.positionIfGood = undefined;
    this.inWord = undefined;
    // this.badPositions = [];
};

module.exports = exports = BAC_AI;
