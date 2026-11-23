import { Router } from 'express';
import {
  createContactController,
  createEnquiryController,
  listEnquiriesController,
} from '../controllers/messageController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

export const messagesRouter = Router();

messagesRouter.post('/contact', createContactController);
messagesRouter.post('/enquiries', optionalAuth, createEnquiryController);
messagesRouter.get('/enquiries', requireAuth, listEnquiriesController);
