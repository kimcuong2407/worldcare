import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const CountrySchema = new mongoose.Schema({
_id: Number,
  name: String,
  internationalName: String,
}, {
  timestamps: true,
});

const CountryCollection = mongoose.model(
  'country',
  CountrySchema,
  'country',
);

export default CountryCollection;