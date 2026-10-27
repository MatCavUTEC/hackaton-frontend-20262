import { flushSync } from "react-dom";

// ¿El usuario pidió "reducir movimiento" en su sistema operativo?
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Navega usando la View Transition API si el navegador la tiene y el
// usuario no pidió menos movimiento. Si no, navega normal.
// flushSync obliga a React a dibujar la página nueva DENTRO de la transición,
// así el navegador puede animar de la foto vieja a la nueva.
export function navigateWithTransition(go: () => void): void {
  if (!("startViewTransition" in document) || prefersReducedMotion()) {
    go();
    return;
  }
  document.startViewTransition(() => {
    flushSync(go);
  });
}
