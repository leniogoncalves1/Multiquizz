import React from 'react';
import { ArrowLeft, Puzzle, Layers } from 'lucide-react';
import { CategoryWithCount } from '../../types/quiz';

interface ActivityCategoryScreenProps {
  categories: CategoryWithCount[];
  onSelectCategory: (categoryName: string) => void;
  onBack: () => void;
}

export const ActivityCategoryScreen: React.FC<ActivityCategoryScreenProps> = ({
  categories,
  onSelectCategory,
  onBack,
}) => {
  return (
    <div
      id="activity-category-screen"
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
    >
      {/* Top bar with Back action */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="activity-category-back-button"
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao início</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 mb-3">
          <Puzzle className="h-3.5 w-3.5" />
          <span>Módulo Atividades</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          Selecione a Categoria de Atividade
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Escolha um procedimento cirúrgico para realizar atividades interativas de associação e fixação.
        </p>
      </div>

      {categories.length === 0 ? (
        <div
          id="no-activity-categories"
          className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300"
        >
          <Puzzle className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
          <p className="text-base font-semibold">Nenhuma atividade ativa encontrada.</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Cadastre atividades na aba ATIVIDADES da planilha com ATIVA = SIM.
          </p>
        </div>
      ) : (
        <div
          id="activity-category-grid"
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((cat) => {
            const catName = cat.nome || cat.categoria || 'Procedimento';
            const count = cat.activityCount || 0;
            return (
              <button
                key={cat.id || catName}
                id={`activity-category-card-${cat.id || catName}`}
                type="button"
                onClick={() => onSelectCategory(catName)}
                className="group flex min-h-[92px] flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-xs transition-all hover:border-emerald-500 hover:shadow-md hover:bg-neutral-50/60 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-800/80 dark:hover:border-emerald-600 dark:hover:bg-neutral-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base font-bold tracking-tight text-neutral-900 group-hover:text-emerald-700 transition-colors dark:text-neutral-100 dark:group-hover:text-emerald-400">
                    {catName}
                  </span>
                  <span className="shrink-0 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {count} {count === 1 ? 'atividade' : 'atividades'}
                  </span>
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Ver atividades disponíveis →</span>
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
