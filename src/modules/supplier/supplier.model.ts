export interface SupplierModel {
  supplierCode: string;
  name: string;
  phoneNumber: string;
  email: string;
  company: string;
  supplierGroup?: any;
  supplierGroupId?: string;
  taxIdentificationNumber: string;
  address: Address;
  note: string;
  currentDebt: number;
  partnerId: number;
  totalPurchase: number;
  status: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  wardId: string;
  districtId: string;
  cityId: string;
}
