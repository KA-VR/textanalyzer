import request from 'request';
import cheerio from 'cheerio';
import Promise from 'bluebird';

function url(word) {
  return `http://app.vocabulary.com/app/1.0/dictionary/search?word=${word}&tz=America%2FNew_York&tzo=-300&appver=1.0.0`;
}

function sentenceUrl(word) {
  return `http://corpus.vocabulary.com/api/1.0/examples.json?query=${word}&maxResults=24&startOffset=0&filter=3&tz=America%2FNew_York&tzo=-300&appver=1.0.0`;
}

class Word {
  constructor(word) {
    this.name = word;
    this.vocabDotComUrl = url(word);
    this.vocabDotComSentenceURL = sentenceUrl(word);
  }
}

function getVocabDotComDOM(word, callback) {
  request(url(word), (error, response, body) => {
    if (!error) {
      callback(null, body);
    } else {
      callback(error);
    }
  });
}

function convertVocabDotComDomToJSON(body, callback) {
  try {
    const $ = cheerio.load(body);
    const wordObj = new Word($('h1').text());

    // descriptions
    wordObj.shortDescription = $('p.short').text();
    wordObj.longDescription = $('p.long').text();

    // definitions
    const definitions = [];
    // If page has "Primary Meaning" definitions, we should use
    // these and not the general defintiions
    // Checks for "Primary Meaning" definitions
    // if ($('.def.selected').length !== 0) {
    //   $('.definitions').find('.definitionNavigator').find('tr')
    //     .each((i, el) => {
    //       // Add the word Form to the sentence
    //       const defLength = $(el).find('.posList').children().length;
    //       for (let y = 0; y < defLength; y++) {
    //         const defObj = {};
    //         defObj.partOfSpeech = $(el).find('.posList').children()[y].children[0].data;
    //         defObj.definition = $(el).find('.def')[y].children[0].data;
    //         definitions.push(defObj);
    //       }
    //     });
    //   $('.defContent').each((i, el) => {
    //     const instances = $(el).find('.instances').first();
    //     const typeOfInstance = instances.find('dt').text().toLowerCase();
    //     let synonyms = null;
    //     if (typeOfInstance.indexOf('synonyms') !== -1) {
    //       synonyms = instances.find('dd a')
    //         .map((synIndex, element) => $(element).text())
    //         .get();
    //     }
    //   });
    //   console.log('asdkjfalksfjsdlkfjasflskaj');
    // } else {
    $('.section.definition .sense').each((i, el) => {
      const defObj = {};
      const instances = $(el).find('.defContent .instances').first();
      const typeOfInstance = instances.find('dt').text().toLowerCase();
      let synonyms = null;
      if (typeOfInstance.indexOf('synonyms') !== -1) {
        synonyms = instances.find('dd a')
          .map((synIndex, element) => $(element).text())
          .get();
        console.log(synonyms);
      }
      // Add the word Form to the sentence
      const originalString = $(el).find('h3.definition').text()
        .replace(/\s\s+/g, ' ')
        .trim();
      defObj.synonyms = (synonyms) ? synonyms.slice(0) : [];
      defObj.partOfSpeech = originalString.split(' ')[0];
      defObj.definition = originalString.split(' ').slice(1).join(' ');
      definitions.push(defObj);
    });
    // }
    wordObj.definitions = definitions;
    if (definitions.length > 0) {
      const $sections = $('.sectionHeader');
      const el = $sections[$sections.length - 2];
      const family = $(el).next().attr('data');
      const jsonFamily = JSON.parse(family);
      wordObj.family = jsonFamily;
    }

    callback(null, wordObj);
  } catch (e) {
    callback(e);
  }
}

// Promise Functions ====================
function getVocabDotComDomPromise(word) {
  return new Promise((resolve, reject) => {
    getVocabDotComDOM(word, (err, body) => {
      if (!err) resolve(body);
      else reject(err);
    });
  });
}

function convertVocabDotComDomToJSONPromise(body) {
  return new Promise((resolve, reject) => {
    convertVocabDotComDomToJSON(body, (err, wordJSON) => {
      if (!err) resolve(wordJSON);
      else reject(err);
    });
  });
}
// End Promise Functions ====================

class WordFetcher {
  constructor() {
    this.getWord = word => new Promise((resolve, reject) => {
      this.getVocabDotComDOM(word).then(this.convertVocabDotComDomToJSON).then(wordObj => {
        resolve(wordObj);
      })
      .catch(e => {
        reject(e);
      });
    });
    this.url = url;
    this.sentenceUrl = sentenceUrl;
    this.getVocabDotComDOM = getVocabDotComDomPromise;
    this.convertVocabDotComDomToJSON = convertVocabDotComDomToJSONPromise;
  }
}

module.exports = WordFetcher;
