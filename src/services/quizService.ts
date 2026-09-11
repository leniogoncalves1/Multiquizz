import { CategoryWithCount, OptionItem, ProcessedQuestion } from '../types/quiz';
import { shuffleOptions } from '../utils/shuffle';

export interface QuizDataResponse {
  categories: CategoryWithCount[];
  questions: any[];
}

export async function fetchQuizData(): Promise<QuizDataResponse> {
  const response = await fetch('/api/quiz-data');
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
  matchingQuestions.sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

  return matchingQuestions.map((q) => {
    const rawOptions: { originalKey: 'A' | 'B' | 'C' | 'D'; text: string }[] = [
      { originalKey: 'A', text: String(q.a || '').trim() },
      { originalKey: 'B', text: String(q.b || '').trim() },
      { originalKey: 'C', text: String(q.c || '').trim() },
      { originalKey: 'D', text: String(q.d || '').trim() },
    ];

    // Shuffle options visually
    const shuffled = shuffleOptions(rawOptions);

    const corretaVal = String(q.correta || 'A').trim().toUpperCase() as 'A' | 'B' | 'C' | 'D';

    return {
      id: String(q.id),
      categoria: String(q.categoria),
      ordem: Number(q.ordem) || 1,
      pergunta: String(q.pergunta),
      options: shuffled,
      corretaOriginal: corretaVal,
      justificativa: q.justificativa ? String(q.justificativa).trim() : undefined,
      imagem: q.imagem ? String(q.imagem).trim() : undefined,
    };
  });
}

/**
 * Picks one random active category from the list that has at least 1 active question.
 */
export function selectRandomCategory(categories: CategoryWithCount[]): CategoryWithCount | null {
  const eligible = categories.filter((c) => c.questionCount > 0);
  if (eligible.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}
