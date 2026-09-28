import React from 'react';
import { Stethoscope, Play, GraduationCap, Puzzle } from 'lucide-react';
import { QuizMode } from '../../types/quiz';

interface HomeScreenProps {
  onStart: (initialMode?: QuizMode) => void;
  onOpenActivities: () => void;
  isLoading?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStart,
  onOpenActivities,
  isLoading,
}) => {
  return (
    <div
      id="home-screen"
      className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-4 py-12 text-center sm:px-6"
    >
      <div className="w-full max-w-xl">
        {/* Logo / Badge */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md dark:bg-emerald-600">
          <Stethoscope className="h-10 w-10" />
        </div>

        {/* Title & Slogan */}
        <h1
          id="home-title"
          className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100"
        >
          MULTIQUIZZ
        </h1>
        <p
          id="home-description"
          className="mt-3 text-base text-neutral-600 sm:text-lg dark:text-neutral-300"
        >
          Aplicação educacional interativa para estudo e revisão técnica de procedimentos cirúrgicos em pequenos animais.
        </p>

        {/* Modalidade Selector Buttons (Section 12: [ QUIZ ] [ ESTUDO ] [ ATIVIDADES ]) */}
        <div
          id="home-modes-container"
          className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3"
        >
          {/* MODO QUIZ */}
          <button
            id="home-button-quiz"
            type="button"
            onClick={() => onStart('quiz')}
            disabled={isLoading}
            className="group flex flex-col justify-between rounded-2xl border border-emerald-600/30 bg-emerald-50/50 p-4 transition-all hover:border-emerald-600 hover:bg-emerald-50 hover:shadow-xs active:scale-[0.99] disabled:opacity-60 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-2xs group-hover:scale-105 transition-transform dark:bg-emerald-600">
                <Play className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                QUIZ
              </h3>
              <p className="mt-1 text-xs text-neutral-600 leading-snug dark:text-neutral-400">
                Questões contínuas com pontuação ao final.
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
              Acessar Quiz →
            </span>
          </button>

          {/* MODO ESTUDO */}
          <button
            id="home-button-estudo"
            type="button"
            onClick={() => onStart('estudo')}
            disabled={isLoading}
            className="group flex flex-col justify-between rounded-2xl border border-blue-600/30 bg-blue-50/50 p-4 transition-all hover:border-blue-600 hover:bg-blue-50 hover:shadow-xs active:scale-[0.99] disabled:opacity-60 dark:border-blue-700/40 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white shadow-2xs group-hover:scale-105 transition-transform dark:bg-blue-600">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                ESTUDO
              </h3>
              <p className="mt-1 text-xs text-neutral-600 leading-snug dark:text-neutral-400">
                Gabarito e justificativas imediatas.
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-800 dark:text-blue-400">
              Modo Estudo →
            </span>
          </button>

          {/* ATIVIDADES */}
          <button
            id="home-button-atividades"
            type="button"
            onClick={onOpenActivities}
            disabled={isLoading}
            className="group flex flex-col justify-between rounded-2xl border border-purple-600/30 bg-purple-50/50 p-4 transition-all hover:border-purple-600 hover:bg-purple-50 hover:shadow-xs active:scale-[0.99] disabled:opacity-60 dark:border-purple-700/40 dark:bg-purple-950/30 dark:hover:bg-purple-950/50"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700 text-white shadow-2xs group-hover:scale-105 transition-transform dark:bg-purple-600">
                <Puzzle className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                ATIVIDADES
              </h3>
              <p className="mt-1 text-xs text-neutral-600 leading-snug dark:text-neutral-400">
                Associação de fios, agulhas e planos anatômicos.
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-800 dark:text-purple-400">
              Atividades Interativas →
            </span>
          </button>
        </div>

        {isLoading && (
          <p className="mt-6 text-xs text-neutral-500 animate-pulse dark:text-neutral-400">
            Carregando dados da planilha...
          </p>
        )}
      </div>
    </div>
  );
};
