/** Sets --vh to 1% of the real viewport height, as a fallback for browsers
 * that size 100vh/100svh inconsistently on mobile. */
export function initViewportHeightVar(): void {
  const setVh = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };
  setVh();
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);
}
