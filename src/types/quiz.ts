export type Screen = 'home' | 'categories' | 'quiz' | 'result' | 'review';

export type QuizMode = 'quiz' | 'estudo';

export interface RawCategory {
  id: string;
  categoria: string;
  ativa: string;
}

export interface RawQuestion {
  id: string;
  categoria: string;
  ordem: number | string;
  pergunta: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correta: 'A' | 'B' | 'C' | 'D' | string;
  justificativa?: string;
  imagem?: string;
  ativa: string;
}

export interface OptionItem {
  key: 'A' | 'B' | 'C' | 'D'; // Visual label (A, B, C, D)
  originalKey: 'A' | 'B' | 'C' | 'D'; // Original column from spreadsheet
  text: string;
}

export interface ProcessedQuestion {
  id: string;
  categoria: string;
  ordem: number;
  pergunta: string;
  options: OptionItem[];
  corretaOriginal: 'A' | 'B' | 'C' | 'D';
  justificativa?: string;
  imagem?: string;
}

export interface CategoryWithCount {
  id: string;
  nome: string;
  categoria?: string;
  questionCount: number;
}

export interface UserAnswer {
  questionId: string;
  selectedOriginalKey: 'A' | 'B' | 'C' | 'D';
  selectedVisualKey: 'A' | 'B' | 'C' | 'D';
  selectedText: string;
  isCorrect: boolean;
  correctOriginalKey: 'A' | 'B' | 'C' | 'D';
  correctText: string;
}

export interface QuizState {
  screen: Screen;
  mode: QuizMode;
  selectedCategoryName: string | null;
  isRandomCategory: boolean;
  activeQuestions: ProcessedQuestion[];
  currentIndex: number;
  answers: Record<string, UserAnswer>;
  currentAnswerSubmitted: boolean;
}
