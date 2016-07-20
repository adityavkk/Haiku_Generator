var fs = require('fs');

function Dict(dict) {
  this.dict = dict;
}

Dict.prototype.findRandomMatch = function(pattern) {
  var words = Object.keys(this.dict);
  words = words.shuffle();
  return pattern.map(numOfSyllables => {
    for (var i = 0; i < words.length; i++) {
      if (this.dict[words.next(i)] == numOfSyllables) {
        var word = words.next(i);
        words.splice(i, 1);
        return word;
      }
    }
  }).join(' ');
};

function syllableLookupGenSync(cmuDictPath) {
  var data = fs.readFileSync(cmuDictPath, 'utf8'),
    dict = {},
    lines = data.split('\n');
  lines.forEach(line => {
    if (/[()]/.test(line)) return;
    var word = line.match(/[^\s()]+/)[0].toLowerCase();
    dict[word] = (line.match(/\d+/g) || []).length;
  });
  return new Dict(dict);
}

function arrayGen(start, end) {
  var result = [];
  for (var i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

Array.prototype.swap = function(i, j) {
  var temp = this[i];
  this[i] = this[j];
  this[j] = temp;
};

Array.prototype.shuffle = function() {
  this.forEach((e, i, arr) => {
    var j = Math.floor(Math.random() * arr.length);
    this.swap(i, j);
  });
  return this;
};

Array.prototype.next = function(i) {
  return this[i % this.length];
};

function ParsedText(rawSentences, rawSyllables) {
  this.rawSentences = rawSentences;
  this.rawSyllables = rawSyllables;
}

Object.defineProperties(ParsedText.prototype, {
  'findRandomMatch': {
    value: function(patternArr) {
      var pattern = patternArr.join(','),
        patternRegExp = new RegExp(pattern),
        shuffledSentenceIndices = arrayGen(0, this.rawSentences.length - 1).shuffle();
      //console.log('this.rawSyllables', this.rawSyllables);
      for (var i = 0; i < shuffledSentenceIndices.length; i++) {
        var match = patternRegExp.exec(this.rawSyllables[shuffledSentenceIndices[i]]);
        if (match) {
          //console.log(match);
          var randomMatch = [];
          for (var j = 0; j < patternArr.length; j++) {
            randomMatch.push(this.rawSentences[shuffledSentenceIndices[i]][match.index / 2 + j]);
          }
          return randomMatch.join(' ');
        }
      }
    }
  }
});

function parseTextSync(filesPathArr, syllableLookup) {
  var data = '';
  for (var i = 0; i < filesPathArr.length; i++) {
    data += fs.readFileSync(filesPathArr[i], 'utf8');
  }
  var rawSentences = data.split('.').map(para => para.replace(/\s/, '').replace(/\n/g, ' ').replace(/[^a-z\s]+/gi, '').replace(/\s{2,}/g, ' ').split(' '));
  var rawSyllables = rawSentences.map(sentence => sentence.map(word => syllableLookup.dict[word.toLowerCase()] || 0).join(','));
  return new ParsedText(rawSentences, rawSyllables);
}

function createHaiku(pattern, cmuDictPath, textPathsArr) {
  var haiku = '',
    syllableLookup = syllableLookupGenSync(cmuDictPath),
    parsedText = parseTextSync(textPathsArr, syllableLookup);
  return pattern.map(line => {
    var haikuLine = parsedText.findRandomMatch(line);
    if (haikuLine) return haikuLine;
    return syllableLookup.findRandomMatch(line);
  }).join('\n');
}

module.exports = {
  createHaiku: createHaiku,
  syllableLookupGenSync: syllableLookupGenSync
};
