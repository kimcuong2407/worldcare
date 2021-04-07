import jwtUtil from "@app/utils/jwt.util";
import { v4 as uuidv4 } from 'uuid';

// Auth service
const authenticate = async (login: string, password: string) => {
  const userId = '';
  const sessionId = uuidv4();

  const token = jwtUtil.issueToken(userId, sessionId);

  return {
    userId,
    sessionId,
    token
  }
}

export default {
  authenticate
};
