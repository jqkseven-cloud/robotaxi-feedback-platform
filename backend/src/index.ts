import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import feedbackRouter from './routes/feedback';
import analyticsRouter from './routes/analytics';
import aiRouter from './routes/ai';
import ticketRouter from './routes/tickets';
import { requestLogger, logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { requireApiKey } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(requestLogger);

app.use('/api/feedback', feedbackRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/ai', requireApiKey, aiRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    qwen: process.env.DASHSCOPE_API_KEY ? 'configured' : 'not_configured',
    authRequired: !!process.env.INTERNAL_API_KEY,
  });
});

app.use(errorHandler);

// Serve frontend static files if the dist folder exists (production)
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback – must be after all API routes
  app.use((_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  logger.info('server_start', {
    port: PORT,
    allowedOrigins,
    qwen: process.env.DASHSCOPE_API_KEY ? 'configured' : 'not_configured',
    authRequired: !!process.env.INTERNAL_API_KEY,
  });
});

export default app;
