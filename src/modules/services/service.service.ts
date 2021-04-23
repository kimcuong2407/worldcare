import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";
import ServiceCollection from "./service.collection";

// DEGREE
const createService = async (category: any, language = 'vi') => {
  const createdService = await ServiceCollection.create(category);
  ServiceCollection.setDefaultLanguage(language);
  const data = await ServiceCollection.findOne({_id: createdService._id});
  data.setLanguage(language);
  return data;
}

const getService = async (fields: string[], language = 'vi') => {
  ServiceCollection.setDefaultLanguage(language);
  const data = await ServiceCollection.find({}, fields);
  return data;
};

const updateServiceById = async (categoryId: string, category: any) => {
  const updatedService = await ServiceCollection.updateOne({_id: categoryId}, {
    $set: {
      ...category
    }
  });
  const data = await ServiceCollection.findOne({_id: categoryId});
  return data;
}

const getServiceByIdOrSlug = async (categoryId: string, language = 'vi') => {
  ServiceCollection.setDefaultLanguage(language);
  let category;
  if( Types.ObjectId.isValid(categoryId)) {
    category = await ServiceCollection.findById(categoryId);
  } else {
    category = await ServiceCollection.findOne({slug: categoryId}).populate('speciality', 'name');
  }

  return category;
}

const deleteService = async (categoryId: string) => {
  return ServiceCollection.deleteOne({_id: categoryId})
}



export default {
  createService,
  getService,
  updateServiceById,
  getServiceByIdOrSlug,
  deleteService,
};
