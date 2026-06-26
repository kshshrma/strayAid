import Constants from 'expo-constants';
import type {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
  Comment,
  CreateCommentInput,
} from '../types/incident';

// Determine the packing host local IP address to allow communication on physical devices running Expo Go
const hostUri = Constants.expoConfig?.hostUri || '';
const hostIp = hostUri.split(':')[0] || 'localhost';

export const BACKEND_URL = `http://${hostIp}:5000`;
export const API_BASE_URL = `${BACKEND_URL}/api/incidents`;

console.log(`📡 Mobile: Configured API Endpoint Host linking to: ${BACKEND_URL}`);

/**
 * Service client for React Native mobile client to communicate with StrayAid AEOS Express API.
 */
export class IncidentServiceClient {
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
   * Fetch all incidents from backend API
   */
  public static async getAllIncidents(): Promise<Incident[]> {
    const res = await fetch(API_BASE_URL);
    return this.handleResponse<Incident[]>(res);
  }

  /**
   * Fetch single incident detail by ID
   */
  public static async getIncidentById(id: string): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    return this.handleResponse<Incident>(res);
  }

  /**
   * Submit new emergency incident report
   */
  public static async createIncident(input: CreateIncidentInput): Promise<Incident> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return this.handleResponse<Incident>(res);
  }

  /**
   * Update incident fields (e.g. change status / responder)
   */
  public static async updateIncident(id: string, input: UpdateIncidentInput): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return this.handleResponse<Incident>(res);
  }

  /**
   * Fetch incident action log comments
   */
  public static async getComments(incidentId: string): Promise<Comment[]> {
    const res = await fetch(`${API_BASE_URL}/${incidentId}/comments`);
    return this.handleResponse<Comment[]>(res);
  }

  /**
   * Add dispatcher/field comment log (optionally changing case status)
   */
  public static async addComment(incidentId: string, input: CreateCommentInput): Promise<Comment> {
    const res = await fetch(`${API_BASE_URL}/${incidentId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return this.handleResponse<Comment>(res);
  }
}
