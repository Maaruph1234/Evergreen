import '../styles/volunteer.css';
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
    mailtoSubmit: (e: Event) => void;
  }
}

// Volunteer application "submit": builds a mailto: link from the form fields.
// (There's no backend yet, so this opens the visitor's email client.)
window.mailtoSubmit = (e) => {
  e.preventDefault();

  const to = 'info@evergreenlifecare.org';
  const val = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '';

  const first = val('firstName');
  const last = val('lastName');
  const email = val('email');
  const phone = val('phone');
  const area = val('area');
  const bio = val('bio');

  const subject = encodeURIComponent(`Volunteer Application: ${area || 'General'}`);
  const bodyLines = [
    `Name: ${first} ${last}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Area of Interest: ${area}`,
    '',
    'Bio/Message:',
    bio,
  ];
  const body = encodeURIComponent(bodyLines.join('\n'));

  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
};

initChatbot();
