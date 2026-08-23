import '../styles/contact.css';
import '../styles/chatbot.css';

import { initMobileMenu } from '../lib/menu';
import { initScrollTop } from '../lib/scrollTop';
import { initReveal } from '../lib/reveal';
import { initChatbot } from '../lib/chatbot';

initMobileMenu();
initScrollTop();
initReveal();

declare global {
  interface Window {
    toggleFaq: (el: HTMLElement) => void;
  }
}

// Expands/collapses an FAQ answer. Markup calls this via onclick="toggleFaq(this)".
window.toggleFaq = (el) => {
  el.parentElement?.classList.toggle('open');
};

initChatbot();
