import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";

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

export default {
  authenticate
};
