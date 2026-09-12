import gsap from 'gsap';
import type { AudioManager } from '@/lib/AudioManager';
export function animateEnvelope(
  root: HTMLElement,
  reduced: boolean,
  audio: AudioManager,
  onPortal: () => void,
  onDone: () => void,
) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline();
  if (reduced) {
    tl.to(q('.seal-control'), { opacity: 0, duration: 0.15 })
      .to(q('.letter-act'), { opacity: 0, duration: 0.25 })
      .call(onPortal)
      .call(onDone);
    return tl;
  }
  tl.to(q('.seal-control'), { rotation: 8, scale: 0.94, duration: 0.14 })
    .call(() => audio.play('seal-crack'))
    .to(q('.seal-imprint'), { opacity: 0, duration: 0.13 }, '<')
    .to(
      q('.seal-left'),
      { x: -21, y: 15, rotation: -28, duration: 0.5, ease: 'power2.in' },
      '<',
    )
    .to(
      q('.seal-right'),
      { x: 24, y: 30, rotation: 38, duration: 0.5, ease: 'power2.in' },
      '<',
    )
    .to(q('.seal-control'), { opacity: 0, duration: 0.3 }, '-.2')
    .to(
      q('.letter-heading, .letter-caption'),
      { opacity: 0, y: -12, duration: 0.65 },
      0.45,
    )
    .to(q('.envelope'), { rotation: 0, duration: 0.8 }, 0.6)
    .call(() => audio.play('paper'), [], 0.8)
    .to(
      q('.envelope-flap'),
      { rotationX: 180, duration: 0.95, ease: 'power2.inOut' },
      0.8,
    )
    .set(q('.envelope-flap'), { zIndex: 1 }, 1.3)
    .to(
      q('.inner-letter'),
      { yPercent: -62, duration: 1.05, ease: 'power3.inOut' },
      1.5,
    )
    .set(q('.inner-letter'), { zIndex: 8 }, 2.5)
    .to(q('.inner-letter'), { yPercent: -25, scale: 1.18, duration: 0.7 }, 2.45)
    .call(onPortal, [], 2.7)
    .call(() => audio.play('whoosh'), [], 3)
    .to(
      q('.envelope-stage'),
      {
        scale:
          Math.max(window.innerHeight / 200, window.innerWidth / 250) * 1.65,
        y: 0,
        duration: 2.1,
        ease: 'power3.in',
      },
      2.9,
    )
    .to(q('.liquid-surface'), { opacity: 1, duration: 1.1 }, 3.05)
    .to(
      q('.inner-letter>span, .inner-letter>em'),
      { opacity: 0, duration: 0.6 },
      3.15,
    )
    .to(
      q('.letter-act'),
      {
        clipPath: 'circle(0% at 50% 50%)',
        duration: 1.15,
        ease: 'power2.inOut',
      },
      4.65,
    )
    .call(onDone);
  return tl;
}
