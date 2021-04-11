import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";

// Auth service
const getUserProfileById = async (userId: string) => UserCollection.findOne({_id: userId}).lean().exec();

export default {
  getUserProfileById
};
