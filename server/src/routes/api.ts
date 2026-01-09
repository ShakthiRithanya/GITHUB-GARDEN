import { Router } from 'express';
import { getMyStats } from '../controllers/statsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateToken, getMyStats);

export default router;
