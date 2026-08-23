import '../styles/index.css';
import '../styles/chatbot.css';

import { initMobileMenu } from '../lib/menu';
import { initScrollTop } from '../lib/scrollTop';
import { initReveal } from '../lib/reveal';
import { initCounterObservers, startCounter } from '../lib/counters';
import { initCountdown } from '../lib/countdown';
import { initChatbot } from '../lib/chatbot';
import { initDonorPortal } from '../lib/donor-portal';
import { initViewportHeightVar } from '../lib/viewportHeight';

initViewportHeightVar();
initMobileMenu();
initScrollTop();

// Rotating hero background photos.
const heroSlides = document.querySelectorAll<HTMLElement>('.hero-slide');
if (heroSlides.length > 1) {
  let heroIdx = 0;
  window.setInterval(() => {
    heroSlides[heroIdx]?.classList.remove('active');
    heroIdx = (heroIdx + 1) % heroSlides.length;
    heroSlides[heroIdx]?.classList.add('active');
  }, 4500);
}

// Reveal-on-scroll also kicks off counters inside a revealed section.
initReveal((el) => {
  el.querySelectorAll<HTMLElement>('.counter').forEach((counter) => startCounter(counter));
});

// Nav background changes once the page is scrolled.
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 60);
});

// Smooth scroll for in-page anchor links (e.g. nav "Donate" -> #donate).
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')?.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

initCounterObservers();

// Donation amount picker.
declare global {
  interface Window {
    selectAmt: (btn: HTMLElement, amount: string) => void;
    updateTotal: () => void;
  }
}

window.selectAmt = (btn, amount) => {
  document.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const customAmt = document.getElementById('customAmt') as HTMLInputElement | null;
  if (customAmt) customAmt.value = '';
  const total = document.getElementById('totalDisplay');
  if (total) total.innerHTML = '&#8358;' + parseInt(amount, 10).toLocaleString();
};

window.updateTotal = () => {
  const customAmt = document.getElementById('customAmt') as HTMLInputElement | null;
  const val = parseInt(customAmt?.value ?? '', 10);
  if (!isNaN(val) && val > 0) {
    document.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('active'));
    const total = document.getElementById('totalDisplay');
    if (total) total.innerHTML = '&#8358;' + val.toLocaleString();
  }
};

// Countdown to KYDEEI Cohort 1 (September 21, 2026) — mirrors the events page.
initCountdown('2026-09-21T09:00:00', {
  days: 'cdDays',
  hours: 'cdHrs',
  mins: 'cdMin',
  secs: 'cdSec',
});

// Splash overlay: auto-hide after 5s, or on click / Escape.
(function initSplash() {
  const splash = document.getElementById('siteSplash');
  if (!splash) return;

  let removed = false;
  function removeSplash(): void {
    if (removed) return;
    removed = true;
    splash!.classList.add('hidden');
    window.setTimeout(() => splash!.remove(), 600);
  }

  const timer = window.setTimeout(removeSplash, 5000);
  splash.addEventListener('click', () => {
    window.clearTimeout(timer);
    removeSplash();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.clearTimeout(timer);
      removeSplash();
    }
  });
})();

initChatbot();
initDonorPortal();
