import { Router } from 'express';
import { clientController } from './client.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createClientSchema, updateClientSchema } from './client.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', clientController.getAll);
router.get('/:id', clientController.getById);
router.post('/', authorize(Role.ADMIN), validate(createClientSchema), clientController.create);
router.put('/:id', authorize(Role.ADMIN), validate(updateClientSchema), clientController.update);
router.delete('/:id', authorize(Role.ADMIN), clientController.delete);

export default router;