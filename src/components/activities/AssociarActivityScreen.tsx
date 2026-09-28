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
} from 'lucide-react';
import { Activity, ActivityItem, ActivityTarget, ActivityResult } from '../../types/activity';
import { evaluateAssociations } from '../../services/activityService';
import { ResponsiveImage } from '../common/ResponsiveImage';

interface AssociarActivityScreenProps {
  activity: Activity;
  targets: ActivityTarget[];
  items: ActivityItem[];
  onBack: () => void;
}

export const AssociarActivityScreen: React.FC<AssociarActivityScreenProps> = ({
  activity,
  targets,
  items,
  onBack,
}) => {
  // Assignments: map of targetId -> itemId
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  // Selected item ID for tap-to-match interaction (mobile & accessibility)
  const [selectedBankItemId, setSelectedBankItemId] = useState<string | null>(null);
  // Evaluation result after clicking "Conferir"
  const [result, setResult] = useState<ActivityResult | null>(null);
  // Image error state to hide broken images gracefully without breaking layout
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Shuffled items in the bank (shuffled once when activity mounts or resets)
  const [shuffledItemIds, setShuffledItemIds] = useState<string[]>([]);

  const handleImageError = (key: string) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const clone = [...arr];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  };

  // Initialize or reset activity
  const resetActivity = () => {
    setAssignments({});
    setSelectedBankItemId(null);
    setResult(null);
    const itemIds = items.map((it) => it.id);
    setShuffledItemIds(shuffleArray(itemIds));
  };

  useEffect(() => {
    resetActivity();
  }, [activity.id, items]);

  const itemsById = useMemo(() => {
    const map: Record<string, ActivityItem> = {};
    items.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [items]);

  // Which item IDs are currently placed in target slots
  const placedItemIds = useMemo(() => {
    return new Set(Object.values(assignments));
  }, [assignments]);

  // Items remaining in the available bank (preserving the initial shuffle order)
  const availableBankItems = useMemo(() => {
    return shuffledItemIds
      .filter((id) => !placedItemIds.has(id))
      .map((id) => itemsById[id])
      .filter(Boolean);
  }, [shuffledItemIds, placedItemIds, itemsById]);

  // Handle assigning an item to a target
  const handleAssignItem = (targetId: string, itemId: string) => {
    if (result) return; // Cannot modify after checking, must click retry

    setAssignments((prev) => {
      const next = { ...prev };

      // If the item was already in another target, remove it from that target
      Object.keys(next).forEach((tId) => {
        if (next[tId] === itemId) {
          delete next[tId];
        }
      });

      next[targetId] = itemId;
      return next;
    });

    // Clear selection
    setSelectedBankItemId(null);
  };

  // Remove item from a target back to the bank
  const handleRemoveFromTarget = (targetId: string) => {
    if (result) return;
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  };

  // Handle click on an item card in the bank
  const handleBankItemClick = (itemId: string) => {
    if (result) return;
    if (selectedBankItemId === itemId) {
      setSelectedBankItemId(null); // Deselect
    } else {
      setSelectedBankItemId(itemId); // Select
    }
  };

  // Handle click on a target slot
  const handleTargetClick = (targetId: string) => {
    if (result) return;

    if (selectedBankItemId) {
      // Place selected bank item into this target
      handleAssignItem(targetId, selectedBankItemId);
    } else if (assignments[targetId]) {
      // If no bank item is selected and target has an item, clicking it can select it to move or remove
      handleRemoveFromTarget(targetId);
    }
  };

  // Drag and drop handlers (HTML5 Drag & Drop)
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
      // If it came from a target slot, remove it from assignments
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
      id="associar-activity-screen"
      className="mx-auto w-full max-w-5xl lg:max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
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
      <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/80">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            {activity.categoria}
          </span>
          <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
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

        {/* Optional Activity Image */}
        {activity.imagem && (
          <div className="mt-4">
            <ResponsiveImage
              src={activity.imagem}
              alt={activity.titulo}
              className="max-h-72 w-auto max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        )}

        {/* Mobile / Tap instruction banner */}
        {!result && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-600 border border-neutral-200/80 dark:bg-neutral-900/40 dark:text-neutral-400 dark:border-neutral-700/60">
            <HelpCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Dica de uso:</strong> Arraste o cartão até o alvo correspondente ou toque no item e depois toque no alvo desejado.
            </span>
          </div>
        )}
      </div>

      {/* Result Scoreboard Banner */}
      {result && (
        <div
          id="activity-result-banner"
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
                    ? 'Excelente! Todas as associações corretas!'
                    : result.percentage >= 60
                    ? 'Bom trabalho! Confira os acertos e revise os itens.'
                    : 'Atividade concluída. Vale a pena tentar novamente para fixar o conteúdo!'}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Veja abaixo os detalhes de cada alvo com a indicação correta.
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

      {/* Interactive Board Layout: Targets on Top (2 cols x 2 rows on desktop), Available Items Bank Below (2 cols on desktop) */}
      <div className="space-y-6">
        {/* Section 1: Targets (Alvos correspondentes) */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Alvos correspondentes ({placedCount}/{targets.length})
            </h2>
            {selectedBankItemId && (
              <span className="animate-pulse text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Toque no alvo desejado para posicionar
              </span>
            )}
          </div>

          {/* Grid: 1 column on mobile, 2 columns on desktop (forms 2x2 with 4 targets) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targets.map((target, idx) => {
              const assignedItemId = assignments[target.id];
              const assignedItem = assignedItemId ? itemsById[assignedItemId] : null;
              const targetResult = result?.targetResults[target.id];

              let cardBorder =
                'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-800/80';
              if (result && targetResult) {
                cardBorder = targetResult.isCorrect
                  ? 'border-emerald-500 bg-emerald-50/30 dark:border-emerald-500/80 dark:bg-emerald-950/20'
                  : 'border-red-400 bg-red-50/30 dark:border-red-500/80 dark:bg-red-950/20';
              } else if (selectedBankItemId) {
                cardBorder =
                  'border-emerald-400/80 bg-emerald-50/20 ring-2 ring-emerald-500/20 dark:border-emerald-600 dark:bg-emerald-950/20';
              }

              return (
                <div
                  key={target.id}
                  id={`target-slot-${target.id}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnTarget(e, target.id)}
                  onClick={() => handleTargetClick(target.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all shadow-xs ${cardBorder} ${
                    !result && selectedBankItemId ? 'cursor-pointer hover:border-emerald-500' : ''
                  }`}
                >
                  {/* Target Top Content */}
                  <div>
                    {/* Target Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                            {idx + 1}
                          </span>
                          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                            {target.tituloAlvo}
                          </h3>
                        </div>
                        {target.descricao && (
                          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 pl-7 leading-relaxed">
                            {target.descricao}
                          </p>
                        )}
                      </div>

                      {/* Visual Status Indicator after Conferir */}
                      {result && targetResult && (
                        <div className="shrink-0">
                          {targetResult.isCorrect ? (
                            <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Correto</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-300">
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              <span>Incorreto</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Optional Target Image */}
                    {target.imagem && (
                      <div className="mb-3">
                        <ResponsiveImage
                          src={target.imagem}
                          alt={target.tituloAlvo}
                          className="max-h-44 w-auto max-w-full rounded-lg object-contain mx-auto"
                        />
                      </div>
                    )}
                  </div>

                  {/* Drop Zone / Assigned Item Card (anchored at bottom) */}
                  <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-750">
                    {assignedItem ? (
                      <div
                        draggable={!result}
                        onDragStart={(e) => handleDragStart(e, assignedItem.id)}
                        className={`relative flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                          result && targetResult
                            ? targetResult.isCorrect
                              ? 'border-emerald-300 bg-emerald-100/70 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                              : 'border-red-300 bg-red-100/70 text-red-950 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200'
                            : 'border-neutral-300 bg-neutral-100/80 text-neutral-900 shadow-2xs hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-700/60 dark:text-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {!result && (
                            <GripVertical className="h-4 w-4 shrink-0 text-neutral-400 cursor-grab active:cursor-grabbing" />
                          )}
                          {assignedItem.imagem && (
                            <ResponsiveImage
                              src={assignedItem.imagem}
                              alt={assignedItem.texto}
                              compact
                              className="h-8 w-8 shrink-0 rounded object-cover"
                            />
                          )}
                          <span className="text-sm font-semibold leading-snug break-words">
                            {assignedItem.texto}
                          </span>
                        </div>

                        {/* Remove button (when not submitted) */}
                        {!result && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromTarget(target.id);
                            }}
                            title="Remover item deste alvo"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-600 dark:hover:text-neutral-200 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`flex min-h-[48px] items-center justify-center rounded-xl border-2 border-dashed px-4 py-2.5 text-center transition-all ${
                          selectedBankItemId
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300 cursor-pointer animate-pulse'
                            : 'border-neutral-200 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-500'
                        }`}
                      >
                        <span className="text-xs font-medium">
                          {selectedBankItemId
                            ? 'Toque para posicionar aqui'
                            : 'Arraste ou clique no item para associar'}
                        </span>
                      </div>
                    )}

                    {/* If result is submitted and wrong, show the correct answer clearly */}
                    {result && targetResult && !targetResult.isCorrect && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80">
                        <span className="font-bold shrink-0">Resposta correta:</span>
                        <span>{targetResult.correctItemText}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Available Items Bank (Itens para associar - 2 columns on desktop) */}
        <div
          id="items-bank-card"
          onDragOver={handleDragOver}
          onDrop={handleDropOnBank}
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-800/80 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Itens para associar ({availableBankItems.length})
              </h2>
              {availableBankItems.length > 0 && !result && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  (arraste ou clique para selecionar)
                </span>
              )}
            </div>
            {availableBankItems.length === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Todos posicionados!
              </span>
            )}
          </div>

          {availableBankItems.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Todos os itens foram distribuídos nos alvos!
              </p>
              {!result && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Agora clique em <strong>CONFERIR</strong> abaixo para validar as respostas.
                </p>
              )}
            </div>
          ) : (
            /* Items grid: 1 col on mobile, 2 cols on tablet/desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableBankItems.map((item) => {
                const isSelected = selectedBankItemId === item.id;
                return (
                  <div
                    key={item.id}
                    id={`bank-item-${item.id}`}
                    draggable={!result}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => handleBankItemClick(item.id)}
                    className={`group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 shadow-2xs transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-100'
                        : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:shadow-xs dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GripVertical className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500" />
                      <span className="text-sm font-medium leading-snug break-words">{item.texto}</span>
                    </div>

                    {/* Optional Item Image */}
                    {item.imagem && (
                      <ResponsiveImage
                        src={item.imagem}
                        alt={item.texto}
                        compact
                        className="h-9 w-9 shrink-0 rounded-md object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Button: Conferir / Tentar novamente */}
          <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-700/80">
            {!result ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {placedCount === 0
                    ? 'Posicione ao menos 1 item para conferir'
                    : `${placedCount} de ${targets.length} alvos preenchidos`}
                </span>
                <button
                  id="btn-conferir-atividade"
                  type="button"
                  onClick={handleConferir}
                  disabled={placedCount === 0}
                  className="inline-flex min-h-[48px] w-full sm:w-auto sm:min-w-[260px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-base font-bold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>CONFERIR {placedCount > 0 ? `(${placedCount}/${targets.length})` : ''}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetActivity}
                  className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>TENTAR NOVAMENTE</span>
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>VOLTAR ÀS ATIVIDADES</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
