import { useCallback, useSyncExternalStore } from 'react';

import { pluginMessages } from './messages';

import type { PluginI18n, PluginLocale } from '../types';

type MessageValues = Record<string, string | number>;

function formatMessage(template: string, values?: MessageValues): string {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];

    return value === undefined ? `{${key}}` : String(value);
  });
}

export function usePluginLocale(i18n: PluginI18n): PluginLocale {
  return useSyncExternalStore(i18n.subscribe, i18n.getLocale, i18n.getLocale);
}

export function usePluginTranslations(i18n: PluginI18n) {
  const locale = usePluginLocale(i18n);
  const catalog = pluginMessages[locale];

  return useCallback(
    (key: keyof typeof catalog, values?: MessageValues) =>
      formatMessage(catalog[key], values),
    [catalog]
  );
}
