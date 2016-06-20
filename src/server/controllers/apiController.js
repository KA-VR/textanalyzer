import config from '../../../config';
import fetch from 'isomorphic-fetch';
import async from 'async';

const getWord = word => {
  const key = config.mashape_key;
  const options = {
    headers: {
      'X-Mashape-Key': key,
      Accept: 'application/json',
    },
  };
  const url = `https://wordsapiv1.p.mashape.com/words/${word}/entails`;
  fetch(url, options)
    .then(response => response.data)
    .then();
};

const analyze = (req, res) => {
  const text = req.body.word;
  const words = text.split();
  const filtered = words.filter(word => {

  });
  for (let i = 0; i < filtered.length; i++) {
    getWord(filtered, cb);
  }

  res.send('Something');
};

export default { analyze, getWord };
