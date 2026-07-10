import en from './messages/en.json';
import srCyrl from './messages/sr-cyrl.json';
import srLatn from './messages/sr-latn.json';

export const pluginMessages = {
  en,
  'sr-latn': srLatn,
  'sr-cyrl': srCyrl
} as const;
