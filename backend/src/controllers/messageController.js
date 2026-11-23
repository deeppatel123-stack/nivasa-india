import { asyncHandler } from '../utils/asyncHandler.js';
import { validateContact, validateEnquiry } from '../validators/messageValidator.js';
import { createContact, createEnquiry, listEnquiriesForUser } from '../services/messageService.js';

export const createContactController = asyncHandler(async (req, res) => {
  const { record, storage } = createContact(validateContact(req.body));
  return res.status(201).json({
    record,
    message: 'Message recorded. No email was sent and no support ticket was opened.',
    storage,
  });
});

export const createEnquiryController = asyncHandler(async (req, res) => {
  const { record, storage } = createEnquiry(validateEnquiry(req.body), { userId: req.user?.id });
  return res.status(201).json({
    record,
    message: 'Enquiry recorded. No email was sent; the listing owner has not been notified.',
    storage,
  });
});

export const listEnquiriesController = asyncHandler(async (req, res) => {
  return res.json({ items: listEnquiriesForUser(req.user) });
});
