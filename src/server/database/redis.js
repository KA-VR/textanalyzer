/* eslint-disable no-console */
import redis from 'redis';
import Promise from 'bluebird';

const client = Promise.promisifyAll(redis.createClient());

client.on('error', (err) => {
  console.log('Error in database: ', err);
});

const retrieveFilteredWords = () => client.smembersAsync('residue');
const retrieveKeywords = () => client.smembersAsync('keywords');
const getData = () => {
  const obj = {};
  return retrieveFilteredWords()
    .then(filterWords => {
      obj.filter = filterWords;
      return retrieveKeywords();
    })
    .then(keywords => {
      obj.keywords = keywords;
      return obj;
    });
};

export default { retrieveFilteredWords, retrieveKeywords, getData, client };
