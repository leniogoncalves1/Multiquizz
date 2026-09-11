import React, { useState } from 'react';
import { Shuffle, ArrowLeft, CheckCircle, GraduationCap, Play, Layers } from 'lucide-react';
import { CategoryWithCount, QuizMode } from '../../types/quiz';

interface CategoryScreenProps {
  categories: CategoryWithCount[];
  onSelectCategory: (categoryName: string, mode: QuizMode, isRandom: boolean) => void;
  onBack: () => void;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  categories,
  onSelectCategory,
  onBack,
}) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode>('quiz');

  const availableCategories = categories.filter((c) => c.questionCount > 0);

  const handleStartWithCategory = (categoryName: string, isRandom = false) => {
    if (!categoryName) return;
    onSelectCategory(categoryName, selectedMode, isRandom);
  };

  const handleRandomCategoryClick = () => {
    if (availableCategories.length === 0) return;
    const randomIndex = Math.floor(Math.random() * availableCategories.length);
    const chosen = availableCategories[randomIndex];
    const catName = chosen.nome || chosen.categoria || '';
    handleStartWithCategory(catName, true);
  };

  return (
    <div
      id="category-screen"
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
    >
      {/* Top bar with Back action */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="category-back-button"
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao início</span>
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          Selecione a Categoria e o Modo
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Escolha um procedimento cirúrgico para praticar ou opte por uma categoria sorteada.
        </p>
      </div>

      {/* 1. Mode Selector (Modo Quiz vs Modo Estudo) */}
      <div
        id="quiz-mode-selector"
        className="mb-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs sm:p-5 dark:border-neutral-800 dark:bg-neutral-800/80"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Passo 1: Escolha o Modo de Resolução
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* MODO QUIZ */}
          <button
            id="mode-button-quiz"
            type="button"
            onClick={() => setSelectedMode('quiz')}
            className={`flex min-h-[64px] flex-col justify-start rounded-xl border p-4 text-left transition-all ${
              selectedMode === 'quiz'
                ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:ring-emerald-500/30'
                : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/40 dark:hover:border-neutral-600'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                <Play className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                MODO QUIZ
              </span>
              {selectedMode === 'quiz' && (
                <CheckCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Responda a todas as questões sem interrupção. O resultado e a revisão completa são apresentados ao final.
            </p>
          </button>

          {/* MODO ESTUDO */}
          <button
            id="mode-button-estudo"
            type="button"
            onClick={() => setSelectedMode('estudo')}
            className={`flex min-h-[64px] flex-col justify-start rounded-xl border p-4 text-left transition-all ${
              selectedMode === 'estudo'
                ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 dark:border-blue-500 dark:bg-blue-950/40 dark:ring-blue-500/30'
                : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/40 dark:hover:border-neutral-600'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                <GraduationCap className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                MODO ESTUDO
              </span>
              {selectedMode === 'estudo' && (
                <CheckCircle className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Feedback imediato a cada questão: confira se acertou, veja a resposta certa e leia a justificativa detalhada.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Highlighted Random Category Option */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Passo 2: Escolha o Procedimento
        </p>
        <button
          id="btn-random-category"
          type="button"
          onClick={handleRandomCategoryClick}
          disabled={availableCategories.length === 0}
          className="group relative flex w-full min-h-[58px] items-center justify-between overflow-hidden rounded-2xl border-2 border-dashed border-emerald-600/80 bg-emerald-50/50 px-5 py-4 text-left transition-all hover:border-emerald-600 hover:bg-emerald-50 active:scale-[0.99] disabled:opacity-50 dark:border-emerald-600/50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs group-hover:scale-105 transition-transform dark:bg-emerald-600">
              <Shuffle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                CATEGORIA ALEATÓRIA
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Sorteia uma categoria ativa e apresenta todas as suas questões na ordem correta.
              </p>
            </div>
          </div>
          <span className="hidden text-xs font-semibold text-emerald-800 sm:inline-block dark:text-emerald-400">
            Sortear agora →
          </span>
        </button>
      </div>

      {/* 3. Category Grid */}
      {availableCategories.length === 0 ? (
        <div
          id="no-categories-message"
          className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300"
        >
          <p className="text-base font-medium">Nenhuma categoria ativa encontrada no momento.</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Verifique se a planilha possui categorias marcadas com ATIVA = SIM e questões ativas associadas.
          </p>
        </div>
      ) : (
        <div
          id="category-grid"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {availableCategories.map((cat) => {
            const catName = cat.nome || cat.categoria || 'Procedimento';
            return (
              <button
                key={cat.id || catName}
                id={`category-card-${cat.id || catName}`}
                type="button"
                onClick={() => handleStartWithCategory(catName, false)}
                className="flex min-h-[82px] flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-xs transition-all hover:border-neutral-300 hover:shadow-md hover:bg-neutral-50/60 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-800/80 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {catName}
                  </span>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                    {cat.questionCount} {cat.questionCount === 1 ? 'questão' : 'questões'}
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Iniciar questionário</span>
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
