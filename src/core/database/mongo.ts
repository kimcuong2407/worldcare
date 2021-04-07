import mongoose from 'mongoose';
import loggerHelper from '@utils/logger.util';

const logger = loggerHelper.getLogger('mongo');
const connectWithRetry = (): void => {
  mongoose.connect(process.env.MONGO_URL, {
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

connectWithRetry();
