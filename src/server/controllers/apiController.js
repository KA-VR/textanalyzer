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

  async.eachSeries(filtered, (word, cb) => {
    getDefinition(word, definitions => {
      for (let i = 0; i < definitions.length; i++) {
        const partOfSpeech = definitions[i].partOfSpeech;
        if (partOfSpeech === 'v' && !verb) {
          verb = word;
          i = definitions.length;
        } else if (partOfSpeech === 'adj' || partOfSpeech === 'n') {
          object.push(word);
          i = definitions.length;
        }
      }
      cb();
    });
  }, err => {
    // eslint-disable-next-line no-console
    console.log(err);
    callback({ verb, object });
  });
};

const analyze = (req, res) => {
  const text = req.body.text || '';
  redis.retrieveFilteredWords(filterWords => {
    analyzeString(text, filterWords, data => {
      res.send(data);
    });
  });
};

export default { analyze, getDefinition };
