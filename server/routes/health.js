import { Router } from 'express';
import { dbState } from '../config/db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    dataMode: dbState.connected ? 'mongodb' : 'demo-memory',
    databaseConfigured: dbState.configured,
    notice: 'Nivasa API serves illustrative demo listings only. No real property data is available.',
    timestamp: new Date().toISOString(),
  });
});

export default router;
