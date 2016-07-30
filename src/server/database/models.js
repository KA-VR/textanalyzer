import mongoose from 'mongoose';
import wordSchema from './schemas';

const Word = mongoose.model('Word', wordSchema);

export default Word;
