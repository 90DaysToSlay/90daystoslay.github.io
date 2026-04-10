import { createTwoFilesPatch } from 'diff';

export function textDiff(original: string, static_: string, label?: string): string {
  return createTwoFilesPatch(
    `original/${label || 'text'}`,
    `static/${label || 'text'}`,
    original,
    static_,
    'Original (GHL)',
    'Static (GitHub Pages)',
    { context: 3 }
  );
}

export function listDiff<T>(original: T[], static_: T[], key?: (item: T) => string): {
  added: T[];
  removed: T[];
  common: T[];
} {
  const getKey = key || ((item: T) => JSON.stringify(item));
  const originalKeys = new Set(original.map(getKey));
  const staticKeys = new Set(static_.map(getKey));

  return {
    added: static_.filter(item => !originalKeys.has(getKey(item))),
    removed: original.filter(item => !staticKeys.has(getKey(item))),
    common: original.filter(item => staticKeys.has(getKey(item))),
  };
}
