import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Short cache in memory (5 seconds) so changes in Google Sheets appear almost immediately
let cachedData: { timestamp: number; data: any } | null = null;
const CACHE_TTL_MS = 5 * 1000;

// Safe loader for fallback data without cross-module ESM resolution issues on Vercel
function loadFallbackData() {
  try {
    const filePath = path.join(process.cwd(), 'api', 'fallbackData.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('[MULTIQUIZZ API] Could not load api/fallbackData.json:', err);
  }

  // Minimal inline fallback if file read fails
  return {
    categories: [
      { id: '1', categoria: 'ORQUIECTOMIA', ativa: 'SIM' },
      { id: '2', categoria: 'OVARIOHISTERECTOMIA', ativa: 'SIM' },
      { id: '3', categoria: 'ENTEROTOMIA', ativa: 'SIM' },
      { id: '4', categoria: 'CISTOTOMIA', ativa: 'SIM' },
      { id: '5', categoria: 'ENTERECTOMIA', ativa: 'SIM' },
    ],
    questions: [],
  };
}

export async function handleQuizDataRequest(req: Request, res: Response) {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const forceRefresh =
      req.query?.refresh === 'true' || req.headers?.['cache-control'] === 'no-cache';

    const now = Date.now();
    // Use cache only if not forced and within TTL
    if (!forceRefresh && cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
      return res.json(cachedData.data);
    }

    const fallback = loadFallbackData();
    let rawCategories = fallback.categories || [];
    let rawQuestions = fallback.questions || [];
    let isRemoteSuccess = false;
    let remoteErrorDetail = '';

    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(appsScriptUrl, {
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });
        clearTimeout(timeoutId);

        const textResponse = await response.text();

        if (
          textResponse.includes('<title>Access Denied</title>') ||
          textResponse.includes('Access Denied')
        ) {
          remoteErrorDetail =
            'O Google Apps Script retornou "Acesso Negado". No Apps Script: Implantar > Gerenciar Implantações > Quem pode acessar > mude para "Qualquer pessoa".';
          console.warn('[MULTIQUIZZ API Warning]:', remoteErrorDetail);
        } else {
          try {
            const json = JSON.parse(textResponse);
            if (json && Array.isArray(json.categorias) && Array.isArray(json.questoes)) {
              rawCategories = json.categorias;
              rawQuestions = json.questoes;
              isRemoteSuccess = true;
            } else if (json && json.error) {
              remoteErrorDetail = `Erro retornado pelo script: ${json.error}`;
            }
          } catch (jsonParseErr) {
            remoteErrorDetail =
              'O script do Google retornou uma resposta não-JSON. Verifique se o Web App foi implantado corretamente.';
            console.warn('[MULTIQUIZZ API Warning]: Resposta não é JSON');
          }
        }
      } catch (fetchErr: any) {
        remoteErrorDetail = `Não foi possível conectar ao Google Apps Script (${fetchErr.message || fetchErr}). Usando dados locais.`;
        console.warn('[MULTIQUIZZ API Warning]:', remoteErrorDetail);
      }
    } else {
      remoteErrorDetail =
        'A variável APPS_SCRIPT_URL não está configurada no ambiente da Vercel. Usando dados locais.';
    }

    // Process & filter according to requirements:
    const activeCategoriesMap = new Set<string>();
    const activeCategoriesList = rawCategories
      .filter((cat: any) => {
        const isAtiva = String(cat?.ativa || '').trim().toUpperCase() === 'SIM';
        if (isAtiva && cat?.categoria) {
          activeCategoriesMap.add(String(cat.categoria).trim().toUpperCase());
          return true;
        }
        return false;
      })
      .map((cat: any) => ({
        id: String(cat?.id || ''),
        categoria: String(cat?.categoria || '').trim(),
        ativa: String(cat?.ativa || 'SIM').trim().toUpperCase(),
      }));

    const activeQuestions = rawQuestions
      .filter((q: any) => {
        const isQuestaoAtiva = String(q?.ativa || '').trim().toUpperCase() === 'SIM';
        const catName = String(q?.categoria || '').trim().toUpperCase();
        const isCategoriaAtiva = activeCategoriesMap.has(catName);
        return isQuestaoAtiva && isCategoriaAtiva && q?.pergunta;
      })
      .map((q: any) => ({
        id: String(q?.id || ''),
        categoria: String(q?.categoria || '').trim(),
        ordem: Number(q?.ordem) || 0,
        pergunta: String(q?.pergunta || '').trim(),
        a: String(q?.a || '').trim(),
        b: String(q?.b || '').trim(),
        c: String(q?.c || '').trim(),
        d: String(q?.d || '').trim(),
        correta: String(q?.correta || 'A').trim().toUpperCase(),
        justificativa: String(q?.justificativa || '').trim(),
        imagem: String(q?.imagem || '').trim(),
      }))
      .sort((a: any, b: any) => a.ordem - b.ordem);

    // Dynamic question count per category
    const countMap: Record<string, number> = {};
    for (const q of activeQuestions) {
      const catUpper = String(q.categoria || '').toUpperCase();
      countMap[catUpper] = (countMap[catUpper] || 0) + 1;
    }

    const categoriesWithCount = activeCategoriesList.map((cat: any) => ({
      id: cat.id,
      nome: cat.categoria,
      categoria: cat.categoria,
      questionCount: countMap[cat.categoria.toUpperCase()] || 0,
    }));

    const responsePayload = {
      success: true,
      source: isRemoteSuccess ? 'remote' : 'fallback',
      warning: isRemoteSuccess ? undefined : remoteErrorDetail,
      updatedAt: new Date().toISOString(),
      categories: categoriesWithCount,
      questions: activeQuestions,
    };

    // Cache valid payload
    cachedData = {
      timestamp: now,
      data: responsePayload,
    };

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    console.error('Error handling quiz data request:', error);
    // Never fail with 500: return fallback data with 200 so UI continues working smoothly
    const fallback = loadFallbackData();
    return res.status(200).json({
      success: true,
      source: 'fallback',
      warning: 'Recuperado através do banco de dados local.',
      updatedAt: new Date().toISOString(),
      categories: (fallback.categories || []).map((c: any) => ({
        id: String(c.id || ''),
        nome: String(c.categoria || ''),
        categoria: String(c.categoria || ''),
        questionCount: 8,
      })),
      questions: fallback.questions || [],
    });
  }
}

// Default export for Vercel serverless function (req, res)
export default async function handler(req: any, res: any) {
  return handleQuizDataRequest(req, res);
}
