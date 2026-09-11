import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleQuizDataRequest } from './api/quiz-data';
import { handleImageProxyRequest } from './api/image-proxy';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());

  // API endpoint to proxy Quiz data securely without exposing Google Sheets / Apps Script URLs in client-side HTML/JS
  app.get('/api/quiz-data', async (req, res) => {
    await handleQuizDataRequest(req, res);
  });

  // Image proxy endpoint to bypass hotlinking, referrer or CORS limitations
  app.get('/api/image-proxy', async (req, res) => {
    await handleImageProxyRequest(req, res);
  });

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'MULTIQUIZZ' });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MULTIQUIZZ Server running on port ${PORT}`);
  });
}

startServer();
