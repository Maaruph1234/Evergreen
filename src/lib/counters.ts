/**
 * Animated number counters (used on the homepage stats and the programs
 * page impact numbers). Each `.counter` element reads its target value
 * from `data-target` and counts up to it.
 */
export function startCounter(el: HTMLElement, durationMs = 1800): void {
  const target = parseInt(el.dataset.target ?? '0', 10);
  const step = Math.ceil(target / (durationMs / 16));
  let current = 0;

  const tick = window.setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString();
    if (current >= target) window.clearInterval(tick);
  }, 16);
}

const countedEls = new WeakSet<HTMLElement>();

/** Runs `startCounter` at most once per element, even if re-triggered. */
export function startCounterOnce(el: HTMLElement, durationMs?: number): void {
  if (countedEls.has(el)) return;
  countedEls.add(el);
  startCounter(el, durationMs);
}

/**
 * Watches every `.stat-item` and starts the counters inside it the first
 * time it scrolls into view.
 */
export function initCounterObservers(threshold = 0.2): void {
  document.querySelectorAll<HTMLElement>('.stat-item').forEach((item) => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll<HTMLElement>('.counter')
              .forEach((counter) => startCounterOnce(counter));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    io.observe(item);
  });
}
