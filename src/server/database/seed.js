/* eslint-disable no-console */
import redis from 'redis';
import async from 'async';

const client = redis.createClient();
const data = [
  'the', 'to', 'a',
];

const key = [
  'image',
  'images',
  'picture',
  'pictures',
  'depiction',
  'depictions',
  'video',
  'videos',
  'YouTube',
  'news',
];

const populateRedis = () => {
  async.each(data, word => {
    client.sadd(['residue', word], (err) => {
      if (err) console.log('Error adding in ', word, ': ', err);
      else console.log('Successful addition of word:', word);
    });
  }, err => {
    console.log('Error adding filter words', err);
  });
  async.each(key, word => {
    client.sadd(['keywords', word], (err) => {
      if (err) console.log('Error adding in ', word, ': ', err);
      else console.log('Successful addition of word:', word);
    });
  }, err => {
    console.log('Error adding keywords', err);
  });
  // data.forEach(word => {
  //   client.sadd(['residue', word], (err) => {
  //     if (err) console.log('Error adding in ', word, ': ', err);
  //     else console.log('Successful addition of word:', word);
  //   });
  // });
};

populateRedis();
