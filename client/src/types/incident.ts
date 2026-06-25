export type AnimalType = 'dog' | 'cat' | 'bird' | 'other';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'dispatched' | 'active' | 'resolving' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  description: string;
  animalType: AnimalType;
  severity: Severity;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  locationName: string;
  reporterName?: string | null;
  reporterPhone?: string | null;
  reporterEmail?: string | null;
  imageUrl?: string | null;
  responderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  animalType: AnimalType;
  severity: Severity;
  latitude: number;
  longitude: number;
  locationName: string;
  reporterName?: string | null;
  reporterPhone?: string | null;
  reporterEmail?: string | null;
  imageUrl?: string | null;
}

export interface UpdateIncidentInput {
  title?: string;
  description?: string;
  animalType?: AnimalType;
  severity?: Severity;
  status?: IncidentStatus;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  reporterName?: string | null;
  reporterPhone?: string | null;
  reporterEmail?: string | null;
  imageUrl?: string | null;
  responderId?: string | null;
}

export interface Comment {
  id: string;
  incidentId: string;
  authorName: string;
  text: string;
  statusUpdate?: IncidentStatus | null;
  createdAt: string;
}

export interface CreateCommentInput {
  authorName: string;
  text: string;
  statusUpdate?: IncidentStatus | null;
}
