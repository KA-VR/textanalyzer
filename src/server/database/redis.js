/* eslint-disable no-console */
import redis from 'redis';

const client = redis.createClient();

client.on('error', (err) => {
  console.log('Error in database: ', err);
});

const retrieveFilteredWords = (callback) => {
  client.smembers('residue', (err, reply) => {
    if (err) {
      console.log('Error retrieving residue: ', err);
    }
    callback(reply);
  });
};

export default { retrieveFilteredWords, client };
