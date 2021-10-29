import mongoose from 'mongoose';
import loggerHelper from '@utils/logger.util';
import autoIncrement from 'mongoose-auto-increment';
import { MONGO_URL } from '../config';

const logger = loggerHelper.getLogger('mongo');
const connectWithRetry = (): void => {
  mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }, (err) => {
    if (err) {
      logger.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
      setTimeout(connectWithRetry, 5000);
    }
    logger.info('mongo connected');
  });
};



var connection = mongoose.createConnection(MONGO_URL);
 
autoIncrement.initialize(connection);


connectWithRetry();
