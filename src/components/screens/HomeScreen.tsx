import React from 'react';
import { Stethoscope, ArrowRight, CheckCircle2, BookCheck } from 'lucide-react';

interface HomeScreenProps {
  onStart: () => void;
  isLoading?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, isLoading }) => {
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

        {/* Informative Highlights */}
        <div
          id="home-highlights"
          className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2"
        >
          <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-800/80">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Conteúdo Especializado</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Questões estruturadas por procedimento cirúrgico.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-800/80">
            <BookCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Modos de Estudo</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Pratique no Modo Quiz ou aprenda passo a passo no Modo Estudo.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10">
          <button
            id="home-start-button"
            type="button"
            onClick={onStart}
            disabled={isLoading}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-60 sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {isLoading ? (
              <span>Carregando questões...</span>
            ) : (
              <>
                <span>INICIAR</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
