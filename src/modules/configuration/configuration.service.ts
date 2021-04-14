import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";
import TitleCollection from "./degree.collection";
import DegreeCollection from "./degree.collection";
import SpecialityCollection from "./speciality.collection";

const createDegree = async (degree: any, language = 'vi') => {
  const createdDegree = await DegreeCollection.create(degree);
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



const createTitle = async (degree: any, language = 'vi') => {
  const createdTitle = await TitleCollection.create(degree);
  const data = await TitleCollection.findOne({_id: createdTitle._id});
  data.setLanguage(language);
  return data;
}

const getTitle = async (fields: string[], language = 'vi') => {
  const data = await TitleCollection.find({}, fields);
  // data.setLanguage(language);
  return data;
};

const updateTitleById = async (degreeId: string, degree: any) => {
  const updatedTitle = await TitleCollection.updateOne({_id: degreeId}, {
    $set: {
      ...degree
    }
  });
  const data = await TitleCollection.findOne({_id: degreeId});
  return data;
}

const getTitleById = async (degreeId: string) => {
  const degree = await TitleCollection.findById(degreeId);
  degree.setLanguage('en');
  return degree.toJSON();
}



const createSpeciality = async (degree: any, language = 'vi') => {
  const createdSpeciality = await SpecialityCollection.create(degree);
  const data = await SpecialityCollection.findOne({_id: createdSpeciality._id});
  data.setLanguage(language);
  return data;
}

const getSpeciality = async (fields: string[], language = 'vi') => {
  const data = await SpecialityCollection.find({}, fields);
  // data.setLanguage(language);
  return data;
};

const updateSpecialityById = async (degreeId: string, degree: any) => {
  const updatedSpeciality = await SpecialityCollection.updateOne({_id: degreeId}, {
    $set: {
      ...degree
    }
  });
  const data = await SpecialityCollection.findOne({_id: degreeId});
  return data;
}

const getSpecialityById = async (degreeId: string) => {
  const degree = await SpecialityCollection.findById(degreeId);
  degree.setLanguage('en');
  return degree.toJSON();
}
export default {
  createTitle,
  getTitle,
  updateTitleById,
  getTitleById,
  createDegree,
  getDegree,
  updateDegreeById,
  getDegreeById,
    createSpeciality,
  getSpeciality,
  updateSpecialityById,
  getSpecialityById,
};
