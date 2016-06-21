/* eslint-disable no-console */
import redis from 'redis';

const client = redis.createClient();
const data = [
  'the', 'to', 'a',
];

const populateRedis = () => {
  data.forEach(word => {
    client.sadd(['residue', word], (err, reply) => {
      if (err) {
        console.log('Error adding in ', word, ': ', err);
      }
      console.log('Successful addition of word:', word);
    });
  });
};

populateRedis();
