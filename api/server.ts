/**
 * local server entry file, for local development
 */
import app from './app.js';
import { flushSync } from './lib/db.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

function gracefulShutdown(signal: string) {
  console.log(`${signal} signal received`);
  flushSync();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

/**
 * close server
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('beforeExit', () => flushSync());

export default app;