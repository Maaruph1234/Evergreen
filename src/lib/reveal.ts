/**
 * Scroll-triggered reveal animation shared by every page: any element with
 * the `.reveal` class fades/slides into view the first time it enters the
 * viewport.
 *
 * `onReveal` lets a page hook additional behaviour onto the same
 * observer (e.g. starting number counters once their container reveals).
 */
export function initReveal(
  onReveal?: (el: Element) => void,
  threshold = 0.12
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          onReveal?.(entry.target);
        }
      });
    },
    { threshold }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  return observer;
}
