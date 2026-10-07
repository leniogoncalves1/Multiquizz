export type ActivityType = 'ASSOCIAR' | 'IDENTIFICAR';

export interface RawActivity {
  id: string; // ID_ATIVIDADE
  categoria: string; // CATEGORIA
  tipo: ActivityType | string; // TIPO
  titulo: string; // TITULO
  instrucao: string; // INSTRUCAO
  imagem?: string; // IMAGEM
  ativa: string; // ATIVA ('SIM' / 'NÃO')
}

export interface RawActivityItem {
  id: string; // ID_ITEM
  atividadeId: string; // ID_ATIVIDADE
  ordemCorreta?: number; // ORDEM_CORRETA
  texto: string; // TEXTO
  imagem?: string; // IMAGEM
  ativa: string; // ATIVA ('SIM' / 'NÃO')
}

export interface RawActivityTarget {
  id: string; // ID_ALVO
  atividadeId: string; // ID_ATIVIDADE
  ordem: number; // ORDEM
  tituloAlvo: string; // TITULO_ALVO
  descricao?: string; // DESCRICAO
  imagem?: string; // IMAGEM
  idItemCorreto: string; // ID_ITEM_CORRETO
}

export interface Activity {
  id: string;
  categoria: string;
  tipo: ActivityType;
  titulo: string;
  instrucao: string;
  imagem?: string;
  ativa: string;
}

export interface ActivityItem {
  id: string;
  atividadeId: string;
  ordemCorreta: number;
  texto: string;
  imagem?: string;
  ativa: string;
}

export interface ActivityTarget {
  id: string;
  atividadeId: string;
  ordem: number;
  tituloAlvo: string;
  descricao?: string;
  imagem?: string;
  idItemCorreto: string;
}

export interface ActivityCategory {
  id: string;
  nome: string;
  categoria: string;
  activityCount: number;
}

export interface ActivityResult {
  isSubmitted: boolean;
  correctCount: number;
  totalCount: number;
  errorCount: number;
  percentage: number;
  targetResults: Record<string, {
    isCorrect: boolean;
    assignedItemId?: string;
    assignedItemText?: string;
    correctItemId: string;
    correctItemText: string;
  }>;
}
