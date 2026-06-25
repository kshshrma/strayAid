import { z } from 'zod';

// Zod schemas for validation
export const AnimalTypeSchema = z.enum(['dog', 'cat', 'bird', 'other']);
export type AnimalType = z.infer<typeof AnimalTypeSchema>;

export const SeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type Severity = z.infer<typeof SeveritySchema>;

export const IncidentStatusSchema = z.enum([
  'reported',
  'dispatched',
  'active',
  'resolving',
  'resolved',
]);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

// Incident Schema definition
export const IncidentSchema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  animalType: AnimalTypeSchema,
  severity: SeveritySchema,
  status: IncidentStatusSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationName: z.string().min(3, 'Location name must be at least 3 characters'),
  reporterName: z.string().nullable().optional(),
  reporterPhone: z.string().nullable().optional(),
  reporterEmail: z.string().email('Invalid email address').nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  responderId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Incident = z.infer<typeof IncidentSchema>;

// Schemas for creating and updating incidents via APIs
export const CreateIncidentSchema = IncidentSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  responderId: true,
});
export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;

export const UpdateIncidentSchema = IncidentSchema.partial().omit({
  id: true,
  createdAt: true,
});
export type UpdateIncidentInput = z.infer<typeof UpdateIncidentSchema>;

// Comment Schema definition
export const CommentSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  authorName: z.string().min(2, 'Name must be at least 2 characters'),
  text: z.string().min(2, 'Comment text must be at least 2 characters'),
  statusUpdate: IncidentStatusSchema.nullable().optional(),
  createdAt: z.string(),
});

export type Comment = z.infer<typeof CommentSchema>;

export const CreateCommentSchema = CommentSchema.omit({
  id: true,
  incidentId: true,
  createdAt: true,
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
