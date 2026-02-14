/**
 * NPC Empanelment & Contractual Engagement Portal — Express Application Entry Point.
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Serve frontend build in production
const frontendBuild = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuild));
app.get('*', (_req, res) => {
  const indexPath = path.join(frontendBuild, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).json({ success: false, error: 'Endpoint not found.' });
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// Auto-seed on first deploy
import { autoSeed } from './scripts/auto-seed';
autoSeed()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`NPC Portal API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Auto-seed failed:', err);
    app.listen(PORT, () => {
      console.log(`NPC Portal API running on port ${PORT} (seed failed)`);
    });
  });

export default app;
