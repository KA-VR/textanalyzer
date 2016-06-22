/* eslint-disable no-console */
import redis from 'redis';
import async from 'async';

const client = redis.createClient();
const data = [
  'the', 'to', 'a',
];

const populateRedis = () => {
  async.each(data, word => {
    client.sadd(['residue', word], (err) => {
      if (err) console.log('Error adding in ', word, ': ', err);
      else console.log('Successful addition of word:', word);
    });
  }, err => {
    console.log(err);
  });
  // data.forEach(word => {
  //   client.sadd(['residue', word], (err) => {
  //     if (err) console.log('Error adding in ', word, ': ', err);
  //     else console.log('Successful addition of word:', word);
  //   });
  // });
};

populateRedis();
