import React from 'react';
import { ArrowLeft, Play, Puzzle, HelpCircle } from 'lucide-react';
import { Activity } from '../../types/activity';
import { ResponsiveImage } from '../common/ResponsiveImage';

interface ActivityListScreenProps {
  categoryName: string;
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  onBack: () => void;
}

export const ActivityListScreen: React.FC<ActivityListScreenProps> = ({
  categoryName,
  activities,
  onSelectActivity,
  onBack,
}) => {
  return (
    <div
      id="activity-list-screen"
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
    >
      {/* Top bar with Back action */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="activity-list-back-button"
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar às categorias</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 mb-3">
          <Puzzle className="h-3.5 w-3.5" />
          <span>{categoryName}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          Atividades de {categoryName}
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Selecione uma atividade para iniciar a associação de fios, agulhas e estruturas cirúrgicas.
        </p>
      </div>

      {activities.length === 0 ? (
        <div
          id="no-activities-for-category"
          className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300"
        >
          <HelpCircle className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
          <p className="text-base font-semibold">Nenhuma atividade disponível para esta categoria.</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Cadastre atividades na aba ATIVIDADES vinculadas a esta categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activities.map((act) => (
            <div
              key={act.id}
              id={`activity-item-card-${act.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800/80 dark:hover:border-emerald-600"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                    {act.tipo}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    ID: {act.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {act.titulo}
                </h3>
                {act.instrucao && (
                  <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed dark:text-neutral-300">
                    {act.instrucao}
                  </p>
                )}
                {act.imagem && (
                  <div className="mt-3 max-w-[200px]">
                    <ResponsiveImage
                      src={act.imagem}
                      alt={act.titulo}
                      className="max-h-24 w-auto rounded-lg object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectActivity(act)}
                  className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-emerald-800 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  <Play className="h-4 w-4" />
                  <span>INICIAR ATIVIDADE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
