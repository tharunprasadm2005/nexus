import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from './user.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/developers', authorize(Role.ADMIN, Role.PROJECT_MANAGER), userController.getDevelopers);
router.use(authorize(Role.ADMIN));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', validate(createUserSchema), userController.create);
router.put('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', userController.delete);

export default router;
