import { Router } from 'express';
import apiController from '../controllers/apiController';

const router = new Router();

router.route('/analyze').get(apiController.analyze);

export default router;
