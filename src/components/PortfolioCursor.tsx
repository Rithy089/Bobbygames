import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function PortfolioCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const { t } = useTranslation();
  useEffect(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    const hide = () => {
      root.classList.remove('bobby-cursor-active');
      if (cursor.current) cursor.current.hidden = true;
      if (glow.current) glow.current.hidden = true;
    };
    const move = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (
        !fine.matches ||
        reduced.matches ||
        event.pointerType === 'touch' ||
        target?.closest(
          'input,textarea,select,[contenteditable],canvas,.match-board,:disabled,[aria-disabled="true"]',
        )
      ) {
        hide();
        return;
      }
      if (!cursor.current || !glow.current || !label.current) return;
      const interactive = target?.closest(
        'a,button,[role="button"],[role="switch"],[role="slider"]',
      );
      label.current.textContent = interactive ? t('cursorAction') : '';
      cursor.current.classList.toggle('is-interactive', !!interactive);
      cursor.current.hidden = false;
      glow.current.hidden = false;
      cursor.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      glow.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      root.classList.add('bobby-cursor-active');
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab') hide();
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', hide);
    window.addEventListener('keydown', keyboard);
    root.addEventListener('mouseleave', hide);
    fine.addEventListener('change', hide);
    reduced.addEventListener('change', hide);
    return () => {
      hide();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', hide);
      window.removeEventListener('keydown', keyboard);
      root.removeEventListener('mouseleave', hide);
      fine.removeEventListener('change', hide);
      reduced.removeEventListener('change', hide);
    };
  }, [t]);
  return (
    <>
      <div
        ref={glow}
        className="bobby-pointer-glow"
        aria-hidden="true"
        hidden
      />
      <div
        ref={cursor}
        className="bobby-custom-cursor"
        aria-hidden="true"
        hidden
      >
        <svg viewBox="0 0 20 20">
          <path d="M10 1v18M1 10h18" />
        </svg>
        <span ref={label} />
      </div>
    </>
  );
}
