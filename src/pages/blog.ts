import '../styles/blog.css';
import '../styles/chatbot.css';

import { initMobileMenu } from '../lib/menu';
import { initScrollTop } from '../lib/scrollTop';
import { initReveal } from '../lib/reveal';
import { initChatbot } from '../lib/chatbot';

initMobileMenu();
initScrollTop();
initReveal();

// Blog category filter buttons (visual active state only).
document.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', function (this: HTMLButtonElement) {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    this.classList.add('active');
  });
});

initChatbot();
