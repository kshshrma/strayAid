import { Router } from 'express';
import { TestController } from '../controllers/test.controller';

const router = Router();

/**
 * Route declarations for the Test module.
 * 
 * SOLID Principle: Single Responsibility.
 * This file is only responsible for mapping URL endpoints to controller methods.
 */
router.get('/', TestController.getTestMessage);

export default router;
