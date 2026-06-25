import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Incident, Comment } from '../types/incident.types';

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface for our JSON file schema
interface JsonDbSchema {
  incidents: Incident[];
  comments: Comment[];
}

// Initial mock data to seed when DB is empty
const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Injured Golden Retriever',
    description: 'Golden Retriever limping and seems to have an injured paw. Friendly but nervous. Needs immediate vet transfer.',
    animalType: 'dog',
    severity: 'critical',
    status: 'active',
    latitude: 40.785091,
    longitude: -73.968285,
    locationName: 'Central Park West & 81st St',
    reporterName: 'Sarah Jenkins',
    reporterPhone: '555-0199',
    reporterEmail: 'sarah.j@example.com',
    imageUrl: null,
    responderId: 'vol-102',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'inc-2',
    title: 'Stranded Kitten in Alley',
    description: 'Tiny black kitten stuck high up on a brick ledge behind the coffee shop. Meowing loudly, crying for help.',
    animalType: 'cat',
    severity: 'high',
    status: 'reported',
    latitude: 40.758896,
    longitude: -73.985130,
    locationName: 'Times Square Alleyway',
    reporterName: 'Carlos Diaz',
    reporterPhone: '555-0245',
    reporterEmail: 'carlos@example.com',
    imageUrl: null,
    responderId: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'inc-3',
    title: 'Dehydrated Pigeon',
    description: 'Found a pigeon on the concrete unable to fly due to extreme heat. Kept in shade, provided water, needs rehabilitation.',
    animalType: 'bird',
    severity: 'low',
    status: 'resolved',
    latitude: 40.748440,
    longitude: -73.985656,
    locationName: 'Empire State Building Plaza',
    reporterName: 'Emily Stone',
    reporterPhone: '555-0312',
    reporterEmail: 'emily.s@example.com',
    imageUrl: null,
    responderId: 'vol-104',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'inc-4',
    title: 'Injured Fawn in Suburbs',
    description: 'Small fawn with a cut on its leg spotted near the edge of the woods behind residential gardens.',
    animalType: 'other',
    severity: 'medium',
    status: 'dispatched',
    latitude: 40.706086,
    longitude: -74.008826,
    locationName: 'Wall Street Park Area',
    reporterName: 'David Miller',
    reporterPhone: '555-0456',
    reporterEmail: null,
    imageUrl: null,
    responderId: 'vol-101',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

const mockComments: Comment[] = [
  {
    id: 'com-1',
    incidentId: 'inc-1',
    authorName: 'System Log',
    text: 'Incident reported by Sarah Jenkins.',
    statusUpdate: 'reported',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'com-2',
    incidentId: 'inc-1',
    authorName: 'Dispatcher',
    text: 'Volunteer vol-102 (Marcus) dispatched to location.',
    statusUpdate: 'dispatched',
    createdAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
  },
  {
    id: 'com-3',
    incidentId: 'inc-1',
    authorName: 'Marcus (vol-102)',
    text: 'Arrived on scene. Dog is friendly, has a deep cut on right front paw. Securing him in the rescue crate now.',
    statusUpdate: 'active',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'com-4',
    incidentId: 'inc-3',
    authorName: 'Emily Stone',
    text: 'Pigeon reported.',
    statusUpdate: 'reported',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'com-5',
    incidentId: 'inc-3',
    authorName: 'Dr. Evelyn (Vet Clinic)',
    text: 'Pigeon was rehydrated and released successfully. Wing was not fractured, just mild sprain.',
    statusUpdate: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export class DB {
  private static supabase: SupabaseClient | null = null;
  private static isUsingSupabase = false;

  static {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      console.log('⚡ Connected to Supabase Cloud Database');
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.isUsingSupabase = true;
    } else {
      console.log('📂 Using Local JSON Database (File persistence)');
      this.ensureLocalFileDbExists();
    }
  }

  // Ensure JSON database exists and has seeds if empty
  private static ensureLocalFileDbExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialDb: JsonDbSchema = {
        incidents: mockIncidents,
        comments: mockComments,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    }
  }

  // Read JSON database file
  private static readLocalFile(): JsonDbSchema {
    this.ensureLocalFileDbExists();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as JsonDbSchema;
  }

  // Write JSON database file
  private static writeLocalFile(data: JsonDbSchema): void {
    this.ensureLocalFileDbExists();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- PUBLIC DB INTERFACES ---

  // Get all incidents
  public static async getIncidents(): Promise<Incident[]> {
    if (this.isUsingSupabase && this.supabase) {
      const { data, error } = await this.supabase
        .from('incidents')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data as Incident[];
    } else {
      const db = this.readLocalFile();
      // Return incidents sorted by newest first
      return [...db.incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  // Get incident by ID
  public static async getIncidentById(id: string): Promise<Incident | null> {
    if (this.isUsingSupabase && this.supabase) {
      const { data, error } = await this.supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null; // Postgrest single no rows
        throw error;
      }
      return data as Incident;
    } else {
      const db = this.readLocalFile();
      return db.incidents.find((i) => i.id === id) || null;
    }
  }

  // Create new incident
  public static async createIncident(incident: Incident): Promise<Incident> {
    if (this.isUsingSupabase && this.supabase) {
      const { data, error } = await this.supabase
        .from('incidents')
        .insert(incident)
        .select()
        .single();
      if (error) throw error;
      return data as Incident;
    } else {
      const db = this.readLocalFile();
      db.incidents.push(incident);
      this.writeLocalFile(db);
      return incident;
    }
  }

  // Update existing incident
  public static async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    if (this.isUsingSupabase && this.supabase) {
      const { data, error } = await this.supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Incident;
    } else {
      const db = this.readLocalFile();
      const index = db.incidents.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new Error(`Incident with ID ${id} not found`);
      }
      
      const updatedIncident: Incident = {
        ...db.incidents[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      db.incidents[index] = updatedIncident;
      this.writeLocalFile(db);
      return updatedIncident;
    }
  }

  // Get comments for an incident
  public static async getComments(incidentId: string): Promise<Comment[]> {
    if (this.isUsingSupabase && this.supabase) {
      const { data, error } = await this.supabase
        .from('comments')
        .select('*')
        .eq('incidentId', incidentId)
        .order('createdAt', { ascending: true });
      if (error) throw error;
      return data as Comment[];
    } else {
      const db = this.readLocalFile();
      return db.comments
        .filter((c) => c.incidentId === incidentId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }

  // Create a comment
  public static async createComment(comment: Comment): Promise<Comment> {
    if (this.isUsingSupabase && this.supabase) {
      const { data, error } = await this.supabase
        .from('comments')
        .insert(comment)
        .select()
        .single();
      if (error) throw error;
      return data as Comment;
    } else {
      const db = this.readLocalFile();
      db.comments.push(comment);
      this.writeLocalFile(db);
      return comment;
    }
  }
}
