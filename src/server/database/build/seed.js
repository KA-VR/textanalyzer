'use strict';

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = require('redis').createClient();

var data = ['the', 'to'];

var populateRedis = function populateRedis() {
  data.forEach(function (word) {
    client.sadd(['residue', word], function (err, reply) {
      if (err) {
        console.log('Error adding in ', word, ': ', err);
      }
      console.log('Successful addition of word:', word);
    });
  });
};

populateRedis();