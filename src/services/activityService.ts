import { Activity, ActivityItem, ActivityTarget, ActivityResult } from '../types/activity';
import { CategoryWithCount } from '../types/quiz';

/**
 * Returns categories that have active activities
 */
export function getCategoriesWithActivities(
  allCategories: CategoryWithCount[],
  allActivities: Activity[]
): CategoryWithCount[] {
  const countMap: Record<string, number> = {};
  for (const act of allActivities) {
    if (act.ativa === 'SIM' && act.tipo === 'ASSOCIAR') {
      const catUpper = act.categoria.trim().toUpperCase();
      countMap[catUpper] = (countMap[catUpper] || 0) + 1;
    }
  }

  // Filter categories that exist in CATEGORIA and have activityCount > 0
  return allCategories
    .filter((cat) => {
      const catUpper = (cat.nome || cat.categoria || '').trim().toUpperCase();
      return (countMap[catUpper] || 0) > 0;
    })
    .map((cat) => {
      const catUpper = (cat.nome || cat.categoria || '').trim().toUpperCase();
      return {
        ...cat,
        activityCount: countMap[catUpper] || 0,
      };
    });
}

/**
 * Returns active activities for a specific category
 */
export function getActivitiesByCategory(
  allActivities: Activity[],
  categoryName: string
): Activity[] {
  const catUpper = categoryName.trim().toUpperCase();
  return allActivities.filter(
    (act) =>
      act.ativa === 'SIM' &&
      act.tipo === 'ASSOCIAR' &&
      act.categoria.trim().toUpperCase() === catUpper
  );
}

/**
 * Returns targets for a specific activity sorted by ORDEM
 */
export function getActivityTargets(
  allTargets: ActivityTarget[],
  activityId: string
): ActivityTarget[] {
  return allTargets
    .filter((target) => target.atividadeId === activityId)
    .sort((a, b) => Number(a.ordem) - Number(b.ordem));
}

/**
 * Returns active items for a specific activity
 */
export function getActivityItems(
  allItems: ActivityItem[],
  activityId: string
): ActivityItem[] {
  return allItems.filter(
    (item) => item.atividadeId === activityId && item.ativa === 'SIM'
  );
}

/**
 * Evaluates the user's associations:
 * assignments: map of targetId -> itemId
 */
export function evaluateAssociations(
  targets: ActivityTarget[],
  items: ActivityItem[],
  assignments: Record<string, string>
): ActivityResult {
  const itemsById: Record<string, ActivityItem> = {};
  items.forEach((it) => {
    itemsById[it.id] = it;
  });

  const targetResults: ActivityResult['targetResults'] = {};
  let correctCount = 0;

  targets.forEach((target) => {
    const assignedItemId = assignments[target.id];
    const assignedItem = assignedItemId ? itemsById[assignedItemId] : undefined;
    const correctItem = itemsById[target.idItemCorreto];

    // An association is correct if:
    // 1. The assigned item ID strictly matches target.idItemCorreto, OR
    // 2. The assigned item has the exact same normalized text as the target's correct item
    //    (essential for activities with duplicate item names like Vicryl 2-0)
    let isCorrect = false;
    if (assignedItem && correctItem) {
      if (assignedItem.id === correctItem.id) {
        isCorrect = true;
      } else if (
        assignedItem.texto.trim().toLowerCase() ===
        correctItem.texto.trim().toLowerCase()
      ) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      correctCount++;
    }

    targetResults[target.id] = {
      isCorrect,
      assignedItemId,
      assignedItemText: assignedItem?.texto,
      correctItemId: target.idItemCorreto,
      correctItemText: correctItem ? correctItem.texto : '',
    };
  });

  const totalCount = targets.length;
  const errorCount = totalCount - correctCount;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    isSubmitted: true,
    correctCount,
    totalCount,
    errorCount,
    percentage,
    targetResults,
  };
}
