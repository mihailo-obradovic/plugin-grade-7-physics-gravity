import type { PluginLocale } from './types';

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
};

type ExerciseContent = {
  questions: Question[];
};

export const exerciseContent: Record<PluginLocale, ExerciseContent> = {
  en: {
    questions: [
      {
        id: 'vacuum-first',
        prompt: 'In a vacuum, which object lands first?',
        options: ['The feather', 'The hammer', 'They land together'],
        answer: 'They land together'
      },
      {
        id: 'air-first',
        prompt: 'In ordinary air, which object lands first?',
        options: ['The feather', 'The hammer', 'They land together'],
        answer: 'The hammer'
      },
      {
        id: 'fall-time',
        prompt: 'About how long to fall 24 m in a vacuum? (t = √(2h ÷ g))',
        options: ['1.1 s', '2.2 s', '4.4 s'],
        answer: '2.2 s'
      }
    ]
  },
  'sr-latn': {
    questions: [
      {
        id: 'vacuum-first',
        prompt: 'U vakuumu, koji predmet pada prvi?',
        options: ['Perje', 'Čekić', 'Padaju zajedno'],
        answer: 'Padaju zajedno'
      },
      {
        id: 'air-first',
        prompt: 'U običnom zraku, koji predmet pada prvi?',
        options: ['Perje', 'Čekić', 'Padaju zajedno'],
        answer: 'Čekić'
      },
      {
        id: 'fall-time',
        prompt: 'Otprilike koliko dugo pada 24 m u vakuumu? (t = √(2h ÷ g))',
        options: ['1,1 s', '2,2 s', '4,4 s'],
        answer: '2,2 s'
      }
    ]
  },
  'sr-cyrl': {
    questions: [
      {
        id: 'vacuum-first',
        prompt: 'У вакууму, који предмет пада први?',
        options: ['Перје', 'Чекић', 'Падају заједно'],
        answer: 'Падају заједно'
      },
      {
        id: 'air-first',
        prompt: 'У обичном ваздуху, који предмет пада први?',
        options: ['Перје', 'Чекић', 'Падају заједно'],
        answer: 'Чекић'
      },
      {
        id: 'fall-time',
        prompt: 'Отприлике колико дуго пада 24 m у вакууму? (t = √(2h ÷ g))',
        options: ['1,1 s', '2,2 s', '4,4 s'],
        answer: '2,2 s'
      }
    ]
  }
};
