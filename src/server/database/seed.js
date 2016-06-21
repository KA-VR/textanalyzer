import redis from 'redis';
import { client } from './redis.js';

const data = [
  'the', 'to'
];


const populateRedis = () => {
  data.forEach(word => {
    client.sadd(['residue', word], (err, reply) => {
    	if(err){
    		console.log('Error adding in ', word, ': ', err);
    	}
      console.log('Successful addition of word:', word);
    });
  });
}

populateRedis();