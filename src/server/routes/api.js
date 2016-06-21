import { Router } from 'express';
import apiController from '../controllers/apiController';

const router = new Router();


router.route('/analyze').get((req, res) => res.send('Hi'));
router.route('/analyze').post(apiController.analyze);

export default router;
