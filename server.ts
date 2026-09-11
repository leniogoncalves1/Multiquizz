import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { handleQuizDataRequest } from './api/quiz-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    try {
      const rawUrl = req.query.url as string;
      if (!rawUrl || !rawUrl.startsWith('http')) {
        return res.status(400).send('Invalid URL');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const upstream = await fetch(rawUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });
      clearTimeout(timeout);

      if (!upstream.ok) {
        return res.status(upstream.status).send(`Upstream returned ${upstream.status}`);
      }

      const contentType = upstream.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');

      const arrayBuffer = await upstream.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      return res.status(500).send(err.message || 'Error fetching image');
    }
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
