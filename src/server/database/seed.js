/* eslint-disable no-console */
import redis from 'redis';
import async from 'async';
import dotenv from 'dotenv';
dotenv.config();

const client = redis.createClient(process.env.REDIS_URL);
const data = [
  'the', 'to', 'a', 'of',
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
  'weather',
  'map',
  'maps',
  'route',
  'routes',
  'direction',
  'directions',
  'yelp',
];

const populateRedis = () => {
  let count = 0;
  async.each(data, (word, cb) => {
    client.sadd(['residue', word], (err) => {
      if (err) console.log('Error adding in ', word, ': ', err);
      else console.log('Successful addition of word:', word);
      cb();
    });
  }, err => {
    count += 1;
    if (count === 2) client.end(true);
    if (err) console.log('Error adding filter words', err);
  });
  async.each(key, (word, cb) => {
    client.sadd(['keywords', word], (err) => {
      if (err) console.log('Error adding in ', word, ': ', err);
      else console.log('Successful addition of word:', word);
      cb();
    });
  }, err => {
    count += 1;
    if (count === 2) client.end(true);
    if (err) console.log('Error adding keywords', err);
  });
  // data.forEach(word => {
  //   client.sadd(['residue', word], (err) => {
  //     if (err) console.log('Error adding in ', word, ': ', err);
  //     else console.log('Successful addition of word:', word);
  //   });
  // });
};

populateRedis();
