import crypto from 'crypto';
import { DB } from '../utils/db';
import { AppError } from '../utils/appError';
import { emitRealtimeEvent } from '../utils/socket';
import {
  Incident,
  Comment,
  CreateIncidentInput,
  CreateIncidentSchema,
  UpdateIncidentInput,
  UpdateIncidentSchema,
  CreateCommentInput,
  CreateCommentSchema,
  IncidentStatus,
} from '../types/incident.types';

/**
 * Service Layer for Incident Operations.
 * Contains pure business logic and triggers real-time socket events.
 */
export class IncidentService {
  /**
   * Fetch all incidents.
   */
  public static async getAllIncidents(): Promise<Incident[]> {
    return await DB.getIncidents();
  }

  /**
   * Fetch a single incident by ID.
   */
  public static async getIncidentById(id: string): Promise<Incident> {
    const incident = await DB.getIncidentById(id);
    if (!incident) {
      throw new AppError(`Incident with ID ${id} not found`, 404);
    }
    return incident;
  }

  /**
   * Create a new incident report.
   */
  public static async createIncident(input: CreateIncidentInput): Promise<Incident> {
    // Validate input data using Zod
    const validatedData = CreateIncidentSchema.parse(input);

    const now = new Date().toISOString();
    const newIncident: Incident = {
      ...validatedData,
      id: `inc-${crypto.randomUUID().substring(0, 8)}`,
      status: 'reported',
      createdAt: now,
      updatedAt: now,
      responderId: null,
    };

    const savedIncident = await DB.createIncident(newIncident);

    // Create default system comment for tracking history
    const systemComment: Comment = {
      id: `com-${crypto.randomUUID().substring(0, 8)}`,
      incidentId: savedIncident.id,
      authorName: 'System Log',
      text: `Emergency incident reported: "${savedIncident.title}". Status set to Reported.`,
      statusUpdate: 'reported',
      createdAt: now,
    };
    await DB.createComment(systemComment);

    // Emit Socket.io event for real-time dashboard update
    emitRealtimeEvent('incident:created', savedIncident);

    return savedIncident;
  }

  /**
   * Update an existing incident.
   */
  public static async updateIncident(id: string, input: UpdateIncidentInput): Promise<Incident> {
    // Validate input data using Zod
    const validatedData = UpdateIncidentSchema.parse(input);

    // Verify the incident exists
    const existing = await this.getIncidentById(id);

    const updates: Partial<Incident> = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    const updatedIncident = await DB.updateIncident(id, updates);

    // If status changed or responder changed, add a system comment
    const statusChanged = validatedData.status && validatedData.status !== existing.status;
    const responderChanged = validatedData.responderId !== undefined && validatedData.responderId !== existing.responderId;

    if (statusChanged || responderChanged) {
      let commentText = '';
      if (statusChanged && responderChanged) {
        commentText = `Incident status updated to ${validatedData.status} and assigned to volunteer ${validatedData.responderId || 'None'}.`;
      } else if (statusChanged) {
        commentText = `Incident status updated to ${validatedData.status}.`;
      } else if (responderChanged) {
        commentText = `Incident assigned to volunteer ${validatedData.responderId || 'None'}.`;
      }

      const systemComment: Comment = {
        id: `com-${crypto.randomUUID().substring(0, 8)}`,
        incidentId: id,
        authorName: 'System Log',
        text: commentText,
        statusUpdate: validatedData.status || null,
        createdAt: new Date().toISOString(),
      };
      await DB.createComment(systemComment);
      // Emit comment added event
      emitRealtimeEvent('comment:added', { incidentId: id, comment: systemComment });
    }

    // Emit socket event to notify clients of the change
    emitRealtimeEvent('incident:updated', updatedIncident);

    return updatedIncident;
  }

  /**
   * Fetch all comments for a specific incident.
   */
  public static async getCommentsForIncident(incidentId: string): Promise<Comment[]> {
    // Ensure the incident exists
    await this.getIncidentById(incidentId);
    return await DB.getComments(incidentId);
  }

  /**
   * Add a comment to an incident.
   */
  public static async addComment(incidentId: string, input: CreateCommentInput): Promise<Comment> {
    // Validate comment input
    const validatedData = CreateCommentSchema.parse(input);

    // Ensure the incident exists
    const incident = await this.getIncidentById(incidentId);

    const now = new Date().toISOString();
    const newComment: Comment = {
      ...validatedData,
      id: `com-${crypto.randomUUID().substring(0, 8)}`,
      incidentId,
      createdAt: now,
    };

    const savedComment = await DB.createComment(newComment);

    // If this comment contains a status update, cascade and update the incident status
    if (validatedData.statusUpdate && validatedData.statusUpdate !== incident.status) {
      await DB.updateIncident(incidentId, {
        status: validatedData.statusUpdate,
        updatedAt: now,
      });

      // Fetch the updated incident and broadcast update
      const updatedIncident = await DB.getIncidentById(incidentId);
      if (updatedIncident) {
        emitRealtimeEvent('incident:updated', updatedIncident);
      }
    }

    // Emit event that comment was added
    emitRealtimeEvent('comment:added', { incidentId, comment: savedComment });

    return savedComment;
  }
}
