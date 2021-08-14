import authenticateMiddleware from './authenticate.middleware';
import authorizationMiddleware from './authorization.middleware';
import jwtMiddleware from './jwt.middleware';

export default {
  authenticate: authenticateMiddleware,
  jwt: jwtMiddleware,
  authorization: authorizationMiddleware
};
