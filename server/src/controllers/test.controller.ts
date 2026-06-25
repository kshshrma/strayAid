import { Request, Response, NextFunction } from 'express';
import { TestService } from '../services/test.service';

/**
 * Controller Layer for Test module.
 * Coordinates incoming HTTP parameters and forwards requests to Service Layer.
 * 
 * SOLID Principle: Single Responsibility.
 * This class is only responsible for parsing HTTP details and responding.
 */
export class TestController {
  /**
   * Handles GET /api/test request.
   */
  public static async getTestMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const name = req.query.name as string | undefined;
      
      // Request business logic from the service layer
      const message = await TestService.getWelcomeMessage(name);
      
      res.status(200).json({
        success: true,
        data: {
          message
        }
      });
    } catch (error) {
      // Forward the error to the global error middleware
      next(error);
    }
  }
}
