import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";
import DegreeCollection from "./degree.collection";
import TitleCollection from "./title.collection";
import EmployeeTypeCollection from "./employeeType.collection";
import SpecialityCollection from "./speciality.collection";

// DEGREE
const createDegree = async (degree: any, language = 'vi') => {
  const createdDegree = await DegreeCollection.create(degree);
  DegreeCollection.setDefaultLanguage(language);
  const data = await DegreeCollection.findOne({_id: createdDegree._id});
  data.setLanguage(language);
  return data;
}

const getDegree = async (fields: string[], language = 'vi') => {
  DegreeCollection.setDefaultLanguage(language);
  const data = await DegreeCollection.find({}, fields);
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

const getDegreeById = async (degreeId: string, language = 'vi') => {
  DegreeCollection.setDefaultLanguage(language);
  const degree = await DegreeCollection.findById(degreeId);
  return degree;
}


// TITLE
const createTitle = async (degree: any, language = 'vi') => {
  const createdTitle = await TitleCollection.create(degree);
  TitleCollection.setDefaultLanguage(language);
  const data = await TitleCollection.findOne({_id: createdTitle._id});
  return data;
}

const getTitle = async (fields: string[], language = 'vi') => {
  TitleCollection.setDefaultLanguage(language);
  const data = await TitleCollection.find({}, fields);
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

const getTitleById = async (degreeId: string, language = 'vi') => {
  TitleCollection.setDefaultLanguage(language);
  const degree = await TitleCollection.findById(degreeId);
  return degree;
}


// SPECIALITY
const createSpeciality = async (degree: any, language = 'vi') => {
  SpecialityCollection.setDefaultLanguage(language);
  const createdSpeciality = await SpecialityCollection.create(degree);
  const data = await SpecialityCollection.findOne({_id: createdSpeciality._id});
  data.setLanguage(language);
  return data;
}

const getSpeciality = async (fields: string[], language = 'vi') => {
  SpecialityCollection.setDefaultLanguage(language);
  const data = await SpecialityCollection.find({}, fields);
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

const getSpecialityById = async (degreeId: string, language = 'vi') => {
  SpecialityCollection.setDefaultLanguage(language);
  const degree = await SpecialityCollection.findById(degreeId);
  return degree;
}

// EMPLOYEETYPE
const createEmployeeType = async (employeeType: any, language = 'vi') => {
  const createdEmployeeType = await EmployeeTypeCollection.create(employeeType);
  EmployeeTypeCollection.setDefaultLanguage(language);
  const data = await EmployeeTypeCollection.findOne({_id: createdEmployeeType._id});
  data.setLanguage(language);
  return data;
}

const getEmployeeType = async (fields: string[], language = 'vi') => {
  EmployeeTypeCollection.setDefaultLanguage(language);
  const data = await EmployeeTypeCollection.find({}, fields);
  return data;
};

const updateEmployeeTypeById = async (employeeTypeId: string, employeeType: any) => {
  const updatedEmployeeType = await EmployeeTypeCollection.updateOne({_id: employeeTypeId}, {
    $set: {
      ...employeeType
    }
  });
  const data = await EmployeeTypeCollection.findOne({_id: employeeTypeId});
  return data;
}

const getEmployeeTypeById = async (employeeTypeId: string, language = 'vi') => {
  EmployeeTypeCollection.setDefaultLanguage(language);
  const employeeType = await EmployeeTypeCollection.findById(employeeTypeId);
  return employeeType;
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
  createEmployeeType,
  updateEmployeeTypeById,
  getEmployeeType,
  getEmployeeTypeById
};
