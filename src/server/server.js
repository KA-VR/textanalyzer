import express from 'express';
import apiRoute from './routes/api';

const port = process.env.PORT || 8000;
const app = express();

app.use('/api', apiRoute);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listen to dis shit on: ${port}`);
});
