/* eslint-disable new-cap */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const wordSchema = new Schema({
  name: String,
  def: Array,
  syn: Array,
  ant: Array,
});

export default wordSchema;
