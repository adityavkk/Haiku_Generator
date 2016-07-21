var haiku = require('./haiku');
var headlinesHaiku = require('./headlinesApi/headlinesApi');

var dictPath = './cmudict.txt';
var pattern = [
  [1, 2, 2],
  [2, 2, 3],
  [1, 2, 2]
];
var textsPaths = ['./texts/trial.txt', './texts/metamorphosis.txt'];

console.log('***** Kafka Haiku *****', '\n' + haiku.createHaiku(pattern, dictPath, textsPaths) + '\n');
console.log('***** Headlines Haiku *****');
headlinesHaiku(haiku.createHaiku, [pattern, dictPath, []], console.log);

