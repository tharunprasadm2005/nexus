import { Router } from 'express';
import { activityController } from './activity.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/global', activityController.getGlobalFeed);
router.get('/project/:projectId', activityController.getProjectFeed);
router.get('/task/:taskId', activityController.getTaskFeed);
router.get('/missed', activityController.getMissedEvents);

export default router;
