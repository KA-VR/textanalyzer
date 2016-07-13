import async from 'async';
import redis from '../database/redis';
import fetch from 'isomorphic-fetch';
import dotenv from 'dotenv';
dotenv.config();

const apiURL = process.env.API_URL;
const dictionaryURL = `${apiURL}/api/dict/`;
const thesaurusURL = `${apiURL}/api/thes/`;
const writeURL = `${apiURL}/api/writemongo`;
const searchURL = `${apiURL}/api/searchmongo`;

const postReq = (url, data) => (
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
);

const getDefinition = word => (
  postReq(dictionaryURL, { word })
    .then(definitions => definitions.json())
);

const getSynonyms = word =>
  postReq(thesaurusURL, { word })
    .then(synonyms => synonyms.json());

const getFullDefinition = word => (
  postReq(searchURL, { word })
    .then(results => results.json())
    .then(results => {
      // Word exists in database
      if (results.length !== 0) return results[0];
      // Word doesn't exist. Fetch from api server.
      if (results.length === 0) {
        return postReq(dictionaryURL, { word })
          .then(definitions => definitions.json())
          .then(definitions => (
            getSynonyms(word)
              .then(synonyms => {
                const fullDefinition = {
                  name: word,
                  def: definitions,
                  syn: synonyms.synonyms,
                  ant: synonyms.antonyms,
                };
                return postReq(writeURL, fullDefinition)
                  .then(() => fullDefinition);
              })
          ));
      }
      return false;
    })
);

const analyzeString = (text, filters, callback) => {
  const words = text.split(' ');
  const filterWords = filters.filter;
  const filterKeywords = filters.keywords;
  const filtered = words.filter(word => filterWords.indexOf(word) === -1);
  const object = [];
  const keywords = [];
  let verb = null;
  let synonyms = null;

  async.eachSeries(filtered, (word, cb) => {
    console.log(word);
    getFullDefinition(word)
      .then(definitions => {
        if (verb && filterKeywords.includes(word.toLowerCase())) {
          const ascii = word.charCodeAt(0);
          if (ascii >= 65 && ascii <= 90) {
            keywords.push(word.toLowerCase());
          } else {
            keywords.push(word);
          }
          cb();
        } else if (definitions.def.length === 0 || verb && verb.toLowerCase() === 'calculate') {
          object.push(word.toLowerCase());
          cb();
        } else if (/^[A-Z]/.test(word)) {
          object.push(word);
          cb();
        } else {
          const findVerb = !verb;
          let alreadyPushed = false;
          definitions.def.forEach((definition, index) => {
            const partOfSpeech = definition.partOfSpeech.replace(',', '');
            const testObject = partOfSpeech === 'adjective' ||
              partOfSpeech === 'noun' || /^[A-Z]/.test(word);
            if (testObject && verb && !findVerb && !alreadyPushed) {
              object.push(word);
              alreadyPushed = true;
              cb();
            } else if (partOfSpeech === 'verb' && !verb) {
              verb = word;
              synonyms = definitions.syn;
            } else if (index === definitions.def.length - 1) {
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
