import type {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
  Comment,
  CreateCommentInput,
} from '../types/incident';

/**
 * Service Client for communication with backend emergency API endpoints.
 */
export class IncidentServiceClient {
  private static baseUrl = '/api/incidents';

  /**
   * Helper to handle response parsing and error propagation
   */
  private static async handleResponse<T>(res: Response): Promise<T> {
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const responseData = isJson ? await res.json() : null;

    if (!res.ok) {
      const message = responseData?.message || `HTTP Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return responseData.data as T;
  }

  /**
   * Fetch all emergency incidents
   */
  public static async getAllIncidents(): Promise<Incident[]> {
    const res = await fetch(this.baseUrl);
    return this.handleResponse<Incident[]>(res);
  }

  /**
   * Fetch single emergency incident by ID
   */
  public static async getIncidentById(id: string): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    return this.handleResponse<Incident>(res);
  }

  /**
   * Submit a new emergency incident report
   */
  public static async createIncident(input: CreateIncidentInput): Promise<Incident> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return this.handleResponse<Incident>(res);
  }

  /**
   * Update fields of an incident (e.g. status, responder assignment)
   */
  public static async updateIncident(id: string, input: UpdateIncidentInput): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return this.handleResponse<Incident>(res);
  }

  /**
   * Retrieve comment/update timeline for a case
   */
  public static async getComments(incidentId: string): Promise<Comment[]> {
    const res = await fetch(`${this.baseUrl}/${incidentId}/comments`);
    return this.handleResponse<Comment[]>(res);
  }

  /**
   * Add comment / update note to a case (optionally change status)
   */
  public static async addComment(incidentId: string, input: CreateCommentInput): Promise<Comment> {
    const res = await fetch(`${this.baseUrl}/${incidentId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return this.handleResponse<Comment>(res);
  }
}
