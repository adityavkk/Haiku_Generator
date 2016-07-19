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

function parseTextSync(filePath, syllableLookup) {
  var data = fs.readFileSync(filePath, 'utf8').replace(/K\./g, 'Josef');
  var rawSentences = data.split('.').map(para => para.replace(/\s/, '').replace(/\n/g, ' ').replace(/[^a-z\s]+/gi, '').replace(/\s{2,}/g, ' ').split(' '));
  var rawSyllables = rawSentences.map(sentence => sentence.map(word => syllableLookup[word.toLowerCase()] || 0).join(','));
  return new ParsedText(rawSentences, rawSyllables);
}

function createHaiku(pattern, cmuDictPath, textPathsArr) {
  var haiku = '',
    syllableLookup = syllableLookupGenSync(cmuDictPath),
    numOfTextsToParse = Math.min(pattern.length, textPathsArr.length),
    parsedTexts = [];
  var randomIndices = arrayGen(0, textPathsArr.length - 1).shuffle().slice(0, numOfTextsToParse);
  randomIndices.forEach(e => {
    parsedTexts.push(parseTextSync(textPathsArr[e], syllableLookup.dict));
  });
  return pattern.map((line, i) => {
    var haikuLine = parsedTexts.next(i).findRandomMatch(line);
    if (haikuLine) return haikuLine;
    var j = 1;
    while(haikuLine === undefined && j <= Math.abs(numOfTextsToParse - textPathsArr.length)) {
    	haikuLine = parsedTexts.next(i + j).findRandomMatch(line);
    	j++;
    }
    console.log(i, 'in dict');
    return syllableLookup.findRandomMatch(line);
  }).join('\n');
}

module.exports = {
  createHaiku: createHaiku,
  syllableLookupGenSync: syllableLookupGenSync
};
