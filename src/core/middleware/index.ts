import authenticateMiddleware from './authenticate.middleware';
import authorizationMiddleware from './authorization.middleware';

export default {
  authenticate: authenticateMiddleware,
  authorization: authorizationMiddleware
};
