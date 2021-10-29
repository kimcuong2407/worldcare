import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import zalo from '@app/core/zalo';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, isNil, omitBy } from 'lodash';
import moment from 'moment';
import { Query, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import SpecialityCollection from '../configuration/speciality.collection';
import hospitalService from '../hospital/hospital.service';
import ContactCollection from './contact.collection';

// DEGREE
const createContact = async (contact: any) => {
  const {
    name,
    message,
    phoneNumber,
   } = contact;

  await ContactCollection.create(contact)
 
  await zalo.sendZaloMessage(`Khách hàng ${name},SĐT: ${phoneNumber} vừa thực hiện liên hệ, nội dung liên hệ: ${message}`);
  return true;
}

const fetchContact = async () => {
  const query: any = {};
  
  const data = await ContactCollection.paginate(query)
    .populate('customer', ['name', 'phoneNumber'])
    .populate('hospital', 'hospitalName')
    .populate('service', 'name');

  return data;
};

const updateContactById = async (contactId: string, contact: any) => {
  const { customer, time, serviceId, hospitalId, message, source, status } = contact;
  const { phoneNumber, name, email } = customer || {};
  let customerInfo;
  if (customer) {
    customerInfo = await CustomerCollection.findOneAndUpdate(
      { phoneNumber, name },
      { phoneNumber, name, email },
      { upsert: true, new: true }).exec();
  }
  let updatedInfo: any = {
    customer: get(customerInfo, '_id'),
    time,
    service: serviceId,
    hospital: hospitalId,
    message,
    source,
    status,
  };
  updatedInfo = omitBy(updatedInfo, isNil);
  const updatedContact = await ContactCollection.updateOne({ _id: contactId }, {
    $set: {
      ...updatedInfo
    }
  });
  const data = await getContactById(contactId);
  return data;
}

const getContactById = async (contactId: string, isRaw = false) => {
  if (isRaw) {
    return ContactCollection.findById(contactId).lean();
  }

  let contact = await ContactCollection.findById(contactId)
  .populate('customer', ['name', 'phoneNumber'])
  .populate('hospital', 'hospitalName')
  .populate('speciality', 'name')
    .populate('service', 'name');

  return contact;
}

const deleteContact = async (contactId: string) => {
  return ContactCollection.updateOne({ _id: contactId }, { deletedAt: new Date() })
}

export default {
  createContact,
  fetchContact,
  updateContactById,
  getContactById,
  deleteContact,
};
