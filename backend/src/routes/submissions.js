import { Router } from 'express';
import { createSubmissionController, listSubmissionsController } from '../controllers/submissionController.js';
import { requireAuth } from '../middleware/auth.js';

export const submissionsRouter = Router();

submissionsRouter.use(requireAuth);
submissionsRouter.get('/submissions', listSubmissionsController);
submissionsRouter.post('/submissions', createSubmissionController);
