import { Router } from 'express';
import { geocoderStatusController, resolvePlaceController, reverseGeocodeController, suggestPlacesController } from '../controllers/geocodeController.js';
import { getListingController, searchListingsController } from '../controllers/listingsController.js';
import { authRouter } from './auth.js';
import { messagesRouter } from './messages.js';
import { submissionsRouter } from './submissions.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    dataMode: 'genuine-geographic-records',
    dataNotice: 'No demo listings are served. Missing field values are shown as "Not available".',
    time: new Date().toISOString(),
  });
});

apiRouter.get('/geocode/suggest', suggestPlacesController);
apiRouter.get('/geocode/resolve', resolvePlaceController);
apiRouter.get('/geocode/reverse', reverseGeocodeController);
apiRouter.get('/geocode/status', geocoderStatusController);

apiRouter.get('/listings', searchListingsController);
apiRouter.get('/listings/:id', getListingController);

apiRouter.use('/auth', authRouter);
apiRouter.use(messagesRouter);
apiRouter.use(submissionsRouter);
