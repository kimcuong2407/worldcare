import { makeQuery } from '@app/core/database/query';
import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import UserCollection from '../user/user.collection';
import userService from '../user/user.service';

// Auth service
const authenticate = async (login: string, password: string) => {
  const sessionId = uuidv4();
  const user = await UserCollection.findOne({
    $or: [
      {
        email: login
      },
      {
        username: login
      }
    ]
  }).lean().exec();
  if(!user) {
    throw new UnAuthenticated();
  }
  const isPasswordMatched = await bcryptUtil.comparePassword(password, get(user, 'password'));
  if(!isPasswordMatched) {
    throw new UnAuthenticated();
  }
  const token = jwtUtil.issueToken(get(user, '_id'), sessionId);

  return {
    userId: get(user, '_id'),
    sessionId,
    token
  }
}


// Auth service
const registerUser = async (phoneNumber: string, email: string, password: string) => {
  const sessionId = uuidv4();
  const encryptedPassword = await bcryptUtil.generateHash(password);
    const user = {
      username: 'admin',
      phoneNumber: phoneNumber,
      email: email,
      password: encryptedPassword,
    };
  const createdUser = await userService.createUser(user);
  const token = jwtUtil.issueToken(get(createdUser, '_id'), sessionId);

  return {
    userId: get(user, '_id'),
    sessionId,
    token
  }
}

export default {
  authenticate,
  registerUser,
};
