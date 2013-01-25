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
    this.name   = 'Monday';
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
        sort : sortStepGuesses
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

BAC_AI.prototype.nextSortGuess = function () {
    
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

    each(guess, function (symbol) {
        var symbolInfo = this.symbols[symbol];
        if (result.bad + result.good === 0) {
            symbolInfo.inWord = false;
        }
        if (result.bad + result.good === this.gameLength) {
            symbolInfo.inWord = true;
        }
        
        if (result.bad === 0) {
            // if all are good, all inWord symbols are positionned
            each(guess, function (symbol) {
                this.symbols[symbol].positionIfGood = guess.indexOf(symbol);
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
            }
        });
    }
    this.inWordCount = inWordCount;
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
};

module.exports = exports = BAC_AI;
