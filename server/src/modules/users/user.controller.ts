import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { userService } from './user.service';

export class UserController {
  async getAll(req: AuthRequest, res: Response, next: Function) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const result = await userService.findAll(page, limit, search);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = await userService.findById(req.params.id as string);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = await userService.update(req.params.id as string, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: Function) {
    try {
      const result = await userService.delete(req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDevelopers(req: AuthRequest, res: Response, next: Function) {
    try {
      const developers = await userService.findDevelopers();
      res.json({ success: true, data: developers });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
