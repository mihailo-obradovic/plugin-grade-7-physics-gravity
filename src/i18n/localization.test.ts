import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { exerciseContent } from '../content';
import { pluginMessages } from './messages';

const locales = ['en', 'sr-latn', 'sr-cyrl'] as const;

describe('galileo drop localization', () => {
  it('has complete catalogs without migration placeholders', () => {
    const referenceKeys = Object.keys(pluginMessages.en).sort();

    for (const locale of locales) {
      expect(Object.keys(pluginMessages[locale]).sort()).toEqual(referenceKeys);
      expect(JSON.stringify(pluginMessages[locale])).not.toContain('TODO');
    }
  });

  it('contains localized controls in both Serbian scripts', () => {
    expect(pluginMessages['sr-latn'].dropAndCheck).toBe('Pusti i provjeri');
    expect(pluginMessages['sr-cyrl'].dropAndCheck).toBe('Пусти и провјери');
  });

  it('contains locale-keyed quiz content in both Serbian scripts', () => {
    expect(exerciseContent['sr-latn'].questions[0].answer).toBe('Padaju zajedno');
    expect(exerciseContent['sr-cyrl'].questions[0].answer).toBe('Падају заједно');
  });

  it('renders through the live plugin locale channel', async () => {
    const source = await readFile(
      path.join(process.cwd(), 'src/GalileoDrop.tsx'),
      'utf8'
    );

    expect(source).toContain('usePluginLocale(context.i18n)');
    expect(source).toContain('usePluginTranslations(context.i18n)');
    expect(source).not.toContain('Drop & check');
  });

  it('packages message catalogs with the release artifacts', async () => {
    const source = await readFile(
      path.join(process.cwd(), 'scripts/package-github.mjs'),
      'utf8'
    );

    expect(source).toContain("path.join(repoRoot, 'src/i18n/messages')");
    expect(source).toContain("path.join(distDir, 'messages')");
  });
});
