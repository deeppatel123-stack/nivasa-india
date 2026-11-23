import { asyncHandler } from '../utils/asyncHandler.js';
import { validateSubmission } from '../validators/submissionValidator.js';
import { createSubmission, listSubmissions } from '../services/submissionService.js';

export const createSubmissionController = asyncHandler(async (req, res) => {
  const { record, storage } = createSubmission(validateSubmission(req.body), req.user.id);
  return res.status(201).json({
    record,
    message: 'Submission received. It is unverified, pending moderation and is not published in public search.',
    storage,
  });
});

export const listSubmissionsController = asyncHandler(async (req, res) => {
  return res.json({ items: listSubmissions(req.user.id) });
});
