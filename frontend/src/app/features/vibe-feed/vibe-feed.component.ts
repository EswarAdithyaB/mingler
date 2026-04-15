import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vibe } from '../../core/models';

@Component({
  selector: 'app-vibe-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="screen gradient-bg">
      <!-- Header -->
      <div class="screen-header">
        <span class="header-breadcrumb">From this zone, right now</span>
        <div class="header-right">
          <button class="header-icon-btn">🔍</button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        @for (tab of tabs; track tab.key) {
          <button class="filter-tab" [class.active]="activeTab() === tab.key"
            (click)="activeTab.set(tab.key)">
            {{ tab.emoji }} {{ tab.label }}
          </button>
        }
      </div>

      <!-- Feed / Empty State -->
      <div class="screen-content">
        @if (filteredVibes().length === 0) {
          <div class="empty-state">
            <div class="empty-icon animate-float">🌌</div>
            <h3>No Vibes Yet</h3>
            <p>Be the first to share something real in this zone 🔥</p>
            <button class="btn btn-primary" (click)="openCompose()">✦ Share Your Vibe</button>
          </div>
        } @else {
          <div class="scroll-list">
            @for (vibe of filteredVibes(); track vibe.id) {
              <div class="vibe-card animate-fade-in" [class.confession]="vibe.type === 'confession'">
                <!-- Anonymous mask or avatar -->
                <div class="vibe-top">
                  <div class="vibe-author">
                    @if (vibe.isAnonymous) {
                      <div class="anon-avatar">👤</div>
                      <div>
                        <div class="author-name">Anonymous</div>
                        <div class="author-meta">{{ getTimeAgo(vibe.createdAt) }}</div>
                      </div>
                    } @else {
                      <div class="real-avatar">{{ vibe.username[0].toUpperCase() }}</div>
                      <div>
                        <div class="author-name">{{ vibe.username }}</div>
                        <div class="author-meta">{{ getTimeAgo(vibe.createdAt) }}</div>
                      </div>
                    }
                  </div>
                  <span class="vibe-type-badge" [class]="'type-' + vibe.type">
                    {{ getTypeLabel(vibe.type) }}
                  </span>
                </div>
                <p class="vibe-content">{{ vibe.content }}</p>
                <div class="vibe-reactions">
                  @for (reaction of reactions; track reaction.emoji) {
                    <button class="reaction-btn" [class.my-reaction]="vibe.myReaction === reaction.emoji"
                      (click)="reactToVibe(vibe, reaction.emoji)">
                      {{ reaction.emoji }}
                      <span>{{ (vibe.reactions[reaction.emoji] || 0) }}</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Compose FAB -->
      <button class="compose-fab" (click)="openCompose()">✦ Share Vibe</button>

      <!-- Compose Modal -->
      @if (showCompose()) {
        <div class="modal-backdrop" (click)="showCompose.set(false)">
          <div class="compose-modal" (click)="$event.stopPropagation()">
            <div class="compose-handle"></div>
            <h4>Share your vibe</h4>

            <div class="compose-types">
              @for (t of vibeTypes; track t.key) {
                <div class="type-chip" [class.active]="composeType() === t.key"
                  (click)="composeType.set(t.key)">
                  {{ t.emoji }} {{ t.label }}
                </div>
              }
            </div>

            <textarea class="input compose-textarea" [(ngModel)]="composeText"
              [placeholder]="getPlaceholder()" maxlength="280" rows="4"></textarea>

            <div class="compose-footer">
              <label class="anon-toggle">
                <input type="checkbox" [(ngModel)]="composeAnon" />
                <span>Post anonymously</span>
              </label>
              <button class="btn btn-primary btn-sm" (click)="postVibe()"
                [disabled]="!composeText.trim()">
                Post →
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Host element fills its allocated screen slot */
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    .screen-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 12px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
      background: rgba(8,8,15,0.9); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
    }
    .header-breadcrumb { font-size: 13px; color: var(--text-secondary); }

    /* Horizontal filter row — never participates in vertical scroll */
    .filter-tabs {
      display: flex; gap: 8px; padding: 12px 20px;
      overflow-x: auto; overflow-y: visible;
      scrollbar-width: none; flex-shrink: 0;
      -webkit-overflow-scrolling: touch;
      &::-webkit-scrollbar { display: none; }
    }
    .filter-tab {
      padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle);
      color: var(--text-secondary); cursor: pointer; white-space: nowrap; transition: all 0.2s;
      &.active { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }

    .vibe-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; gap: 12px;
      &.confession { border-color: rgba(236,72,153,0.25); background: rgba(236,72,153,0.04); }
    }

    .vibe-top { display: flex; align-items: flex-start; justify-content: space-between; }
    .vibe-author { display: flex; align-items: center; gap: 10px; }

    .anon-avatar, .real-avatar {
      width: 38px; height: 38px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
      background: var(--bg-secondary); border: 1.5px solid var(--border-medium);
    }
    .real-avatar { font-weight: 700; font-size: 15px; color: var(--purple-light); background: rgba(124,58,237,0.15); }

    .author-name { font-size: 14px; font-weight: 600; }
    .author-meta { font-size: 11px; color: var(--text-secondary); margin-top: 1px; }

    .vibe-type-badge {
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
      &.type-confession { background: rgba(236,72,153,0.15); color: var(--pink-accent); }
      &.type-shoutout   { background: rgba(16,185,129,0.15); color: var(--success); }
      &.type-question   { background: rgba(34,211,238,0.15); color: var(--cyan-accent); }
      &.type-vibe       { background: rgba(124,58,237,0.15); color: var(--purple-light); }
    }

    .vibe-content { font-size: 15px; line-height: 1.6; color: var(--text-primary); }

    .vibe-reactions { display: flex; gap: 8px; flex-wrap: wrap; }
    .reaction-btn {
      display: flex; align-items: center; gap: 4px; padding: 5px 10px;
      background: var(--bg-secondary); border: 1px solid var(--border-subtle);
      border-radius: 20px; font-size: 13px; cursor: pointer; color: var(--text-secondary);
      transition: all 0.2s;
      span { font-size: 12px; }
      &.my-reaction { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }

    .compose-fab {
      position: absolute; bottom: calc(var(--nav-height) + 16px); left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, var(--purple-primary), #5B21B6);
      border: none; border-radius: 24px; padding: 13px 28px;
      color: white; font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 20px var(--purple-glow); white-space: nowrap;
    }

    .modal-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.7);
      display: flex; align-items: flex-end; z-index: 50;
    }
    .compose-modal {
      width: 100%; background: var(--bg-secondary); border-radius: 24px 24px 0 0;
      padding: 16px 24px 40px; border-top: 1px solid var(--border-medium);
      display: flex; flex-direction: column; gap: 16px;
    }
    .compose-handle {
      width: 36px; height: 4px; border-radius: 2px; background: var(--border-medium); margin: 0 auto -4px;
    }
    .compose-modal h4 { font-size: 16px; font-weight: 700; }
    .compose-types { display: flex; gap: 8px; flex-wrap: wrap; }
    .type-chip {
      padding: 6px 13px; border-radius: 20px; font-size: 13px; cursor: pointer;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle); color: var(--text-secondary);
      &.active { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }
    .compose-textarea { resize: none; min-height: 100px; }
    .compose-footer { display: flex; align-items: center; justify-content: space-between; }
    .anon-toggle {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      font-size: 13px; color: var(--text-secondary);
      input { accent-color: var(--purple-medium); }
    }
  `]
})
export class VibeFeedComponent {
  activeTab = signal('all');
  showCompose = signal(false);
  composeType = signal('vibe');
  composeText = '';
  composeAnon = false;

  tabs = [
    { key: 'all',        emoji: '✨', label: 'All' },
    { key: 'vibe',       emoji: '💜', label: 'Vibes' },
    { key: 'confession', emoji: '🤫', label: 'Confessions' },
    { key: 'shoutout',   emoji: '📢', label: 'Shoutouts' },
    { key: 'question',   emoji: '❓', label: 'Questions' }
  ];

  vibeTypes = [
    { key: 'vibe',       emoji: '💜', label: 'Vibe' },
    { key: 'confession', emoji: '🤫', label: 'Confession' },
    { key: 'shoutout',   emoji: '📢', label: 'Shoutout' },
    { key: 'question',   emoji: '❓', label: 'Question' }
  ];

  reactions = [
    { emoji: '❤️' }, { emoji: '😂' }, { emoji: '👀' }, { emoji: '🔥' }, { emoji: '💜' }
  ];

  vibes = signal<Vibe[]>([
    {
      id: 'v1', userId: 'u2', username: 'Nova_Stream', isAnonymous: false,
      content: 'The coffee here is lowkey the best in the city ☕ anyone else agree?',
      type: 'vibe', reactions: { '❤️': 8, '🔥': 3 }, createdAt: new Date(Date.now() - 300000), zoneId: 'zone_001'
    },
    {
      id: 'v2', userId: 'anon', username: 'anon', isAnonymous: true,
      content: 'I come here every day just to see the person in the blue hoodie. Never had the courage to say hi. Today might be the day 😭',
      type: 'confession', reactions: { '❤️': 24, '👀': 12, '😂': 5 }, myReaction: '❤️',
      createdAt: new Date(Date.now() - 900000), zoneId: 'zone_001'
    },
    {
      id: 'v3', userId: 'u3', username: 'Sol_Runner', isAnonymous: false,
      content: 'Anyone wanna do a quick game of Ludo? I\'m at the corner table 🎮',
      type: 'shoutout', reactions: { '🔥': 7, '💜': 4 }, createdAt: new Date(Date.now() - 1800000), zoneId: 'zone_001'
    }
  ]);

  filteredVibes = computed(() => {
    const tab = this.activeTab();
    if (tab === 'all') return this.vibes();
    return this.vibes().filter(v => v.type === tab);
  });

  openCompose() { this.showCompose.set(true); }

  postVibe() {
    if (!this.composeText.trim()) return;
    const newVibe: Vibe = {
      id: 'v' + Date.now(),
      userId: 'me',
      username: 'Nova_Stream',
      isAnonymous: this.composeAnon,
      content: this.composeText,
      type: this.composeType() as any,
      reactions: {},
      createdAt: new Date(),
      zoneId: 'zone_001'
    };
    this.vibes.update(v => [newVibe, ...v]);
    this.composeText = '';
    this.showCompose.set(false);
  }

  reactToVibe(vibe: Vibe, emoji: string) {
    this.vibes.update(vibes => vibes.map(v => {
      if (v.id !== vibe.id) return v;
      const reactions = { ...v.reactions };
      if (v.myReaction === emoji) {
        reactions[emoji] = Math.max(0, (reactions[emoji] || 0) - 1);
        return { ...v, reactions, myReaction: undefined };
      }
      if (v.myReaction) reactions[v.myReaction] = Math.max(0, (reactions[v.myReaction!] || 0) - 1);
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...v, reactions, myReaction: emoji };
    }));
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      confession: '🤫 Confession', shoutout: '📢 Shoutout',
      question: '❓ Question', vibe: '💜 Vibe'
    };
    return map[type] || type;
  }

  getTimeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  getPlaceholder(): string {
    const map: Record<string, string> = {
      confession: 'Confess something anonymously...',
      shoutout: 'Give a shoutout to someone here...',
      question: 'Ask something to everyone around...',
      vibe: 'What\'s your vibe right now?'
    };
    return map[this.composeType()] || 'Share something...';
  }
}
