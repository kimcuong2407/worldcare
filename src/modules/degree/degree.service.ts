import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";
import DegreeCollection from "./degree.collection";

const createDegree = async (degree: any, language = 'vi') => {
  const createdDegree = await DegreeCollection.create(degree);
  console.log(createdDegree)
  const data = await DegreeCollection.findOne({_id: createdDegree._id});
  data.setLanguage(language);
  return data;
}

const getDegree = async (fields: string[], language = 'vi') => {
  const data = await DegreeCollection.find({}, fields);
  // data.setLanguage(language);
  return data;
};

const updateDegreeById = async (degreeId: string, degree: any) => {
  const updatedDegree = await DegreeCollection.updateOne({_id: degreeId}, {
    $set: {
      ...degree
    }
  });
  const data = await DegreeCollection.findOne({_id: degreeId});
  return data;
}

const getDegreeById = async (degreeId: string) => {
  const degree = await DegreeCollection.findById(degreeId);
  degree.setLanguage('en');
  return degree.toJSON();
}


export default {
  createDegree,
  getDegree,
  updateDegreeById,
  getDegreeById,
};
