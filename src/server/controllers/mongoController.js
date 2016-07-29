/* eslint-disable no-console */
import mongoose from 'mongoose';
import helpers from '../database/helpers';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.MONGODB_URI);

const uri = process.env.MONGODB_URI || 'mongodb://localhost/dictionary';

mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Mongodb connected on port 27017');
});

const writeWord = (newWordObj, callback) => (
  helpers.saveWord(newWordObj, (err, result) => {
    if (err) {
      console.log(err);
    }
    callback(result);
  })
);

const searchWord = (word, callback) => (
  helpers.findWord(word, (err, result) => {
    if (err) {
      console.log(err);
    }
    callback(result);
  })
);

export default {
  writeWord,
  searchWord,
};
