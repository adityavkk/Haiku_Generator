var haiku = require('./haiku');
//haiku.createHaiku(pattern, dictLocation, textsLocationArray)
console.log(haiku.createHaiku([ [2, 1, 3, 2], [3, 1, 4, 2], [4, 1, 2, 3] ], './cmudict.txt', ['./trial.txt', './metamorphosis.txt']));

