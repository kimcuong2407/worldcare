
export interface SupplierModel {
  supplierId: string;
  name: string;
  phoneNumber: string;
  email: string;
  company: string;
  supplierGroup: string;
  taxIdentificationNumber: string;
  address: Address;
  note: string;
  currentDebt: number;
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
