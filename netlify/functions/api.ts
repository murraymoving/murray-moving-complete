import { Handler } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

// Import your existing backend routes
import { registerRoutes } from '../../server/routes';

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'netlify-functions'
  });
});

// Register your API routes
registerRoutes(app);

// Handle base path for Netlify Functions
app.use('/.netlify/functions/api', app);

// Export the serverless handler
export const handler: Handler = serverless(app);