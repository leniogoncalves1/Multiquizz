import { CategoryWithCount, OptionItem, ProcessedQuestion } from '../types/quiz';
import { shuffleOptions } from '../utils/shuffle';

export interface QuizDataResponse {
  categories: CategoryWithCount[];
  questions: any[];
  source?: 'remote' | 'fallback';
  warning?: string;
}

export async function fetchQuizData(refresh = false): Promise<QuizDataResponse> {
  const url = refresh ? '/api/quiz-data?refresh=true' : '/api/quiz-data';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar dados do questionário (HTTP ${response.status})`);
  }
  const data = await response.json();
  if (!data.success && !Array.isArray(data.categories)) {
    throw new Error(data.error || 'Resposta inválida do servidor');
  }
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
