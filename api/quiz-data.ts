import type { Request, Response } from 'express';
import { INITIAL_CATEGORIES, INITIAL_QUESTIONS } from '../src/data/seedData';

// Short cache in memory (5 seconds) so changes in Google Sheets appear almost immediately
let cachedData: { timestamp: number; data: any } | null = null;
const CACHE_TTL_MS = 5 * 1000;

export async function handleQuizDataRequest(req: Request, res: Response) {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const forceRefresh = req.query?.refresh === 'true' || req.headers['cache-control'] === 'no-cache';

    const now = Date.now();
    // Use cache only if not forced and within TTL
    if (!forceRefresh && cachedData && (now - cachedData.timestamp < CACHE_TTL_MS)) {
      return res.json(cachedData.data);
    }

    let rawCategories = INITIAL_CATEGORIES;
    let rawQuestions = INITIAL_QUESTIONS;
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
            'Accept': 'application/json',
          },
        });
        clearTimeout(timeoutId);

        const textResponse = await response.text();

        // Check if response is HTML error from Google (e.g., Access Denied)
        if (textResponse.includes('<title>Access Denied</title>') || textResponse.includes('Access Denied')) {
          remoteErrorDetail = 'O Google Apps Script retornou "Acesso Negado" (Access Denied). Para permitir a sincronização, acesse o Apps Script > Implantar > Gerenciar Implantações > Editar > e mude "Quem pode acessar" para "Qualquer pessoa".';
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
            remoteErrorDetail = 'O script do Google retornou uma resposta não-JSON. Verifique se o Web App foi implantado corretamente.';
            console.warn('[MULTIQUIZZ API Warning]: Resposta não é JSON:', textResponse.slice(0, 300));
          }
        }
      } catch (fetchErr: any) {
        remoteErrorDetail = `Não foi possível conectar ao Google Apps Script (${fetchErr.message || fetchErr}). Usando dados locais.`;
        console.warn('[MULTIQUIZZ API Warning]:', remoteErrorDetail);
      }
    } else {
      remoteErrorDetail = 'A variável APPS_SCRIPT_URL não está configurada no ambiente. Usando dados locais.';
    }

    // Process & filter according to requirements:
    // 1. Aba CATEGORIA controla quais categorias estão disponíveis (ATIVA === 'SIM')
    const activeCategoriesMap = new Set<string>();
    const activeCategoriesList = rawCategories
      .filter((cat) => {
        const isAtiva = String(cat.ativa || '').trim().toUpperCase() === 'SIM';
        if (isAtiva && cat.categoria) {
          activeCategoriesMap.add(cat.categoria.trim().toUpperCase());
          return true;
        }
        return false;
      })
      .map((cat) => ({
        id: String(cat.id || ''),
        categoria: String(cat.categoria || '').trim(),
        ativa: String(cat.ativa || 'SIM').trim().toUpperCase(),
      }));

    // 2. Aba QUESTOES: somente ativas (ATIVA === 'SIM') AND com categoria ativa
    const activeQuestions = rawQuestions
      .filter((q) => {
        const isQuestaoAtiva = String(q.ativa || '').trim().toUpperCase() === 'SIM';
        const catName = String(q.categoria || '').trim().toUpperCase();
        const isCategoriaAtiva = activeCategoriesMap.has(catName);
        return isQuestaoAtiva && isCategoriaAtiva && q.pergunta;
      })
      .map((q) => ({
        id: String(q.id || ''),
        categoria: String(q.categoria || '').trim(),
        ordem: Number(q.ordem) || 0,
        pergunta: String(q.pergunta || '').trim(),
        a: String(q.a || '').trim(),
        b: String(q.b || '').trim(),
        c: String(q.c || '').trim(),
        d: String(q.d || '').trim(),
        correta: String(q.correta || 'A').trim().toUpperCase(),
        justificativa: String(q.justificativa || '').trim(),
        imagem: String(q.imagem || '').trim(),
      }))
      .sort((a, b) => a.ordem - b.ordem);

    // Dynamic question count per category
    const countMap: Record<string, number> = {};
    for (const q of activeQuestions) {
      const catUpper = q.categoria.toUpperCase();
      countMap[catUpper] = (countMap[catUpper] || 0) + 1;
    }

    const categoriesWithCount = activeCategoriesList.map((cat) => ({
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

    return res.json(responsePayload);
  } catch (error) {
    console.error('Error handling quiz data request:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar os dados do questionário',
    });
  }
}

// Default export for Vercel serverless function (req, res)
export default async function handler(req: any, res: any) {
  return handleQuizDataRequest(req, res);
}
