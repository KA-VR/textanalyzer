/* eslint-disable no-console */
import async from 'async';
import redis from '../database/redis';
// import fetch from 'isomorphic-fetch';
import dotenv from 'dotenv';
import dictionary from './dictionaryController.js';
import mongo from './mongoController.js';
dotenv.config();

const getDefinition = word => (
  dictionary.getDefinition(word)
);

const getSynonyms = word => (
  dictionary.getSynonyms(word)
);

const getFullDefinition = (word, callback) => (
  mongo.searchWord(word, (result) => {
    console.log('results is:', result);
    const results = result;
    if (results.length !== 0) {
      callback(results[0]);
    }
    if (results.length === 0) {
      getDefinition(word)
        .then((def) => {
          const definitions = def;
          getSynonyms(word)
            .then((syn) => {
              const synonyms = syn;
              const fullDefinition = {
                name: word,
                def: definitions,
                syn: synonyms.synonyms,
                ant: synonyms.antonyms,
              };
              mongo.writeWord(fullDefinition, () => {
                callback(fullDefinition);
              });
            });
        });
    }
    callback(false);
  })
);

// const analyzeString = (text, filters, callback) => {
//   const words = text.split(' ');
//   const filterWords = filters.filter;
//   const filterKeywords = filters.keywords;
//   const filtered = words.filter(word => filterWords.indexOf(word) === -1);
//   const object = [];
//   const keywords = [];
//   let verb = null;
//   let synonyms = null;

//   async.eachSeries(filtered, (word, cb) => {
//     console.log(word);
//     getFullDefinition(word)
//       .then(definitions => {
//         if (verb && filterKeywords.includes(word.toLowerCase())) {
//           const ascii = word.charCodeAt(0);
//           if (ascii >= 65 && ascii <= 90) {
//             keywords.push(word.toLowerCase());
//           } else {
//             keywords.push(word);
//           }
//           cb();
//         } else if (definitions.def.length === 0 || verb && verb.toLowerCase() === 'calculate') {
//           object.push(word.toLowerCase());
//           cb();
//         } else if (/^[A-Z]/.test(word)) {
//           object.push(word);
//           cb();
//         } else {
//           const findVerb = !verb;
//           let alreadyPushed = false;
//           definitions.def.forEach((definition, index) => {
//             const partOfSpeech = definition.partOfSpeech.replace(',', '');
//             const testObject = partOfSpeech === 'adjective' ||
//               partOfSpeech === 'noun' || /^[A-Z]/.test(word);
//             if (testObject && verb && !findVerb && !alreadyPushed) {
//               object.push(word);
//               alreadyPushed = true;
//               cb();
//             } else if (partOfSpeech === 'verb' && !verb) {
//               verb = word;
//               synonyms = definitions.syn;
//             } else if (index === definitions.def.length - 1) {
//               cb();
//             }
//           });
//         }
//       });
//   }, err => {
//     // eslint-disable-next-line no-console
//     console.log(err);
//     if (verb) callback({ text, verb, object, keywords, synonyms });
//     else callback({ text, error: 'Missing Action' });
//   });
// };

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
    getFullDefinition(word, definitions => {
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
  console.log('Text is:', text);
  redis.getData()
    .then(filters => {
      analyzeString(text, filters, data => {
        res.send(data);
      });
    });
};

export default { analyze };
