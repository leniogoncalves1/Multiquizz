import React from 'react';
import { Stethoscope, BookOpen, Sun, Moon } from 'lucide-react';
import { QuizMode, Screen } from '../../types/quiz';

interface HeaderProps {
  currentScreen: Screen;
  mode?: QuizMode;
  categoryName?: string | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  mode,
  categoryName,
  isDarkMode,
  onToggleTheme,
  onHomeClick,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-20 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-neutral-900/95"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          id="header-brand-button"
          type="button"
          onClick={onHomeClick}
          className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-85 focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm dark:bg-emerald-600">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl dark:text-neutral-100">
              MULTIQUIZZ
            </h1>
            <p className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Cirurgias Veterinárias
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {currentScreen !== 'home' && mode && (
            <span
              id="header-mode-badge"
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                mode === 'estudo'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              <span className="hidden xs:inline">{mode === 'estudo' ? 'Modo Estudo' : 'Modo Quiz'}</span>
              <span className="xs:hidden">{mode === 'estudo' ? 'Estudo' : 'Quiz'}</span>
            </span>
          )}

          {currentScreen !== 'home' && categoryName && (
            <span
              id="header-category-badge"
              className="hidden max-w-[130px] truncate rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 sm:inline-block md:max-w-[200px] dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
              title={categoryName}
            >
              {categoryName}
            </span>
          )}

          {/* Theme Toggle Button (Claro / Escuro) */}
          <button
            id="theme-toggle-button"
            type="button"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-neutral-600" />
                <span className="hidden sm:inline">Escuro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
