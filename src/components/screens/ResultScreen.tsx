import React from 'react';
import { Award, RotateCcw, ListChecks } from 'lucide-react';

interface ResultScreenProps {
  categoryName: string;
  correctCount: number;
  totalQuestions: number;
  onReview: () => void;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  categoryName,
  correctCount,
  totalQuestions,
  onReview,
  onRestart,
}) => {
  const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  // Format percentage in pt-BR (e.g., "87,5%")
  const formattedPercentage = percentage
    .toFixed(1)
    .replace('.0', '')
    .replace('.', ',');

  return (
    <div
      id="result-screen"
      className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6"
    >
      <div className="w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-800/90">
        {/* Top Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-8 ring-emerald-50/50 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-950/40">
          <Award className="h-8 w-8" />
        </div>

        <span
          id="result-category-badge"
          className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 uppercase dark:bg-neutral-700 dark:text-neutral-300"
        >
          {categoryName}
        </span>

        <h2
          id="result-title"
          className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100"
        >
          RESULTADO
        </h2>

        {/* Stats card */}
        <div className="my-6 rounded-xl border border-neutral-200 bg-neutral-50/60 p-5 dark:border-neutral-700/60 dark:bg-neutral-900/60">
          <p
            id="result-score"
            className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100"
          >
            {correctCount} de {totalQuestions} acertos
          </p>
          <p
            id="result-percentage"
            className="mt-2 text-4xl font-extrabold tracking-tight text-emerald-700 sm:text-5xl dark:text-emerald-400"
          >
            {formattedPercentage}%
          </p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Aproveitamento geral nesta categoria
          </p>
        </div>

        {/* Action Buttons: REVISAR QUESTÕES & REINICIAR */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            id="btn-review-questions"
            type="button"
            onClick={onReview}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 shadow-xs transition-all hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <ListChecks className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            <span>REVISAR QUESTÕES</span>
          </button>

          <button
            id="btn-restart-quiz"
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-emerald-800 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>REINICIAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
