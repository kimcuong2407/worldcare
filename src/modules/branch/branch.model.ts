import mongoose from 'mongoose';

export interface BranchModel extends mongoose.Document {
  name: string;
  companyCode: String;
  description: string;
  email: string;
  phoneNumber: string;
  speciality: Array<string>;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
  } ;
  workingHours: [object];
  hospitalSettings: {
    slotTime: number,
    capacityPerSlot: number,
  }
  logo: string;
  photos: Array<string>;
  lastActivity: Date;
  slug: string;
}

export default {};
