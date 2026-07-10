import { useEffect, useMemo, useRef, useState } from 'react';

import { exerciseContent } from './content';
import {
  usePluginLocale,
  usePluginTranslations
} from './i18n/usePluginTranslations';

import type { PluginContext } from './types';

// Resolve bundled assets against this module's URL so they load from wherever
// the bundle is served (jsDelivr dist/ in production, public/plugins/ in dev).
const checkIconUrl = new URL('./assets/check.svg', import.meta.url).href;

const G = 9.8; // m/s^2
const DROP_METERS = 24; // fall height represented by the scene
const FEATHER_TERMINAL = 4.5; // feather terminal velocity in air (m/s)

const VACUUM_FALL_TIME = Math.sqrt((2 * DROP_METERS) / G); // ~2.21 s
const FEATHER_AIR_TIME = DROP_METERS / FEATHER_TERMINAL; // ~5.33 s

type Medium = 'air' | 'vacuum';
type Phase = 'idle' | 'dropping' | 'landed';

function fallFraction(elapsed: number, velocityCapped: boolean): number {
  const distance = velocityCapped
    ? FEATHER_TERMINAL * elapsed
    : 0.5 * G * elapsed * elapsed;

  return Math.min(distance / DROP_METERS, 1);
}

function featherLandTime(medium: Medium): number {
  return medium === 'vacuum' ? VACUUM_FALL_TIME : FEATHER_AIR_TIME;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

type Props = {
  context: PluginContext;
};

export default function GalileoDrop({ context }: Props) {
  const rafRef = useRef<number | null>(null);
  const locale = usePluginLocale(context.i18n);
  const t = usePluginTranslations(context.i18n);
  const questions = useMemo(
    () => exerciseContent[locale].questions,
    [locale]
  );

  const [medium, setMedium] = useState<Medium>('air');
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [featherFrac, setFeatherFrac] = useState(0);
  const [hammerFrac, setHammerFrac] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(questions.map((question) => [question.id, null]))
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    setAnswers(Object.fromEntries(questions.map((question) => [question.id, null])));
    setSubmitted(false);
    setScore(null);
  }, [questions]);

  const answeredCount = questions.filter(
    (question) => answers[question.id] !== null
  ).length;
  const allAnswered = answeredCount === questions.length;

  const featherTime = featherLandTime(medium);
  const hammerTime = VACUUM_FALL_TIME; // hammer falls freely in either medium
  const totalTime = Math.max(featherTime, hammerTime);

  function stopAnimation() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function handleDrop() {
    stopAnimation();
    setPhase('dropping');

    if (prefersReducedMotion()) {
      setFeatherFrac(1);
      setHammerFrac(1);
      setElapsed(totalTime);
      setPhase('landed');
      return;
    }

    const featherCapped = medium === 'air';
    const startedAt = performance.now();

    function step(now: number) {
      const current = (now - startedAt) / 1000;

      setElapsed(Math.min(current, totalTime));
      setFeatherFrac(fallFraction(current, featherCapped));
      setHammerFrac(fallFraction(current, false));

      if (current < totalTime) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      rafRef.current = null;
      setPhase('landed');
    }

    rafRef.current = requestAnimationFrame(step);
  }

  function handleReset() {
    stopAnimation();
    setPhase('idle');
    setElapsed(0);
    setFeatherFrac(0);
    setHammerFrac(0);
  }

  function handleSelectMedium(next: Medium) {
    if (next === medium) {
      return;
    }

    handleReset();
    setMedium(next);
  }

  function handleSelectAnswer(questionId: string, value: string) {
    if (submitted) {
      return;
    }

    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function handleCheck() {
    if (!allAnswered || submitted) {
      return;
    }

    const nextScore = questions.reduce((total, question) => {
      return answers[question.id] === question.answer ? total + 1 : total;
    }, 0);

    setScore(nextScore);
    setSubmitted(true);

    context.reportProgress({ score: nextScore, completed: true });
  }

  useEffect(() => {
    return () => stopAnimation();
  }, []);

  const featherLanded = featherFrac >= 1;
  const hammerLanded = hammerFrac >= 1;

  return (
    <div className="gdr-root">
      <p className="gdr-intro">{t('intro')}</p>

      <div className="gdr-controls" role="group" aria-label={t('mediumAria')}>
        <button
          type="button"
          className="gdr-toggle"
          data-active={medium === 'air'}
          aria-pressed={medium === 'air'}
          onClick={() => handleSelectMedium('air')}
        >
          {t('air')}
        </button>

        <button
          type="button"
          className="gdr-toggle"
          data-active={medium === 'vacuum'}
          aria-pressed={medium === 'vacuum'}
          onClick={() => handleSelectMedium('vacuum')}
        >
          {t('vacuum')}
        </button>
      </div>

      <div className="gdr-scene" data-medium={medium}>
        <div className="gdr-lane">
          <span className="gdr-lane-label">{t('feather')}</span>

          <div
            className="gdr-faller gdr-feather"
            data-medium={medium}
            data-dropping={phase === 'dropping'}
            data-landed={featherLanded}
            style={{ '--fall': String(featherFrac) } as Record<string, string>}
          >
            🪶
          </div>

          <div className="gdr-ground" data-hit={featherLanded} />
        </div>

        <div className="gdr-lane">
          <span className="gdr-lane-label">{t('hammer')}</span>

          <div
            className="gdr-faller gdr-hammer"
            data-dropping={phase === 'dropping'}
            data-landed={hammerLanded}
            style={{ '--fall': String(hammerFrac) } as Record<string, string>}
          >
            🔨
          </div>

          <div className="gdr-ground" data-hit={hammerLanded} />
        </div>
      </div>

      <div className="gdr-readout" aria-live="polite">
        <span className="gdr-timer">
          {t('timer', { time: elapsed.toFixed(2) })}
        </span>

        {phase === 'landed' ? (
          <span className="gdr-outcome">
            {medium === 'vacuum'
              ? t('outcomeVacuum')
              : t('outcomeAir', {
                  hammerTime: hammerTime.toFixed(2),
                  featherTime: featherTime.toFixed(2)
                })}
          </span>
        ) : null}
      </div>

      <div className="gdr-actions">
        <button
          type="button"
          className="gdr-primary"
          disabled={phase === 'dropping'}
          onClick={handleDrop}
        >
          {t('dropAndCheck')}
        </button>

        <button
          type="button"
          className="gdr-secondary"
          disabled={phase === 'idle'}
          onClick={handleReset}
        >
          {t('reset')}
        </button>
      </div>

      <div className="gdr-quiz">
        <h3 className="gdr-quiz-title">{t('quizTitle')}</h3>

        {questions.map((question) => (
          <section
            key={question.id}
            className="gdr-question"
            aria-labelledby={`${question.id}-title`}
          >
            <h4 id={`${question.id}-title`} className="gdr-question-title">
              {question.prompt}
            </h4>

            <div className="gdr-options" role="group" aria-label={question.prompt}>
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="gdr-option"
                  data-selected={answers[question.id] === option}
                  data-correct={submitted && option === question.answer}
                  data-wrong={
                    submitted &&
                    answers[question.id] === option &&
                    option !== question.answer
                  }
                  aria-pressed={answers[question.id] === option}
                  onClick={() => handleSelectAnswer(question.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="gdr-actions">
          <button
            type="button"
            className="gdr-primary"
            disabled={!allAnswered || submitted}
            onClick={handleCheck}
          >
            {t('checkAnswers')}
          </button>

          {!allAnswered && !submitted ? (
            <p className="gdr-intro">
              {t('progress', {
                answered: answeredCount,
                total: questions.length
              })}
            </p>
          ) : null}
        </div>

        {submitted && score !== null ? (
          <p className="gdr-result">
            <img className="gdr-result-icon" src={checkIconUrl} alt="" />

            <span>
              {t('result', { score, total: questions.length })}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
