/* eslint-disable no-console */
import ds from 'dictionary-scrape';

const getDefinition = (word) => ds.getDictionary(word)
    .catch(err => console.log(err));

const getSynonyms = (word) => ds.getThesaurus(word)
  .catch(err => console.log(err));

export default { getDefinition, getSynonyms };
