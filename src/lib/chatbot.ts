import { FAQ_ENTRIES, type FaqEntry } from './faq-data';
import { whatsappUrlWithText } from './site-config';

type Sender = 'bot' | 'user';

interface ChatMessage {
  sender: Sender;
  text: string;
  link?: { label: string; href: string };
}

const WELCOME_MESSAGE =
  "Hi! I'm the Evergreen Lifecare assistant. Ask me about our programs, events, volunteering, donating, or how to reach us. If I can't answer, I'll connect you with our team on WhatsApp.";

const MATCH_THRESHOLD = 1;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreEntry(input: string, entry: FaqEntry): number {
  let score = 0;
  for (const keyword of entry.keywords) {
    const normKeyword = normalize(keyword);
    if (normKeyword && input.includes(normKeyword)) {
      score += normKeyword.split(' ').length;
    }
  }
  return score;
}

function findBestMatch(rawInput: string): FaqEntry | null {
  const input = normalize(rawInput);
  if (!input) return null;

  let best: FaqEntry | null = null;
  let bestScore = 0;

  for (const entry of FAQ_ENTRIES) {
    const s = scoreEntry(input, entry);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  return bestScore >= MATCH_THRESHOLD ? best : null;
}

/** Builds the floating widget and wires up matching. Safe to call on every page. */
export function initChatbot(): void {
  if (document.getElementById('evgChatbot')) return; // already initialised

  const root = document.createElement('div');
  root.id = 'evgChatbot';
  root.className = 'evg-chat';
  root.innerHTML = `
    <div class="evg-chat-greeting" id="evgChatGreeting" role="status">
      <button type="button" class="evg-chat-greeting-close" id="evgChatGreetingClose" aria-label="Dismiss">
        <i class="fas fa-times"></i>
      </button>
      <span>Hi, I'm Evergreen AI — how can I assist you today?</span>
    </div>
    <button type="button" class="evg-chat-toggle" id="evgChatToggle" aria-label="Open chat with Evergreen Lifecare assistant">
      <i class="fas fa-comment-dots"></i>
    </button>
    <div class="evg-chat-panel" id="evgChatPanel">
      <div class="evg-chat-header">
        <div>
          <strong>Evergreen Assistant</strong>
          <span>Ask about programs, events &amp; more</span>
        </div>
        <button type="button" class="evg-chat-close" id="evgChatClose" aria-label="Close chat">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="evg-chat-messages" id="evgChatMessages"></div>
      <form class="evg-chat-input-row" id="evgChatForm">
        <input
          type="text"
          id="evgChatInput"
          placeholder="Type your question..."
          autocomplete="off"
          aria-label="Your question"
        />
        <button type="submit" aria-label="Send">
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const toggle = root.querySelector<HTMLButtonElement>('#evgChatToggle')!;
  const greeting = root.querySelector<HTMLDivElement>('#evgChatGreeting')!;
  const greetingClose = root.querySelector<HTMLButtonElement>('#evgChatGreetingClose')!;
  const panel = root.querySelector<HTMLDivElement>('#evgChatPanel')!;
  const closeBtn = root.querySelector<HTMLButtonElement>('#evgChatClose')!;
  const messagesEl = root.querySelector<HTMLDivElement>('#evgChatMessages')!;
  const form = root.querySelector<HTMLFormElement>('#evgChatForm')!;
  const input = root.querySelector<HTMLInputElement>('#evgChatInput')!;

  const messages: ChatMessage[] = [{ sender: 'bot', text: WELCOME_MESSAGE }];

  function render(): void {
    messagesEl.innerHTML = '';
    for (const msg of messages) {
      const bubble = document.createElement('div');
      bubble.className = `evg-chat-msg evg-chat-msg-${msg.sender}`;

      const text = document.createElement('p');
      text.textContent = msg.text;
      bubble.appendChild(text);

      if (msg.link) {
        const link = document.createElement('a');
        link.href = msg.link.href;
        link.textContent = msg.link.label;
        link.target = '_blank';
        link.rel = 'noopener';
        link.className = 'evg-chat-link';
        bubble.appendChild(link);
      }

      messagesEl.appendChild(bubble);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function isOpen(): boolean {
    return panel.classList.contains('open');
  }

  function openPanel(): void {
    panel.classList.add('open');
    toggle.classList.add('open');
    window.setTimeout(() => input.focus(), 50);
  }

  function closePanel(): void {
    panel.classList.remove('open');
    toggle.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    if (isOpen()) closePanel();
    else openPanel();
    hideGreeting();
  });
  closeBtn.addEventListener('click', closePanel);

  // Greeting flash bubble: invites engagement shortly after load, then fades.
  function hideGreeting(): void {
    greeting.classList.remove('show');
  }
  greetingClose.addEventListener('click', (e) => {
    e.stopPropagation();
    hideGreeting();
  });
  greeting.addEventListener('click', () => {
    hideGreeting();
    openPanel();
  });
  if (!sessionStorage.getItem('evgGreetingSeen')) {
    window.setTimeout(() => {
      if (!isOpen()) greeting.classList.add('show');
      window.setTimeout(hideGreeting, 7000);
    }, 1800);
    sessionStorage.setItem('evgGreetingSeen', '1');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    messages.push({ sender: 'user', text: question });

    const match = findBestMatch(question);
    if (match) {
      messages.push({
        sender: 'bot',
        text: match.answer,
        link:
          match.link?.href === 'whatsapp'
            ? { label: 'Chat on WhatsApp', href: whatsappUrlWithText(question) }
            : match.link,
      });
    } else {
      messages.push({
        sender: 'bot',
        text:
          "I don't have a confident answer for that yet. Let's get you straight to our team on WhatsApp — they can help directly.",
        link: { label: 'Chat with us on WhatsApp', href: whatsappUrlWithText(question) },
      });
    }

    input.value = '';
    render();
  });

  render();
}
