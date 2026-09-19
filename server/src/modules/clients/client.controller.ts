import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { clientService } from './client.service';

export class ClientController {
  async getAll(req: AuthRequest, res: Response, next: Function) {
    try {
      const result = await clientService.getAll();
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: Function) {
    try {
      const id = req.params.id as string;
      const client = await clientService.getById(id);
      res.json({ success: true, client });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: Function) {
    try {
      const client = await clientService.create(req.body);
      res.status(201).json({ success: true, client });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: Function) {
    try {
      const id = req.params.id as string;
      const client = await clientService.update(id, req.body);
      res.json({ success: true, client });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: Function) {
    try {
      const id = req.params.id as string;
      await clientService.delete(id);
      res.json({ success: true, message: 'Client deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const clientController = new ClientController();