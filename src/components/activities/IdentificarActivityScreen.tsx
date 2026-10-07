import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  GripVertical,
  X,
  Sparkles,
  Award,
  Maximize2,
  ZoomIn,
} from 'lucide-react';
import { Activity, ActivityItem, ActivityTarget, ActivityResult } from '../../types/activity';
import { evaluateAssociations } from '../../services/activityService';
import { ResponsiveImage } from '../common/ResponsiveImage';
import { ImageMagnifier } from './ImageMagnifier';

interface IdentificarActivityScreenProps {
  activity: Activity;
  targets: ActivityTarget[];
  items: ActivityItem[];
  onBack: () => void;
}

export const IdentificarActivityScreen: React.FC<IdentificarActivityScreenProps> = ({
  activity,
  targets,
  items,
  onBack,
}) => {
  // Assignments: map of targetId -> itemId
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  // Selected bank item ID for tap-to-place interaction (mobile and touch devices)
  const [selectedBankItemId, setSelectedBankItemId] = useState<string | null>(null);
  // Evaluation result after clicking "Conferir"
  const [result, setResult] = useState<ActivityResult | null>(null);
  // Modal state for full-screen / enlarged image view
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Shuffled items in the bank
  const [shuffledItemIds, setShuffledItemIds] = useState<string[]>([]);

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const clone = [...arr];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  };

  // Reset or start activity
  const resetActivity = () => {
    setAssignments({});
    setSelectedBankItemId(null);
    setResult(null);
    const itemIds = items.map((it) => it.id);
    setShuffledItemIds(shuffleArray(itemIds));
  };

  // Stable key based on item IDs to prevent unwanted resets during re-renders (like theme toggle)
  const itemsKey = useMemo(() => items.map((it) => it.id).join(','), [items]);

  useEffect(() => {
    resetActivity();
  }, [activity.id, itemsKey]);

  const itemsById = useMemo(() => {
    const map: Record<string, ActivityItem> = {};
    items.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [items]);

  // Which item IDs are placed in targets
  const placedItemIds = useMemo(() => {
    return new Set(Object.values(assignments));
  }, [assignments]);

  // Available items in the bank, preserving shuffle order
  const availableBankItems = useMemo(() => {
    return shuffledItemIds
      .filter((id) => !placedItemIds.has(id))
      .map((id) => itemsById[id])
      .filter(Boolean);
  }, [shuffledItemIds, placedItemIds, itemsById]);

  // Handle assigning an item to a target
  const handleAssignItem = (targetId: string, itemId: string) => {
    if (result) return;

    setAssignments((prev) => {
      const next = { ...prev };

      // If the item was placed in another target, remove it from that target
      Object.keys(next).forEach((tId) => {
        if (next[tId] === itemId) {
          delete next[tId];
        }
      });

      next[targetId] = itemId;
      return next;
    });

    setSelectedBankItemId(null);
  };

  // Remove item from target back to bank
  const handleRemoveFromTarget = (targetId: string) => {
    if (result) return;
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  };

  // Bank item tap handler
  const handleBankItemClick = (itemId: string) => {
    if (result) return;
    if (selectedBankItemId === itemId) {
      setSelectedBankItemId(null);
    } else {
      setSelectedBankItemId(itemId);
    }
  };

  // Target slot tap handler
  const handleTargetClick = (targetId: string) => {
    if (result) return;

    if (selectedBankItemId) {
      handleAssignItem(targetId, selectedBankItemId);
    } else if (assignments[targetId]) {
      handleRemoveFromTarget(targetId);
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (result) return;
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (result) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnTarget = (e: React.DragEvent, targetId: string) => {
    if (result) return;
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId && itemsById[itemId]) {
      handleAssignItem(targetId, itemId);
    }
  };

  const handleDropOnBank = (e: React.DragEvent) => {
    if (result) return;
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      setAssignments((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((tId) => {
          if (next[tId] === itemId) {
            delete next[tId];
          }
        });
        return next;
      });
    }
  };

  // Check answers
  const handleConferir = () => {
    const evalResult = evaluateAssociations(targets, items, assignments);
    setResult(evalResult);
    setSelectedBankItemId(null);
  };

  const placedCount = Object.keys(assignments).length;
  const isAllPlaced = targets.length > 0 && placedCount === targets.length;

  return (
    <div
      id="identificar-activity-screen"
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
    >
      {/* Top Bar Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar às atividades</span>
        </button>

        {result && (
          <button
            type="button"
            onClick={resetActivity}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>TENTAR NOVAMENTE</span>
          </button>
        )}
      </div>

      {/* Activity Header */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/80">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            {activity.categoria}
          </span>
          <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-800 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
            {activity.tipo}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          {activity.titulo}
        </h1>

        {activity.instrucao && (
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed sm:text-base dark:text-neutral-300">
            {activity.instrucao}
          </p>
        )}

        {/* Tip Banner */}
        {!result && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-600 border border-neutral-200/80 dark:bg-neutral-900/40 dark:text-neutral-400 dark:border-neutral-700/60">
            <HelpCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Como jogar:</strong> Observe os números na imagem. Arraste ou clique na estrutura correspondente para associá-la ao número correspondente.
            </span>
          </div>
        )}
      </div>

      {/* Result Scoreboard Banner */}
      {result && (
        <div
          id="identificar-result-banner"
          className={`mb-8 rounded-2xl border p-5 shadow-xs transition-all ${
            result.percentage === 100
              ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-800/80 dark:bg-emerald-950/40'
              : result.percentage >= 60
              ? 'border-blue-200 bg-blue-50/90 dark:border-blue-800/80 dark:bg-blue-950/40'
              : 'border-amber-200 bg-amber-50/90 dark:border-amber-800/80 dark:bg-amber-950/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${
                  result.percentage === 100
                    ? 'bg-emerald-600'
                    : result.percentage >= 60
                    ? 'bg-blue-600'
                    : 'bg-amber-600'
                }`}
              >
                {result.percentage === 100 ? (
                  <Sparkles className="h-6 w-6" />
                ) : (
                  <Award className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {result.percentage === 100
                    ? 'Excelente! Todas as estruturas identificadas com sucesso!'
                    : result.percentage >= 60
                    ? 'Bom trabalho! Confira abaixo os números acertados e revise os erros.'
                    : 'Atividade finalizada. Tente novamente para memorizar todas as estruturas anatômicas!'}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Veja abaixo os detalhes de cada número com o gabarito das estruturas.
                </p>
              </div>
            </div>

            {/* Score Stats */}
            <div className="flex items-center gap-3 text-center">
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 px-3.5 py-2 shadow-2xs dark:border-neutral-700/80 dark:bg-neutral-900/60">
                <span className="block text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {result.correctCount}
                </span>
                <span className="text-[11px] font-medium text-neutral-500 uppercase dark:text-neutral-400">
                  Acertos
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 px-3.5 py-2 shadow-2xs dark:border-neutral-700/80 dark:bg-neutral-900/60">
                <span className="block text-xl font-extrabold text-red-600 dark:text-red-400">
                  {result.errorCount}
                </span>
                <span className="text-[11px] font-medium text-neutral-500 uppercase dark:text-neutral-400">
                  Erros
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 px-4 py-2 shadow-2xs dark:border-neutral-700/80 dark:bg-neutral-900/60">
                <span className="block text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                  {result.percentage}%
                </span>
                <span className="text-[11px] font-medium text-neutral-500 uppercase dark:text-neutral-400">
                  Aproveitamento
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="space-y-8">
        {/* SECTION 1: Principal Anatomical Image with Zoom Capability */}
        {activity.imagem && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-850">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400">
                  Imagem de Referência com Numeração
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-750"
              >
                <ZoomIn className="h-3.5 w-3.5" />
                <span>Ampliar Imagem</span>
              </button>
            </div>

            {/* Interactive Image with Moving Magnifier Lens */}
            <ImageMagnifier
              src={activity.imagem}
              alt={activity.titulo}
              className="max-h-[380px] sm:max-h-[460px] w-auto max-w-full rounded-lg object-contain"
              zoomLevel={2.4}
              lensSize={140}
            />
          </div>
        )}

        {/* SECTION 2: Available Structures Bank (Cartões Arrastáveis Embaralhados) */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDropOnBank}
          className={`rounded-2xl border p-5 transition-all ${
            selectedBankItemId
              ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-500/20 dark:border-emerald-600 dark:bg-emerald-950/20'
              : 'border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-850'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Estruturas Disponíveis ({availableBankItems.length} restantes)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {selectedBankItemId
                  ? 'Estrutura selecionada! Agora toque no número correspondente abaixo.'
                  : 'Arraste a estrutura para o número correto ou dê um clique para selecionar.'}
              </p>
            </div>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {placedCount} de {targets.length} associados
            </span>
          </div>

          {availableBankItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Todas as estruturas foram posicionadas nos números!
              </p>
              {!result && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Clique no botão <strong>Conferir Identificação</strong> abaixo para verificar suas respostas.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {availableBankItems.map((item) => {
                const isSelected = selectedBankItemId === item.id;
                return (
                  <div
                    key={item.id}
                    id={`item-card-${item.id}`}
                    draggable={!result}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => handleBankItemClick(item.id)}
                    className={`group relative flex items-center justify-between gap-2 rounded-xl border p-3 font-medium transition-all select-none ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md scale-[1.02]'
                        : 'border-neutral-200 bg-neutral-50/90 text-neutral-850 hover:border-emerald-400 hover:bg-white hover:shadow-xs active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-emerald-500 dark:hover:bg-neutral-750'
                    } ${!result ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {!result && (
                        <GripVertical
                          className={`h-4 w-4 shrink-0 ${
                            isSelected ? 'text-emerald-100' : 'text-neutral-400'
                          }`}
                        />
                      )}
                      <span className="truncate text-sm font-semibold">
                        {item.texto}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: Numbered Destination Slots (Alvos Correspondentes aos Números) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Associação com os Números da Imagem ({placedCount}/{targets.length})
            </h2>
            {selectedBankItemId && (
              <span className="animate-pulse text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Toque no número correspondente
              </span>
            )}
          </div>

          {/* Grid of Numbered Slots: 2 cols on mobile/tablet, 2 cols on desktop for balanced reading */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {targets.map((target, idx) => {
              const assignedItemId = assignments[target.id];
              const assignedItem = assignedItemId ? itemsById[assignedItemId] : null;
              const targetResult = result?.targetResults[target.id];

              let slotStyle =
                'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-850 dark:hover:border-neutral-700';

              if (result && targetResult) {
                slotStyle = targetResult.isCorrect
                  ? 'border-emerald-500 bg-emerald-50/30 dark:border-emerald-500/80 dark:bg-emerald-950/20'
                  : 'border-red-400 bg-red-50/30 dark:border-red-500/80 dark:bg-red-950/20';
              } else if (assignedItem) {
                slotStyle =
                  'border-neutral-300 bg-neutral-50/60 dark:border-neutral-700 dark:bg-neutral-850/90';
              } else if (selectedBankItemId) {
                slotStyle =
                  'border-emerald-400/80 bg-emerald-50/20 ring-2 ring-emerald-500/20 hover:border-emerald-500 dark:border-emerald-600 dark:bg-emerald-950/20';
              }

              return (
                <div
                  key={target.id}
                  id={`target-slot-${target.id}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnTarget(e, target.id)}
                  onClick={() => handleTargetClick(target.id)}
                  className={`relative flex items-center justify-between gap-3 rounded-2xl border p-3.5 sm:p-4 transition-all shadow-2xs ${slotStyle} ${
                    !result && selectedBankItemId ? 'cursor-pointer' : ''
                  }`}
                >
                  {/* Left: Prominent Number Badge */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl text-base sm:text-lg font-black shadow-xs ${
                        result && targetResult
                          ? targetResult.isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                      }`}
                    >
                      {target.tituloAlvo || idx + 1}
                    </div>

                    {/* Middle: Content Drop Area / Placed Item */}
                    <div className="min-w-0 flex-1">
                      {assignedItem ? (
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between gap-2 rounded-xl bg-neutral-100/90 dark:bg-neutral-800 px-3 py-2 border border-neutral-300 dark:border-neutral-700 shadow-2xs">
                            <span className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-100 truncate">
                              {assignedItem.texto}
                            </span>
                            {!result && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromTarget(target.id);
                                }}
                                title="Remover e devolver ao banco"
                                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Correction Details if submitted */}
                          {result && targetResult && !targetResult.isCorrect && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400 font-medium">
                              <span>Gabarito correto:</span>
                              <strong className="underline underline-offset-2">
                                {targetResult.correctItemText}
                              </strong>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium">
                          <span>
                            {selectedBankItemId
                              ? 'Toque aqui para posicionar'
                              : 'Solte a estrutura correspondente aqui'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Validation Badge Status */}
                  {result && targetResult && (
                    <div className="shrink-0 pl-1">
                      {targetResult.isCorrect ? (
                        <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="hidden sm:inline">Correto</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-300">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="hidden sm:inline">Incorreto</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button: Conferir / Tentar Novamente (Normal non-sticky flow so it doesn't obstruct reading) */}
        <div className="mt-8 flex justify-center pb-8 pt-2">
          {!result ? (
            <button
              type="button"
              id="identificar-conferir-button"
              onClick={handleConferir}
              disabled={placedCount === 0}
              className={`inline-flex min-h-[52px] items-center gap-2.5 rounded-2xl px-8 py-3 text-base font-extrabold shadow-lg transition-all ${
                placedCount === 0
                  ? 'cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 shadow-none'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.99] shadow-emerald-600/25'
              }`}
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>
                CONFERIR RESPOSTAS ({placedCount}/{targets.length})
              </span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 bg-white p-3 rounded-2xl border border-neutral-200 shadow-md dark:bg-neutral-900 dark:border-neutral-800">
              <button
                type="button"
                onClick={resetActivity}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 active:scale-[0.99] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <RotateCcw className="h-4 w-4" />
                <span>TENTAR NOVAMENTE</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-750"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Concluir atividade</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Enlarged Image View */}
      {isImageModalOpen && activity.imagem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-h-[95vh] max-w-[95vw] rounded-2xl bg-white p-3 shadow-2xl dark:bg-neutral-900 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-2 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                {activity.titulo} — Imagem de Referência
              </span>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-auto max-h-[82vh] p-2 flex items-center justify-center">
              <img
                src={
                  activity.imagem.startsWith('http')
                    ? `/api/image-proxy?url=${encodeURIComponent(activity.imagem)}`
                    : activity.imagem
                }
                alt={activity.titulo}
                className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
