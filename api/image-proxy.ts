import type { Request, Response } from 'express';

function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim().replace(/^["']|["']$/g, '');
  if (/^[a-zA-Z0-9_-]{25,55}$/.test(trimmed)) {
    return trimmed;
  }
  if (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com')
  ) {
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (fileDMatch && fileDMatch[1]) return fileDMatch[1];
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
    if (dMatch && dMatch[1]) return dMatch[1];
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idMatch && idMatch[1]) return idMatch[1];
  }
  return null;
}

export async function handleImageProxyRequest(req: Request, res: Response) {
  try {
    const rawUrl = req.query.url as string;
    const driveId = extractGoogleDriveId(rawUrl);

    if (!rawUrl || (!rawUrl.startsWith('http') && !driveId)) {
      return res.status(400).send('URL inválida');
    }

    // If it's a Google Drive link, convert to direct thumbnail endpoint
    let targetUrl = rawUrl;
    if (driveId) {
      targetUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    let upstream = await fetch(targetUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    // If thumbnail failed and it was a Google Drive link, try lh3 endpoint as secondary fallback
    if (!upstream.ok && driveId) {
      try {
        const fallbackResp = await fetch(`https://lh3.googleusercontent.com/d/${driveId}`, {
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'image/*',
          },
        });
        if (fallbackResp.ok) {
          upstream = fallbackResp;
        }
      } catch {
        // fallback fetch error
      }
    }

    if (!upstream.ok) {
      return res.status(upstream.status).send(`Upstream returned ${upstream.status}`);
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    return res.status(500).send(err.message || 'Erro ao carregar imagem');
  }
}

// Default export for Vercel Serverless Function
export default async function handler(req: any, res: any) {
  return handleImageProxyRequest(req, res);
}

