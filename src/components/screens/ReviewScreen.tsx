import React from 'react';
import { ArrowLeft, RotateCcw, Check, X, BookOpen } from 'lucide-react';
import { ProcessedQuestion, UserAnswer } from '../../types/quiz';
import { ResponsiveImage } from '../common/ResponsiveImage';

interface ReviewScreenProps {
  categoryName: string;
  questions: ProcessedQuestion[];
  answers: Record<string, UserAnswer>;
  onBackToResult: () => void;
  onRestart: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  categoryName,
  questions,
  answers,
  onBackToResult,
  onRestart,
}) => {
  return (
    <div
      id="review-screen"
      className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6"
    >
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div>
          <button
            id="review-back-to-result-button"
            type="button"
            onClick={onBackToResult}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Resultado</span>
          </button>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Revisão de Questões
          </h2>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold dark:text-neutral-400">
            {categoryName}
          </p>
        </div>

        <button
          id="review-restart-button"
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 active:scale-[0.99] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <RotateCcw className="h-4 w-4" />
          <span>REINICIAR</span>
        </button>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, index) => {
          const ans = answers[q.id];
          const isCorrect = ans ? ans.isCorrect : false;

          return (
            <div
              key={q.id}
              id={`review-question-card-${q.id}`}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                isCorrect
                  ? 'border-emerald-200 bg-white shadow-xs dark:border-emerald-900/60 dark:bg-neutral-800/90'
                  : 'border-red-200 bg-white shadow-xs dark:border-red-900/60 dark:bg-neutral-800/90'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-700/60">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  QUESTÃO {index + 1}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      CORRETA
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5" />
                      INCORRETA
                    </>
                  )}
                </span>
              </div>

              {/* Statement */}
              <h3 className="mt-3 text-base sm:text-lg font-bold text-neutral-900 leading-snug dark:text-neutral-100">
                {q.pergunta}
              </h3>

              {/* Optional Image */}
              {q.imagem && (
                <div className="mt-3">
                  <ResponsiveImage
                    src={q.imagem}
                    alt={`Imagem ilustrativa da questão ${index + 1}`}
                  />
                </div>
              )}

              {/* Answers Comparison */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* User's response */}
                <div
                  className={`rounded-xl border p-3 ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20'
                  }`}
                >
                  <p className="text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                    Sua resposta:
                  </p>
                  <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {ans ? (
                      <>
                        <span className="mr-1.5 inline-block rounded bg-white px-1.5 py-0.5 text-xs font-bold border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                          {ans.selectedVisualKey}
                        </span>
                        <span>{ans.selectedText}</span>
                      </>
                    ) : (
                      'Não respondida'
                    )}
                  </p>
                </div>

                {/* Correct response */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <p className="text-xs font-semibold text-emerald-800 uppercase dark:text-emerald-400">
                    Resposta correta:
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    {(() => {
                      const correctOpt = q.options.find(
                        (opt) => opt.originalKey === q.corretaOriginal
                      );
                      return correctOpt ? (
                        <>
                          <span className="mr-1.5 inline-block rounded bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white dark:bg-emerald-500">
                            {correctOpt.key}
                          </span>
                          <span>{correctOpt.text}</span>
                        </>
                      ) : (
                        q.corretaOriginal
                      );
                    })()}
                  </p>
                </div>
              </div>

              {/* Justificativa */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3.5 text-xs sm:text-sm dark:border-neutral-700/60 dark:bg-neutral-900/40">
                <p className="font-semibold text-neutral-800 flex items-center gap-1.5 mb-1 dark:text-neutral-200">
                  <BookOpen className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                  Justificativa:
                </p>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap dark:text-neutral-300">
                  {q.justificativa && q.justificativa.trim()
                    ? q.justificativa
                    : 'Não há justificativa cadastrada na planilha para esta questão.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-10 flex justify-center pb-8">
        <button
          id="review-bottom-restart-button"
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-800 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          <RotateCcw className="h-4 w-4" />
          <span>REINICIAR QUESTIONÁRIO</span>
        </button>
      </div>
    </div>
  );
};
