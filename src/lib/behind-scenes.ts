interface BtsItem {
  type: 'photo' | 'video';
  src: string;
  caption: string;
}

const ITEMS: BtsItem[] = [
  { type: 'photo', src: '/outreach/bts-team-2.jpg', caption: 'Our team, before the crowd arrived' },
  { type: 'video', src: '/outreach/bts-video-interview-1.mp4', caption: 'A community member speaks with KTV' },
  { type: 'photo', src: '/outreach/bts-registration.jpg', caption: 'Signing families in as they arrive' },
  { type: 'photo', src: '/outreach/bts-child-checkup.jpg', caption: 'A quick health check for the little ones' },
  { type: 'video', src: '/outreach/bts-video-queue.mp4', caption: 'The queue that kept growing all morning' },
  { type: 'photo', src: '/outreach/bts-interview-mother.jpg', caption: 'A mother tells KTV what the outreach meant to her' },
  { type: 'photo', src: '/outreach/bts-colleagues.jpg', caption: 'Between patients, still smiling' },
  { type: 'photo', src: '/outreach/bts-documenting.jpg', caption: 'Local TV crew covering the outreach' },
];

// Per-depth appearance, front card first. Anything beyond this list is hidden.
const DEPTH_STYLE = [
  { scale: 1, y: 0, rotate: 0, opacity: 1 },
  { scale: 0.93, y: 16, rotate: -5, opacity: 0.85 },
  { scale: 0.87, y: 30, rotate: 4, opacity: 0.6 },
  { scale: 0.81, y: 42, rotate: -3, opacity: 0.35 },
];

const AUTO_ADVANCE_MS = 4000;

export function initBehindTheScenes(): void {
  const stack = document.getElementById('btsStack');
  const wrap = document.getElementById('btsStackWrap');
  if (!stack || !wrap) return;

  let order = ITEMS.map((_, i) => i);
  let autoTimer: number | undefined;

  const cards = ITEMS.map((item, i) => {
    const card = document.createElement('div');
    card.className = 'bts-card';

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      card.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.caption;
      img.loading = 'lazy';
      card.appendChild(img);
    }

    const fade = document.createElement('div');
    fade.className = 'bts-card-fade';
    card.appendChild(fade);

    const caption = document.createElement('div');
    caption.className = 'bts-card-caption';
    if (item.type === 'video') {
      const badge = document.createElement('span');
      badge.className = 'bts-play-badge';
      badge.innerHTML = '<i class="fas fa-play"></i>';
      caption.appendChild(badge);
    }
    const text = document.createElement('span');
    text.textContent = item.caption;
    caption.appendChild(text);
    card.appendChild(caption);

    card.addEventListener('click', () => {
      if (order[0] === i) advance();
    });

    stack.appendChild(card);
    return card;
  });

  function render(): void {
    order.forEach((itemIndex, pos) => {
      const card = cards[itemIndex];
      const style = DEPTH_STYLE[pos];

      if (!style) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.zIndex = '0';
        return;
      }

      card.style.transform = `translateY(${style.y}px) scale(${style.scale}) rotate(${style.rotate}deg)`;
      card.style.opacity = String(style.opacity);
      card.style.zIndex = String(DEPTH_STYLE.length - pos);
      card.style.pointerEvents = pos === 0 ? 'auto' : 'none';
      card.style.cursor = pos === 0 ? 'pointer' : 'default';

      const video = card.querySelector('video');
      if (video) {
        if (pos === 0) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }

  function advance(): void {
    order.push(order.shift()!);
    render();
  }

  function back(): void {
    order.unshift(order.pop()!);
    render();
  }

  function shuffle(): void {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    render();
  }

  function startAuto(): void {
    stopAuto();
    autoTimer = window.setInterval(advance, AUTO_ADVANCE_MS);
  }
  function stopAuto(): void {
    if (autoTimer) window.clearInterval(autoTimer);
  }

  document.getElementById('btsNext')?.addEventListener('click', () => {
    advance();
    startAuto();
  });
  document.getElementById('btsPrev')?.addEventListener('click', () => {
    back();
    startAuto();
  });
  document.getElementById('btsShuffle')?.addEventListener('click', () => {
    shuffle();
    startAuto();
  });

  wrap.addEventListener('mouseenter', stopAuto);
  wrap.addEventListener('mouseleave', startAuto);

  render();
  startAuto();
}
