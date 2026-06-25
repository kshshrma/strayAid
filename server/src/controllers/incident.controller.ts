import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IncidentService } from '../services/incident.service';
import { AppError } from '../utils/appError';

/**
 * Controller Layer for Incident Module.
 * Parses HTTP request data, calls Service Layer, and sends response.
 */
export class IncidentController {
  /**
   * GET /api/incidents
   * Fetch list of all incidents.
   */
  public static async getAllIncidents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const incidents = await IncidentService.getAllIncidents();
      res.status(200).json({
        success: true,
        data: incidents,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/incidents/:id
   * Fetch details of a single incident.
   */
  public static async getIncidentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const incident = await IncidentService.getIncidentById(id);
      res.status(200).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/incidents
   * Report a new emergency.
   */
  public static async createIncident(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const incident = await IncidentService.createIncident(req.body);
      res.status(201).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
        next(new AppError(`Validation failed: ${issues}`, 400));
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /api/incidents/:id
   * Update incident fields (e.g. status, responder).
   */
  public static async updateIncident(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const incident = await IncidentService.updateIncident(id, req.body);
      res.status(200).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
        next(new AppError(`Validation failed: ${issues}`, 400));
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/incidents/:id/comments
   * Retrieve comments timeline for an incident.
   */
  public static async getComments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const comments = await IncidentService.getCommentsForIncident(id);
      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/incidents/:id/comments
   * Add a new comment (and optional status update) to an incident.
   */
  public static async addComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const comment = await IncidentService.addComment(id, req.body);
      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
        next(new AppError(`Validation failed: ${issues}`, 400));
        return;
      }
      next(error);
    }
  }
}
