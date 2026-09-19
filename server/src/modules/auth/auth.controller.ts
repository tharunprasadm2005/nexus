import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { authService } from './auth.service';
import { LoginInput, RegisterInput } from './auth.validation';

export class AuthController {
  async login(req: AuthRequest, res: Response, next: Function) {
    try {
      const result = await authService.login(req.body as LoginInput, res);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async register(req: AuthRequest, res: Response, next: Function) {
    try {
      const result = await authService.register(req.body as RegisterInput);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: Function) {
    try {
      const token = req.cookies?.refreshToken;
      const result = await authService.refreshToken(token, res);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user;
      if (user) {
        await authService.logout(user.userId);
      }
      res.clearCookie('refreshToken');
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
