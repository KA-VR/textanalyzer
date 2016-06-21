'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = require('redis').createClient();

client.on('error', function (err) {
	console.log('Error in database: ', err);
});

var retrieveFilteredWords = function retrieveFilteredWords(callback) {
	client.smembers('residue', function (err, reply) {
		if (err) {
			console.log('Error retrieving residue: ', err);
		}
		callback(reply);
	});
};

exports.default = { retrieveFilteredWords: retrieveFilteredWords, client: client };