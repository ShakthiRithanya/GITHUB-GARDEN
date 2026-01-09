import { Router } from 'express';
import { login, callback } from '../controllers/authController';

const router = Router();

router.get('/github', login);
router.get('/github/callback', callback);

export default router;
