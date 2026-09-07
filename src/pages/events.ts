import '../styles/events.css';
import '../styles/chatbot.css';

import { initMobileMenu } from '../lib/menu';
import { initScrollTop } from '../lib/scrollTop';
import { initReveal } from '../lib/reveal';
import { initCountdown } from '../lib/countdown';
import { initChatbot } from '../lib/chatbot';

initMobileMenu();
initScrollTop();
initReveal();

initCountdown('2026-09-21T09:00:00', {
  days: 'cdDays',
  hours: 'cdHrs',
  mins: 'cdMin',
  secs: 'cdSec',
});

initChatbot();
