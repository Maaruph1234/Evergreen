import '../styles/programs.css';
import '../styles/chatbot.css';

import { initMobileMenu } from '../lib/menu';
import { initScrollTop } from '../lib/scrollTop';
import { initReveal } from '../lib/reveal';
import { initCounterObservers } from '../lib/counters';
import { initChatbot } from '../lib/chatbot';

initMobileMenu();
initScrollTop();
const revealObserver = initReveal();
initCounterObservers();

const TAB_IDS = ['education', 'tech', 'healthcare', 'entrepreneurship', 'empowerment'] as const;

declare global {
  interface Window {
    showTab: (id: (typeof TAB_IDS)[number], btn?: HTMLElement) => void;
  }
}

// Program tabs. Markup calls this via onclick="showTab('tech', this)".
window.showTab = (id, btn) => {
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
  btn?.classList.add('active');

  TAB_IDS.forEach((tab) => {
    const section = document.getElementById(`tab-${tab}`);
    if (section) section.style.display = tab === id ? 'block' : 'none';
  });

  // Replay the reveal animation for the newly-visible tab's content.
  window.setTimeout(() => {
    document.querySelectorAll(`#tab-${id} .reveal`).forEach((el) => {
      revealObserver.observe(el);
      el.classList.remove('visible');
      window.setTimeout(() => el.classList.add('visible'), 50);
    });
  }, 50);
};

initChatbot();
