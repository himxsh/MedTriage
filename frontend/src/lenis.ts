import { useEffect } from 'react';
import Lenis from 'lenis';

let lenis: Lenis | null = null;

export function getLenis() {
  return lenis;
}

/** Mount once at app root — smooth scroll for every page. */
export function useLenisRoot() {
  useEffect(() => {
    const instance = new Lenis({
      autoRaf: true,
      anchors: true,
      autoToggle: true,
    });
    lenis = instance;
    return () => {
      instance.destroy();
      lenis = null;
    };
  }, []);
}
