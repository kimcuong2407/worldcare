import jwt from 'jsonwebtoken';
import { TOKEN_EXPIRES_IN_SECONDS } from '@core/constant';
import { get } from 'lodash';
import { UnauthorizedError } from '@app/core/types/ErrorTypes';

const {
  JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY,
} = process.env;


const privateKey = JWT_PRIVATE_KEY ? Buffer.from(JWT_PRIVATE_KEY, 'base64') : undefined;
const publicKey = JWT_PUBLIC_KEY ? Buffer.from(JWT_PUBLIC_KEY, 'base64') : undefined;

const signToken = (payload: any) => jwt.sign(payload, privateKey, {
  algorithm: 'RS256',
  expiresIn: TOKEN_EXPIRES_IN_SECONDS,
});

const issueToken = (sub: string, partnerId: string, sessionId: string) => signToken(
  {
    sub,
    jti: sessionId,
    aud: partnerId,
  },
);


const verifyToken = (token: string) => {
  try {
    const tokenDetail: any = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    const { jti, sub, aud } = tokenDetail || {};
    return {
      sessionId: jti,
      partnerId: aud,
      id: sub,
    };
  } catch (error) {
    throw new UnauthorizedError(get(error, 'message'));
  }
};

export default { signToken, verifyToken, issueToken };
