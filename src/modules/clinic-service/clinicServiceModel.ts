
export interface ClinicServiceModel {
  _id: string;
  clinicServiceId: string;
  name: string;
  description: string;
  status: string;
  partnerId: number;
  serviceGroupId: string;
  price: number;
  priceUnit: string;
  serviceGroupIdSequence: number;
  partner: any;
  // Audit fields
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
