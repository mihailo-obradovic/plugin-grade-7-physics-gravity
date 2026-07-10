import { describe, expect, it } from 'vitest';

import { pluginMessages } from './messages';

const locales = ['en', 'sr-latn', 'sr-cyrl'] as const;

function collectKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe('plugin message parity', () => {
  it('keeps identical message keys across locales', () => {
    const reference = new Set(collectKeys(pluginMessages.en).sort());

    for (const locale of locales) {
      expect(new Set(collectKeys(pluginMessages[locale]).sort())).toEqual(
        reference
      );
    }
  });
});
