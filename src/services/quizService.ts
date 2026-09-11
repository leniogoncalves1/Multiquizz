import { CategoryWithCount, OptionItem, ProcessedQuestion } from '../types/quiz';
import { shuffleOptions } from '../utils/shuffle';
import { INITIAL_CATEGORIES, INITIAL_QUESTIONS } from '../data/seedData';

export interface QuizDataResponse {
  categories: CategoryWithCount[];
  questions: any[];
  source?: 'remote' | 'fallback';
  warning?: string;
}

/**
 * Generates local dataset in case API is unavailable or returns an error.
 */
function getLocalFallbackData(): QuizDataResponse {
  const activeCategoriesMap = new Set<string>();
  const activeCategories = INITIAL_CATEGORIES.filter((c) => {
    const isAtiva = String(c.ativa || '').trim().toUpperCase() === 'SIM';
    if (isAtiva && c.categoria) {
      activeCategoriesMap.add(c.categoria.trim().toUpperCase());
      return true;
    }
    return false;
  });

  const activeQuestions = INITIAL_QUESTIONS.filter((q) => {
    const isQuestaoAtiva = String(q.ativa || '').trim().toUpperCase() === 'SIM';
    const catUpper = String(q.categoria || '').trim().toUpperCase();
    return isQuestaoAtiva && activeCategoriesMap.has(catUpper) && q.pergunta;
  });

  const countMap: Record<string, number> = {};
  for (const q of activeQuestions) {
    const catUpper = String(q.categoria || '').trim().toUpperCase();
    countMap[catUpper] = (countMap[catUpper] || 0) + 1;
  }

  const categoriesWithCount = activeCategories.map((c) => ({
    id: String(c.id || ''),
    nome: String(c.categoria || '').trim(),
    categoria: String(c.categoria || '').trim(),
    questionCount: countMap[String(c.categoria || '').trim().toUpperCase()] || 0,
  }));

  return {
    categories: categoriesWithCount,
    questions: activeQuestions,
    source: 'fallback',
  };
}

export async function fetchQuizData(refresh = false): Promise<QuizDataResponse> {
  const url = refresh ? '/api/quiz-data?refresh=true' : '/api/quiz-data';
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        return {
          categories: (data.categories || []).map((c: any) => ({
            id: String(c.id || ''),
            nome: String(c.nome || c.categoria || '').trim(),
            categoria: String(c.categoria || c.nome || '').trim(),
            questionCount: Number(c.questionCount) || 0,
          })),
          questions: data.questions || [],
          source: data.source,
          warning: data.warning,
        };
      }
    } else {
      console.warn(`[MULTIQUIZZ API]: Server responded with HTTP ${response.status}. Using client fallback.`);
    }
  } catch (err) {
    console.warn('[MULTIQUIZZ API]: Fetch failed or network offline. Using client fallback.', err);
  }

  // Graceful client fallback: ensures app never shows a fatal blocking error screen
  return getLocalFallbackData();
}

/**
 * Prepares questions for a given category:
 * 1. Filter questions strictly by category
 * 2. Keep the order strictly defined by ORDEM (ascending: 1, 2, 3...)
 * 3. Shuffles visual options (A, B, C, D) per attempt while preserving originalKey
 */
export function prepareCategoryQuestions(
  allQuestions: any[],
  categoryName: string
): ProcessedQuestion[] {
  const categoryUpper = categoryName.trim().toUpperCase();

  const matchingQuestions = allQuestions.filter(
    (q) => String(q.categoria || '').trim().toUpperCase() === categoryUpper
  );

  // Sort strictly by ORDEM
  matchingQuestions.sort((a, b) => Number(a.ordem) - Number(b.ordem));

  return matchingQuestions.map((q) => {
    const rawOptions = [
      { key: 'A' as const, originalKey: 'A' as const, text: q.a },
      { key: 'B' as const, originalKey: 'B' as const, text: q.b },
      { key: 'C' as const, originalKey: 'C' as const, text: q.c },
      { key: 'D' as const, originalKey: 'D' as const, text: q.d },
    ];

    const shuffled = shuffleOptions(rawOptions);

    return {
      id: String(q.id),
      categoria: q.categoria,
      ordem: Number(q.ordem),
      pergunta: q.pergunta,
      options: shuffled,
      corretaOriginal: (String(q.correta || 'A').trim().toUpperCase()) as 'A' | 'B' | 'C' | 'D',
      justificativa: q.justificativa,
      imagem: q.imagem,
    };
  });
}
