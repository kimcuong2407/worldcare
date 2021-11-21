import mongoose from 'mongoose';
const MedicineSchema = new mongoose.Schema({
  code: {
    type: String,
  },
  name: String,
  registrationNo: String,
  element: String,
  content: String,
  manufacturer: String,
  country: String,
  package: String,
  unit: String,
}, {
  timestamps: true,
});

const MedicineCollection = mongoose.model(
  'medicines',
  MedicineSchema,
  'medicines',
);

export default MedicineCollection;