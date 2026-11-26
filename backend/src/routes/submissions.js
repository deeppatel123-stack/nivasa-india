import { Router } from 'express';
import { createSubmissionController, listSubmissionsController } from '../controllers/submissionController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const submissionsRouter = Router();

submissionsRouter.use(requireAuth);
submissionsRouter.get('/submissions', requireRole('owner', 'admin'), listSubmissionsController);
submissionsRouter.post('/submissions', requireRole('owner', 'admin'), createSubmissionController);
