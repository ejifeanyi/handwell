// Entry point for Vercel: it looks for a file at the project root that imports express and default-exports the app.
// Local development still uses src/server.ts, which calls listen().
import express from 'express';
import { createApp } from './src/app.js';

void express; // keeps the express import real so Vercel recognizes this file as the Express entry
const app: express.Express = createApp();
export default app;
