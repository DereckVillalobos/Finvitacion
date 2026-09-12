import { useEffect, useRef } from 'react';
import gsap from 'gsap';
export default function InvitationCard({
  reduced,
  onComplete,
  onReplay,
}: {
  reduced: boolean;
  onComplete: () => void;
  onReplay: () => void;
}) {
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!card.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete });
      tl.fromTo(
        card.current,
        { y: reduced ? 0 : 150, opacity: 0, rotationX: reduced ? 0 : 13 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: reduced ? 0.25 : 1.35,
          ease: 'power3.out',
        },
      );
      tl.fromTo(
        '.invitation-line',
        { opacity: 0, y: reduced ? 0 : 16 },
        {
          opacity: 1,
          y: 0,
          duration: reduced ? 0.15 : 0.72,
          stagger: reduced ? 0.12 : 0.72,
          ease: 'power2.out',
        },
        reduced ? 0.2 : 0.65,
      );
    }, card);
    card.current.focus({ preventScroll: true });
    return () => ctx.revert();
  }, [reduced, onComplete]);
  return (
    <div className="invitation-wrap">
      <article
        className="invitation-card"
        ref={card}
        tabIndex={-1}
        aria-label="Invitación para Fabi"
      >
        <div className="card-glint" aria-hidden="true" />
        <h2 className="invitation-line">Fabi…</h2>
        <p className="invitation-line invitation-message">
          Estás cordialmente invitada
          <br className="wide-break" /> a ir por unas <em>Papas Chamo</em>{' '}
          <span className="invitation-emojis">🍟</span>
        </p>
        <p className="invitation-line excitement">¡Qué emoción!</p>
        <div className="invitation-line card-divider" />
        <p className="invitation-line see-you">
          Ya casi nos vemos !!!
        </p>
        <button className="invitation-line replay" onClick={onReplay}>
          volver al inicio
        </button>
      </article>
    </div>
  );
}
