import async from 'async';
import VocabFetcher from '../helpers/wordFetcher';
import redis from '../database/redis';


const dictionary = new VocabFetcher();

const getDefinition = (word, cb) => {
  dictionary.getWord(word)
    .then(wordObj => wordObj.definitions)
    .then(definitions => cb(definitions));
};

const analyzeString = (text, filterWords, callback) => {
  const words = text.split(' ');
  const filtered = words.filter(word => filterWords.indexOf(word) === -1);
  const object = [];
  let verb = null;
  let synonyms = [];

  async.eachSeries(filtered, (word, cb) => {
    getDefinition(word, definitions => {
      definitions.forEach(def => {
        if (def.synonyms && def.partOfSpeech === 'v') synonyms = synonyms.concat(def.synonyms);
      });
      for (let i = 0; i < definitions.length; i++) {
        const partOfSpeech = definitions[i].partOfSpeech;
        const testObject = partOfSpeech === 'adj' || partOfSpeech === 'n' || /^[A-Z]/.test(word);
        if (partOfSpeech === 'v' && !verb) {
          verb = word;
          i = definitions.length;
        } else if (testObject && verb) {
          object.push(word);
          i = definitions.length;
        }
      }
      if (/^[A-Z]/.test(word)) object.push(word);
      cb();
    });
  }, err => {
    // eslint-disable-next-line no-console
    console.log(err);
    callback({ text, verb, object, synonyms });
  });
};

const analyze = (req, res) => {
  const text = req.body.text || 'failed';
  redis.retrieveFilteredWords(filterWords => {
    analyzeString(text, filterWords, data => {
      res.send(data);
    });
  });
};

export default { analyze, getDefinition };
