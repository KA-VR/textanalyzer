/* eslint-disable no-console */
import Word from './models';

// Create a search method to query the database to see if words exist
const findWord = (searchWord, callback) => {
  console.log('searchWord', searchWord);
  Word.find({ name: searchWord }, (err, result) => {
    if (err) {
      console.log(err);
    }
    callback(null, result);
  });
};

// Create a write method to write to the database if nothing is found
const saveWord = (saveWordObj, callback) => {
  const newWord = new Word({
    name: saveWordObj.name,
    def: saveWordObj.def,
    syn: saveWordObj.syn,
    ant: saveWordObj.ant,
  });
  newWord.save((err, result) => {
    if (err) {
      console.log(err);
    }
    callback(null, result);
  });
};

export default {
  findWord,
  saveWord,
};
