import express from 'express';
import apiRoute from './routes/api';
import cors from 'cors';
import bodyParser from 'body-parser';

const port = process.env.PORT || 8000;
const app = express();

app
  .use(cors())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use('/api', apiRoute);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listen to dis shit on: ${port}`);
});
