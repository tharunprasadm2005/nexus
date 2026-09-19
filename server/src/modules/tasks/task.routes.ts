import { Router } from 'express';
import { taskController } from './task.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { checkProjectAccess, checkTaskAccess } from '../../middleware/projectAccess.middleware';
import { createTaskSchema, updateTaskSchema, taskFiltersSchema } from './task.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/my-tasks', validate(taskFiltersSchema, 'query'), taskController.getMyTasks);
router.get('/:id', checkTaskAccess(), taskController.getById);
router.put('/:id', checkTaskAccess(), validate(updateTaskSchema), taskController.update);

const projectTaskRouter = Router({ mergeParams: true });
projectTaskRouter.use(authenticate);
projectTaskRouter.get('/', checkProjectAccess('projectId'), validate(taskFiltersSchema, 'query'), taskController.getByProject);
projectTaskRouter.post(
  '/',
  authorize(Role.ADMIN, Role.PROJECT_MANAGER),
  checkProjectAccess('projectId'),
  validate(createTaskSchema),
  taskController.create
);

export { projectTaskRouter };
export default router;
