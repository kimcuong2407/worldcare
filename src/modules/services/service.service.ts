import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import UserCollection from '../user/user.collection';
import ServiceCollection from './service.collection';

// DEGREE
const createService = async (service: any, language = 'vi') => {
  const createdService = await ServiceCollection.create(service);
  ServiceCollection.setDefaultLanguage(language);
  const data = await ServiceCollection.findOne({_id: createdService._id});
  data.setLanguage(language);
  return data;
}

const getService = async (language = 'vi') => {
  ServiceCollection.setDefaultLanguage(language);
  const data = await ServiceCollection.paginate({});
  return data;
};

const updateServiceById = async (serviceId: string, service: any) => {
  const updatedService = await ServiceCollection.updateOne({_id: serviceId}, {
    $set: {
      ...service
    }
  });
  const data = await ServiceCollection.findOne({_id: serviceId});
  return data;
}

const getServiceByIdOrSlug = async (serviceId: string, language = 'vi') => {
  ServiceCollection.setDefaultLanguage(language);
  let service;
  if( Types.ObjectId.isValid(serviceId)) {
    service = await ServiceCollection.findById(serviceId);
  } else {
    service = await ServiceCollection.findOne({slug: serviceId}).populate('speciality', 'name');
  }

  return service;
}

const deleteService = async (serviceId: string) => {
  return ServiceCollection.deleteOne({_id: serviceId})
}



export default {
  createService,
  getService,
  updateServiceById,
  getServiceByIdOrSlug,
  deleteService,
};
