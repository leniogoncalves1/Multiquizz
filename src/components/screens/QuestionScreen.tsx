import React, { useState } from 'react';
import { Check, X, ArrowRight, BookOpen } from 'lucide-react';
import { OptionItem, ProcessedQuestion, QuizMode, UserAnswer } from '../../types/quiz';
import { ResponsiveImage } from '../common/ResponsiveImage';

interface QuestionScreenProps {
  question: ProcessedQuestion;
  currentIndex: number;
  totalQuestions: number;
  mode: QuizMode;
  onNextQuestion: (answer: UserAnswer) => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  currentIndex,
  totalQuestions,
  mode,
  onNextQuestion,
}) => {
  const [selectedOption, setSelectedOption] = useState<OptionItem | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const isLastQuestion = currentIndex + 1 === totalQuestions;
  const isEstudoMode = mode === 'estudo';

  // Handle selecting an option
  const handleSelect = (option: OptionItem) => {
    // In estudo mode, once confirmed, locked
    if (isEstudoMode && hasConfirmed) return;
    setSelectedOption(option);
  };

  // Helper to determine correctness
  const isOptionCorrect = (opt: OptionItem) => {
    return opt.originalKey.trim().toUpperCase() === question.corretaOriginal.trim().toUpperCase();
  };

  // Build the answer payload
  const buildAnswerPayload = (): UserAnswer => {
    if (!selectedOption) {
      throw new Error('Nenhuma alternativa selecionada');
    }

    const correctOpt = question.options.find(
      (opt) => opt.originalKey.trim().toUpperCase() === question.corretaOriginal.trim().toUpperCase()
    );

    const isCorrect = isOptionCorrect(selectedOption);

    return {
      questionId: question.id,
      selectedOriginalKey: selectedOption.originalKey,
      selectedVisualKey: selectedOption.key,
      selectedText: selectedOption.text,
      isCorrect,
      correctOriginalKey: question.corretaOriginal,
      correctText: correctOpt ? correctOpt.text : '',
    };
  };

  // Action button click
  const handleActionButton = () => {
    if (!selectedOption) return;

    if (isEstudoMode && !hasConfirmed) {
      // Step 1 in Estudo: reveal feedback
      setHasConfirmed(true);
      return;
    }

    // In Quiz mode OR Step 2 in Estudo: proceed
    const answer = buildAnswerPayload();
    onNextQuestion(answer);
  };

  return (
    <div
      id="question-screen"
      className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8"
    >
      {/* Top Meta Bar */}
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <span
          id="question-category-label"
          className="text-xs font-bold tracking-wider text-emerald-800 uppercase dark:text-emerald-400"
        >
          {question.categoria}
        </span>
        <span
          id="question-progress-indicator"
          className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
          Questão {currentIndex + 1} de {totalQuestions}
        </span>
      </div>

      {/* Progress Bar Line */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          id="question-progress-bar"
          className="h-full bg-emerald-700 transition-all duration-300 dark:bg-emerald-500"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <h2
          id="question-statement"
          className="text-lg font-bold leading-relaxed text-neutral-900 sm:text-xl dark:text-neutral-100"
        >
          {question.pergunta}
        </h2>
      </div>

      {/* Optional Responsive Image */}
      {question.imagem && (
        <ResponsiveImage
          src={question.imagem}
          alt={`Imagem da questão ${currentIndex + 1}: ${question.pergunta}`}
        />
      )}

      {/* Alternatives */}
      <div
        id="question-options-list"
        className="my-5 space-y-2.5"
      >
        {question.options.map((opt) => {
          const isSelected = selectedOption?.key === opt.key;
          const isThisCorrect = isOptionCorrect(opt);

          let optionStyle =
            'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/70 text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800/80 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-200';
          let badgeStyle = 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600';

          if (isEstudoMode && hasConfirmed) {
            // Revealing state in Estudo mode
            if (isThisCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500';
            } else if (isSelected && !isThisCorrect) {
              optionStyle = 'border-red-400 bg-red-50/80 text-red-950 ring-1 ring-red-400 dark:border-red-500 dark:bg-red-950/60 dark:text-red-200';
              badgeStyle = 'bg-red-600 text-white border-red-600 dark:bg-red-500';
            } else {
              optionStyle = 'border-neutral-200 bg-neutral-50/50 opacity-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-500';
            }
          } else if (isSelected) {
            // Selected state in Quiz mode or before confirmation in Estudo
            optionStyle = 'border-emerald-600 bg-emerald-50/50 text-neutral-900 ring-2 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-neutral-100 dark:ring-emerald-500/30';
            badgeStyle = 'bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-600';
          }

          return (
            <button
              key={opt.key}
              id={`option-${opt.key}`}
              type="button"
              disabled={isEstudoMode && hasConfirmed}
              onClick={() => handleSelect(opt)}
              className={`flex w-full min-h-[52px] items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] disabled:cursor-default ${optionStyle}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${badgeStyle}`}
              >
                {isEstudoMode && hasConfirmed && isThisCorrect ? (
                  <Check className="h-4 w-4" />
                ) : isEstudoMode && hasConfirmed && isSelected && !isThisCorrect ? (
                  <X className="h-4 w-4" />
                ) : (
                  opt.key
                )}
              </span>
              <span className="mt-0.5 text-sm sm:text-base leading-relaxed">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Immediate Rationale / Justificativa in Modo Estudo */}
      {isEstudoMode && hasConfirmed && selectedOption && (
        <div
          id="study-feedback-card"
          className={`my-6 rounded-xl border p-4.5 transition-all ${
            isOptionCorrect(selectedOption)
              ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/40'
              : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isOptionCorrect(selectedOption) ? (
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                Resposta Correta!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-bold text-red-800 dark:text-red-300">
                <X className="h-4 w-4 text-red-700 dark:text-red-400" />
                Resposta Incorreta
              </span>
            )}
          </div>

          <div className="mt-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
            <p className="font-semibold text-neutral-900 mb-1 flex items-center gap-1.5 dark:text-neutral-100">
              <BookOpen className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
              Justificativa:
            </p>
            <p className="leading-relaxed whitespace-pre-wrap">
              {question.justificativa && question.justificativa.trim()
                ? question.justificativa
                : 'Não há justificativa cadastrada na planilha para esta questão.'}
            </p>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-8 flex items-center justify-end">
        <button
          id="question-action-button"
          type="button"
          disabled={!selectedOption}
          onClick={handleActionButton}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-40 sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {isEstudoMode && !hasConfirmed ? (
            <span>Confirmar Resposta</span>
          ) : isLastQuestion ? (
            <>
              <span>Finalizar e Ver Resultado</span>
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Próxima Questão</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
