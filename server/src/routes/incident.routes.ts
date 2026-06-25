import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';

const router = Router();

// Routes for list and create
router
  .route('/')
  .get(IncidentController.getAllIncidents)
  .post(IncidentController.createIncident);

// Routes for individual incident operations
router
  .route('/:id')
  .get(IncidentController.getIncidentById)
  .patch(IncidentController.updateIncident);

// Routes for incident comments
router
  .route('/:id/comments')
  .get(IncidentController.getComments)
  .post(IncidentController.addComment);

export default router;
