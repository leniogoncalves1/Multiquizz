import type { Request, Response } from 'express';
import { INITIAL_CATEGORIES, INITIAL_QUESTIONS } from '../src/data/seedData';

// Cache in memory for 60 seconds
let cachedData: { timestamp: number; data: any } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function handleQuizDataRequest(req: Request, res: Response) {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    // Check cache
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp < CACHE_TTL_MS)) {
      return res.json(cachedData.data);
    }

    let rawCategories = INITIAL_CATEGORIES;
    let rawQuestions = INITIAL_QUESTIONS;

    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(appsScriptUrl, {
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (json && Array.isArray(json.categorias) && Array.isArray(json.questoes)) {
            rawCategories = json.categorias;
            rawQuestions = json.questoes;
          }
        }
      } catch (fetchErr) {
        console.warn('Could not fetch from APPS_SCRIPT_URL, using fallback dataset:', fetchErr);
      }
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
      }));

    // 2. Somente questões ativas de categorias ativas (CATEGORIA.ATIVA = SIM E QUESTOES.ATIVA = SIM)
    // 3. Ordem das questões determinada pelo campo ORDEM (numérica ascendente)
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
      source: appsScriptUrl ? 'remote' : 'fallback',
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
