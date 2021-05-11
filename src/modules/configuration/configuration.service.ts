import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";
import DegreeCollection from "./degree.collection";
import TitleCollection from "./title.collection";
import EmployeeGroupCollection from "./employeeGroup.collection";
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

const updateSpecialityById = async (specialityId: string, speciality: any) => {
  const updatedSpeciality = await SpecialityCollection.updateOne({_id: specialityId}, {
    $set: {
      ...speciality
    }
  });
  const data = await SpecialityCollection.findOne({_id: specialityId});
  return data;
}

const getSpecialityById = async (degreeId: string, language = 'vi') => {
  SpecialityCollection.setDefaultLanguage(language);
  const degree = await SpecialityCollection.findById(degreeId);
  return degree;
}

// EMPLOYEETYPE
const createEmployeeGroup = async (employeeGroup: any, language = 'vi') => {
  const createdEmployeeGroup = await EmployeeGroupCollection.create(employeeGroup);
  EmployeeGroupCollection.setDefaultLanguage(language);
  const data = await EmployeeGroupCollection.findOne({_id: createdEmployeeGroup._id});
  data.setLanguage(language);
  return data;
}

const getEmployeeGroup = async (fields: string[], language = 'vi') => {
  EmployeeGroupCollection.setDefaultLanguage(language);
  const data = await EmployeeGroupCollection.find({}, fields);
  return data;
};

const updateEmployeeGroupById = async (employeeGroupId: string, employeeGroup: any) => {
  const updatedEmployeeGroup = await EmployeeGroupCollection.updateOne({_id: employeeGroupId}, {
    $set: {
      ...employeeGroup
    }
  });
  const data = await EmployeeGroupCollection.findOne({_id: employeeGroupId});
  return data;
}

const getEmployeeGroupById = async (employeeGroupId: string, language = 'vi') => {
  EmployeeGroupCollection.setDefaultLanguage(language);
  const employeeGroup = await EmployeeGroupCollection.findById(employeeGroupId);
  return employeeGroup;
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
  createEmployeeGroup,
  updateEmployeeGroupById,
  getEmployeeGroup,
  getEmployeeGroupById
};
