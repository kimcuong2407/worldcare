import {ClinicServiceModel} from '@modules/clinic-service/clinicServiceModel';

export interface ClinicServiceGroupModel {
  _id: string;
  serviceGroupCode: string;
  name: string;
  description?: string;
  status: string;
  branchId: number;
  partner?: any;
  clinicServices?: ClinicServiceModel[];
  // Audit fields
  createdBy?: string;
  updatedBy?: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
