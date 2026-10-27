import { h } from './dom';
import { sound } from './sound';

// Simulated conversational message previews. These are PLACEHOLDER examples, not
// recovered quotes or real contacts. Only the template id is ever tracked.
export interface MessageTemplate {
  id: string;
  sender: string;
  preview: string;
  full: string;
}

export const MESSAGE_TEMPLATES: readonly MessageTemplate[] = [
  { id: 'friend_join', sender: 'Alex', preview: 'Are you joining us?', full: 'Are you joining us tonight? Everyone is asking.' },
  { id: 'group_unread', sender: 'Study group', preview: '3 new messages', full: 'Priya: Did anyone finish the notes? (+2 more)' },
  { id: 'friend_news', sender: 'Sam', preview: 'You will not believe this…', full: 'You will not believe what just happened. Call me!' },
  { id: 'group_plans', sender: 'Weekend plans', preview: "Who's in for Saturday?", full: "Who's in for Saturday? Vote before 6 pm." },
  { id: 'friend_reply', sender: 'Riya', preview: 'Hey, quick question', full: 'Hey, quick question about tomorrow. Are you free?' },
  { id: 'group_photos', sender: 'Class of 2026', preview: '12 new photos', full: 'Maya shared 12 new photos from the farewell.' },
];

const VISIBLE_MS = 4500;
const EXPANDED_MS = 3000;

interface LaneOptions {
  onShown: (template: MessageTemplate) => void;
  onTap: (template: MessageTemplate) => void;
}

/**
 * A fixed-height lane reserved from the start of the round. Messages slide in and
 * expand only inside this lane, so they never cover tiles, the timer or controls
 * and never shift the layout. Timing follows round time, so it pauses with the round.
 */
export class MessageLane {
  readonly el: HTMLElement;
  private card: HTMLElement | null = null;
  private current: MessageTemplate | null = null;
  private hideAt = 0;
  private collapseAt: number | null = null;
  private now = 0;

  constructor(private readonly opts: LaneOptions) {
    this.el = h('div', { class: 'msg-lane', 'aria-live': 'polite' });
  }

  show(template: MessageTemplate, now: number): void {
    this.removeCard();
    this.current = template;
    this.hideAt = now + VISIBLE_MS;
    this.collapseAt = null;

    const close = h('button', {
      class: 'msg-close',
      type: 'button',
      'aria-label': 'Close message',
      html: '&times;',
      onclick: (e: Event) => {
        e.stopPropagation();
        this.hide();
      },
    });
    const card = h(
      'div',
      {
        class: 'msg-card',
        role: 'button',
        tabindex: 0,
        'aria-label': `Simulated message from ${template.sender}`,
        onclick: () => this.handleTap(),
        onkeydown: (e: Event) => {
          const key = (e as KeyboardEvent).key;
          if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            this.handleTap();
          }
        },
      },
      [
        h('span', { class: 'msg-avatar', 'aria-hidden': 'true' }, [template.sender.charAt(0)]),
        h('span', { class: 'msg-body' }, [
          h('span', { class: 'msg-top' }, [
            h('strong', {}, [template.sender]),
            h('span', { class: 'msg-tag' }, ['simulated']),
            h('span', { class: 'msg-time' }, ['now']),
          ]),
          h('span', { class: 'msg-text' }, [template.preview]),
        ]),
        h('span', { class: 'msg-badge', 'aria-hidden': 'true' }, ['1']),
        close,
      ],
    );
    this.card = card;
    this.el.append(card);
    // Next frame so the slide-in transition runs (instant under reduced motion).
    requestAnimationFrame(() => card.classList.add('in'));
    sound.chime();
    this.opts.onShown(template);
  }

  tick(now: number): void {
    this.now = now;
    if (!this.card) return;
    if (this.collapseAt !== null && now >= this.collapseAt) this.hide();
    else if (this.collapseAt === null && now >= this.hideAt) this.hide();
  }

  private handleTap(): void {
    if (!this.card || !this.current || this.card.classList.contains('expanded')) return;
    this.card.classList.add('expanded');
    const text = this.card.querySelector('.msg-text');
    if (text) text.textContent = this.current.full;
    this.collapseAt = this.now + EXPANDED_MS;
    this.opts.onTap(this.current);
  }

  private hide(): void {
    const card = this.card;
    if (!card) return;
    this.card = null;
    this.current = null;
    card.classList.remove('in');
    card.classList.add('out');
    window.setTimeout(() => card.remove(), 300);
  }

  private removeCard(): void {
    this.card?.remove();
    this.card = null;
  }

  destroy(): void {
    this.el.remove();
  }
}

/** Evenly spread message times across a round, avoiding the first and last seconds. */
export function messageSchedule(durationMs: number, count: number, startMs = 3000, endPaddingMs = 3500): number[] {
  const span = Math.max(0, durationMs - startMs - endPaddingMs);
  if (count <= 1) return [startMs];
  return Array.from({ length: count }, (_, i) => Math.round(startMs + (span * i) / (count - 1)));
}
