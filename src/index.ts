import './moduleAlias';
import 'dotenv/config';
import '@core/database/mongo';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// import compression from 'compression';

import loggerHelper from '@utils/logger.util';
import { ACCEPTED_LANGUAGES, PORT } from '@app/core/config';
import routes from './routes';
import handleError from './utils/errorHandler.util';
import './core/casbin';

const logger = loggerHelper.getLogger('main');

const app = express();

// app.use(compression({ level: COMPRESSION_LEVEL }));
const parseLanguage = (req: express.Request, res: express.Response, next: express.NextFunction)=>{
  const language: string = req.acceptsLanguages()[0];
  req.language = ACCEPTED_LANGUAGES.includes(language) ? language : 'vi';
  next();
}
app.get('/', (req, res) => {
  res.send('External sever error!');
});
app.use(parseLanguage)

app.use(cors());

app.use(bodyParser.json(
  {
    limit: '20mb',
  },
));

routes(app);

app.use(handleError);

app.listen(PORT, () => {
  logger.info(`App listening on port http://localhost:${PORT}`);

});
