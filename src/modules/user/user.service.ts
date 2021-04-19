import casbin from "@app/core/casbin";
import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";

// Auth service
const getUserProfileById = async (userId: string) => {
  const profile = await UserCollection.findOne({_id: userId}).lean().exec();
  const roles = await casbin.enforcer.getRolesForUser(userId);
  return {
    ...profile,
    roles,
  }
};

export default {
  getUserProfileById
};
