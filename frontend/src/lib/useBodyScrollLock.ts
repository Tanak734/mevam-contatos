import { useEffect } from 'react';

let activeLocks = 0;
let previousOverflow = '';

/** Menus e modais compartilham o bloqueio e liberam a página ao fechar o último. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    if (activeLocks === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    activeLocks += 1;

    return () => {
      activeLocks -= 1;
      if (activeLocks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
