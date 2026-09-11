import { OptionItem } from '../types/quiz';

/**
 * Fisher-Yates shuffle algorithm that randomizes options
 * while strictly preserving originalKey ('A', 'B', 'C', 'D') mapped to the spreadsheet.
 */
export function shuffleOptions(
  rawOptions: { originalKey: 'A' | 'B' | 'C' | 'D'; text: string }[]
): OptionItem[] {
  const items = [...rawOptions];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  const visualKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  return items.map((item, index) => ({
    key: visualKeys[index] || 'A',
    originalKey: item.originalKey,
    text: item.text,
  }));
}
