import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize(Role.ADMIN), dashboardController.getAdminStats);
router.get('/pm', authorize(Role.PROJECT_MANAGER), dashboardController.getPMStats);
router.get('/developer', authorize(Role.DEVELOPER), dashboardController.getDeveloperStats);

export default router;
