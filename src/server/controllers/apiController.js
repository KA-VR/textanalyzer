import async from 'async';
import redis from '../database/redis';
import fetch from 'isomorphic-fetch';

// const dictionary = new VocabFetcher();
const dictionaryURL = 'http://localhost:8080/api/dict/';
const thesaurusURL = 'http://localhost:8080/api/thes/';

const getDefinition = word =>
  fetch(dictionaryURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word }),
  }).then(definitions => definitions.json());

const getSynonyms = word =>
  fetch(thesaurusURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word }),
  }).then(synonyms => synonyms.json());

const analyzeString = (text, filters, callback) => {
  const words = text.split(' ');
  const filterWords = filters.filter;
  const filterKeywords = filters.keywords;
  const filtered = words.filter(word => filterWords.indexOf(word) === -1);
  const object = [];
  const keywords = [];
  let verb = null;
  let synonyms = null;

  const assignSynonyms = syns => {
    synonyms = syns.synonyms;
  };

  async.eachSeries(filtered, (word, cb) => {
    getDefinition(word)
      .then(definitions => {
        if (verb && filterKeywords.includes(word)) {
          keywords.push(word);
          cb();
        } else if (/^[A-Z]/.test(word)) {
          object.push(word);
          cb();
        } else {
          const findVerb = !verb;
          definitions.forEach((definition, index) => {
            const partOfSpeech = definition.partOfSpeech.replace(',', '');
            const testObject = partOfSpeech === 'adjective' ||
              partOfSpeech === 'noun' || /^[A-Z]/.test(word);
            if (testObject && verb && !findVerb) {
              object.push(word);
              cb();
            } else if (partOfSpeech === 'verb' && !verb) {
              verb = word;
              getSynonyms(word)
                .then(assignSynonyms)
                .then(() => { cb(); });
            } else if (index === definitions.length - 1) {
              cb();
            }
          });
        }
      });
  }, err => {
    // eslint-disable-next-line no-console
    console.log(err);
    if (verb) callback({ text, verb, object, keywords, synonyms });
    else callback({ text, error: 'Missing Action' });
  });
};

const analyze = (req, res) => {
  const text = req.body.text || 'failed';
  redis.getData()
    .then(filters => {
      analyzeString(text, filters, data => {
        res.send(data);
      });
    });
};

export default { analyze, getDefinition };
