/**
 * Shows/hides the "scroll to top" floating button once the visitor has
 * scrolled down. The click handler itself stays as an inline
 * `onclick="window.scrollTo(...)"` in the markup — only the visibility
 * toggle needs JS wiring.
 */
export function initScrollTop(threshold = 400): void {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > threshold);
  });
}
