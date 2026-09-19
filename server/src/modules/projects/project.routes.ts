import { Router } from 'express';
import { projectController } from './project.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { checkProjectAccess } from '../../middleware/projectAccess.middleware';
import { createProjectSchema, updateProjectSchema } from './project.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', projectController.getAll);
router.get('/:id', checkProjectAccess('id'), projectController.getById);
router.post('/', authorize(Role.ADMIN, Role.PROJECT_MANAGER), validate(createProjectSchema), projectController.create);
router.put('/:id', authorize(Role.ADMIN, Role.PROJECT_MANAGER), checkProjectAccess('id'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', authorize(Role.ADMIN), projectController.delete);

export default router;
