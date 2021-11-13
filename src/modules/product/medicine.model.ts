export interface medicineModel {
  ingredient: String,
  dosage: {
    value: Number,
    unit: String,
  }
  medicineCode: String,
  registrationNo: String,
  weight: {
    value: Number,
    unit: String,
  }
  packagingSize: String,
}

export default {};
