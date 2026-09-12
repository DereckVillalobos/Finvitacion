'use client';
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import SecretEnvelope from './SecretEnvelope';
import InvitationCard from './InvitationCard';
import LoadingScreen from './LoadingScreen';
import { animateEnvelope } from './EnvelopeAnimation';
import { AudioManager } from '@/lib/AudioManager';
import {
  experienceReducer,
  type ExperienceState,
} from '@/lib/experience-state';
const loadOcean = () => import('./ocean/OceanWorld');
const OceanWorld = lazy(loadOcean);
class ImportBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function ExperienceController() {
  const [state, dispatch] = useReducer(experienceReducer, 'LOCKED');
  const [muted, setMuted] = useState(false),
    [reduced, setReduced] = useState(false),
    [ready, setReady] = useState(false),
    [openingDone, setOpeningDone] = useState(false),
    [debug, setDebug] = useState(false);
  const root = useRef<HTMLElement>(null),
    audio = useRef(new AudioManager()),
    busy = useRef(false),
    animation = useRef<ReturnType<typeof animateEnvelope> | null>(null),
    discoverButton = useRef<HTMLButtonElement>(null);
  const next = useCallback(
    (to: ExperienceState) => dispatch({ type: 'NEXT', to }),
    [],
  );
  const onReady = useCallback(() => setReady(true), []);
  const discovered = ['SHARK_DISCOVERED', 'INVITATION', 'COMPLETE'].includes(
      state,
    ),
    showOcean = state !== 'LOCKED';
  const discover = useCallback(() => {
    if (state !== 'OCEAN') return;
    audio.current.play('water');
    audio.current.play('bubble-pop');
    next('SHARK_DISCOVERED');
  }, [state, next]);
  const complete = useCallback(() => next('COMPLETE'), [next]);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    setDebug(new URLSearchParams(location.search).get('debug') === '1');
    const preload = window.setTimeout(() => {
      void loadOcean().catch(() => {});
    }, 1000);
    const visibility = () => {
      if (document.hidden) audio.current.pause();
      else if (busy.current) audio.current.resume();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearTimeout(preload);
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
      animation.current?.kill();
      audio.current.dispose();
    };
  }, []);
  useEffect(() => {
    if (debug) console.debug('[Invitación Secreta]', state);
    root.current?.dispatchEvent(
      new CustomEvent('experience:state', { detail: { state }, bubbles: true }),
    );
  }, [state, debug]);
  useEffect(() => {
    if (state === 'TRANSITIONING' && ready && openingDone) {
      next('OCEAN');
      audio.current.play('ocean');
    }
  }, [state, ready, openingDone, next]);
  useEffect(() => {
    if (state === 'OCEAN')
      discoverButton.current?.focus({ preventScroll: true });
  }, [state]);
  useEffect(() => {
    if (state !== 'SHARK_DISCOVERED') return;
    const id = window.setTimeout(
      () => {
        audio.current.play('magic-chime');
        next('INVITATION');
      },
      reduced ? 300 : 3600,
    );
    return () => clearTimeout(id);
  }, [state, reduced, next]);
  const open = () => {
    if (busy.current || !root.current) return;
    busy.current = true;
    void audio.current.unlock().then(() => audio.current.play('paper'));
    next('OPENING');
    animation.current = animateEnvelope(
      root.current,
      reduced,
      audio.current,
      () => next('TRANSITIONING'),
      () => setOpeningDone(true),
    );
  };
  const replay = () => {
    animation.current?.revert();
    animation.current = null;
    audio.current.stopOcean();
    busy.current = false;
    setReady(false);
    setOpeningDone(false);
    dispatch({ type: 'RESET' });
    window.setTimeout(
      () =>
        root.current
          ?.querySelector<HTMLButtonElement>('.seal-control')
          ?.focus(),
      0,
    );
  };
  const fallback = (
    <div className="ocean-fallback">
      <div className="fallback-sun" />
      <div className="fallback-water" />
      <button
        className="fallback-secret"
        onClick={() => {
          setReady(true);
          if (state === 'OCEAN') discover();
        }}
      >
        Descubrir tu sorpresa
      </button>
      <FallbackReady onReady={onReady} />
    </div>
  );
  const act =
    state === 'LOCKED' || state === 'OPENING' ? 1 : discovered ? 3 : 2;
  return (
    <main
      ref={root}
      className={`experience ${showOcean ? 'has-ocean' : ''}`}
      data-state={state}
    >
      <svg width="0" height="0" aria-hidden="true" className="filter-defs">
        <filter id="paper-water">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".009 .05"
            numOctaves="2"
            seed="8"
          />
          <feDisplacementMap
            in="SourceGraphic"
            scale="35"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div className="room-glow" aria-hidden="true" />
      {showOcean && (
        <div
          className="ocean-world"
          aria-label="Océano al atardecer con un tiburón rosa"
        >
          <ImportBoundary fallback={fallback}>
            <Suspense fallback={<LoadingScreen />}>
              <OceanWorld
                discovered={discovered}
                reduced={reduced}
                onDiscover={discover}
                onReady={onReady}
              />
            </Suspense>
          </ImportBoundary>
        </div>
      )}
      <div className="grain" aria-hidden="true" />
      <div className="top-controls">
        {act > 1 && <span className="act-number">0{act} / 03</span>}
        <button
          className="audio-control"
          onClick={() => {
            const value = !muted;
            setMuted(value);
            audio.current.setMuted(value);
          }}
          aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
          aria-pressed={!muted}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </div>
      {(!openingDone || state === 'LOCKED') && (
        <section
          className="letter-act"
          style={{ clipPath: 'circle(150% at 50% 50%)' }}
        >
          <div className="letter-heading">
            <h1>
              Toca la carta con el plan
              <br />
              más cool del mundo
            </h1>
          </div>
          <SecretEnvelope onOpen={open} disabled={state !== 'LOCKED'} />
        </section>
      )}
      {openingDone && !ready && <LoadingScreen />}
      {state === 'OCEAN' && (
        <button
          ref={discoverButton}
          className="accessible-discover"
          onClick={discover}
        >
          Descubrir el secreto del tiburón <span>↗</span>
        </button>
      )}
      {(state === 'INVITATION' || state === 'COMPLETE') && (
        <InvitationCard
          reduced={reduced}
          onComplete={complete}
          onReplay={replay}
        />
      )}
      <div className="chapter-track" aria-label={`Acto ${act} de 3`}>
        {[1, 2, 3].map((i) => (
          <i key={i} className={i === act ? 'active' : ''} />
        ))}
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'OCEAN'
          ? 'El océano está listo. Tocá al tiburón rosa para descubrir tu invitación.'
          : state === 'SHARK_DISCOVERED'
            ? 'El tiburón trae una sorpresa para vos.'
            : ''}
      </span>
      {debug && (
        <output className="debug-state">
          {state} · {reduced ? 'reduced motion' : 'full motion'}
        </output>
      )}
    </main>
  );
}
function FallbackReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}
