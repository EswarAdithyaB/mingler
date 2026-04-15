import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../core/models';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="screen gradient-bg">
      <!-- Header -->
      <div class="screen-header">
        <h3 class="header-title">Games In This Zone</h3>
        <div class="header-right">
          <div class="avatar avatar-sm avatar-glow">🧑‍🎤</div>
        </div>
      </div>

      <!-- Game type picker -->
      <div class="game-types-scroll">
        @for (gt of gameTypes; track gt.key) {
          <div class="game-type-card" [class.active]="activeGameType() === gt.key"
            (click)="activeGameType.set(gt.key)">
            <span class="gt-icon">{{ gt.icon }}</span>
            <span class="gt-name">{{ gt.name }}</span>
          </div>
        }
      </div>

      <!-- Games List / Empty -->
      <div class="screen-content">
        @if (activeGames().length === 0) {
          <div class="empty-state">
            <div class="empty-icon animate-float">🕹️</div>
            <h3>No Active Games</h3>
            <p>Be the first to start a game and invite players in this zone</p>
            <button class="btn btn-primary" (click)="showCreateModal.set(true)">
              + Create First Game 🎮
            </button>
            <p class="text-muted text-sm" style="margin-top:12px;">Refresh Zone</p>
          </div>
        } @else {
          <div class="scroll-list">
            @for (game of activeGames(); track game.id) {
              <div class="game-card">
                <div class="game-card-left">
                  <div class="game-icon-wrap">{{ getGameIcon(game.type) }}</div>
                  <div>
                    <div class="game-name">{{ getGameName(game.type) }}</div>
                    <div class="game-meta">
                      by {{ game.hostName }} · {{ game.players.length }}/{{ game.maxPlayers }} players
                    </div>
                  </div>
                </div>
                <div class="game-card-right">
                  <span class="game-status" [class]="'status-' + game.status">
                    {{ game.status === 'waiting' ? 'Open' : 'In Progress' }}
                  </span>
                  @if (game.status === 'waiting') {
                    <button class="btn btn-primary btn-sm" (click)="joinGame(game)">Join</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Create Game FAB -->
      <button class="compose-fab" (click)="showCreateModal.set(true)">+ Create Game</button>

      <!-- Create Game Modal -->
      @if (showCreateModal()) {
        <div class="modal-backdrop" (click)="showCreateModal.set(false)">
          <div class="create-modal" (click)="$event.stopPropagation()">
            <div class="compose-handle"></div>
            <h4>Create a Game</h4>

            <div class="game-picker-grid">
              @for (gt of gameTypes; track gt.key) {
                <div class="game-option" [class.selected]="selectedGameType() === gt.key"
                  (click)="selectedGameType.set(gt.key)">
                  <span class="go-icon">{{ gt.icon }}</span>
                  <span class="go-name">{{ gt.name }}</span>
                  <span class="go-players">{{ gt.maxPlayers }} players</span>
                </div>
              }
            </div>

            <div class="input-group">
              <label>MAX PLAYERS</label>
              <div class="player-count-row">
                <button class="count-btn" (click)="adjustPlayers(-1)">−</button>
                <span class="count-val">{{ playerCount() }}</span>
                <button class="count-btn" (click)="adjustPlayers(1)">+</button>
              </div>
            </div>

            <button class="btn btn-primary btn-full" (click)="createGame()">
              🎮 Start Game &amp; Invite Players
            </button>
          </div>
        </div>
      }

      <!-- Game Invite Notification (simulated) -->
      @if (showInvite()) {
        <div class="game-invite-toast">
          <div class="invite-left">
            <span class="invite-avatar">🧑‍💻</span>
            <div>
              <div class="invite-title">Game Invite!</div>
              <div class="invite-sub">CryptoFeliz invited you to Ludo 🎲</div>
            </div>
          </div>
          <div class="invite-actions">
            <button class="btn btn-ghost btn-sm" (click)="showInvite.set(false)">Decline</button>
            <button class="btn btn-primary btn-sm" (click)="acceptInvite()">Accept</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    .screen-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 12px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
      background: rgba(8,8,15,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border-subtle);
    }
    .header-right { display: flex; gap: 8px; align-items: center; }

    /* Horizontal game-type chips — fixed row, never scrolls vertically */
    .game-types-scroll {
      display: flex; gap: 10px; padding: 14px 20px;
      overflow-x: auto; overflow-y: visible;
      scrollbar-width: none; flex-shrink: 0;
      -webkit-overflow-scrolling: touch;
      &::-webkit-scrollbar { display: none; }
    }
    .game-type-card {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 10px 14px; border-radius: var(--radius-md); min-width: 72px;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle); cursor: pointer;
      transition: all 0.2s; flex-shrink: 0;
      &.active { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); }
    }
    .gt-icon { font-size: 22px; }
    .gt-name { font-size: 10px; font-weight: 600; color: var(--text-secondary); white-space: nowrap; }

    .game-card {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); padding: 14px 16px;
    }
    .game-card-left { display: flex; align-items: center; gap: 12px; }
    .game-icon-wrap {
      width: 44px; height: 44px; border-radius: var(--radius-md);
      background: rgba(124,58,237,0.15); display: flex; align-items: center;
      justify-content: center; font-size: 22px;
    }
    .game-name { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
    .game-meta { font-size: 11px; color: var(--text-secondary); }
    .game-card-right { display: flex; align-items: center; gap: 8px; }
    .game-status {
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
      &.status-waiting { background: rgba(16,185,129,0.15); color: var(--success); }
      &.status-playing { background: rgba(245,158,11,0.15); color: var(--warning); }
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
    .create-modal {
      width: 100%; background: var(--bg-secondary); border-radius: 24px 24px 0 0;
      padding: 16px 24px 40px; border-top: 1px solid var(--border-medium);
      display: flex; flex-direction: column; gap: 18px;
    }
    .compose-handle { width: 36px; height: 4px; border-radius: 2px; background: var(--border-medium); margin: 0 auto -6px; }
    .create-modal h4 { font-size: 17px; font-weight: 700; }
    .game-picker-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .game-option {
      display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md);
      cursor: pointer; text-align: center; transition: all 0.2s;
      &.selected { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); }
    }
    .go-icon { font-size: 28px; }
    .go-name { font-size: 13px; font-weight: 600; }
    .go-players { font-size: 11px; color: var(--text-secondary); }

    .player-count-row { display: flex; align-items: center; gap: 16px; }
    .count-btn {
      width: 36px; height: 36px; border-radius: 50%; background: var(--bg-card);
      border: 1.5px solid var(--border-medium); color: var(--text-primary); font-size: 18px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .count-val { font-size: 20px; font-weight: 700; min-width: 30px; text-align: center; }

    .game-invite-toast {
      position: absolute; bottom: calc(var(--nav-height) + 80px); left: 16px; right: 16px;
      background: var(--bg-card); border: 1px solid var(--purple-medium);
      border-radius: var(--radius-lg); padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      box-shadow: 0 4px 24px var(--purple-glow), var(--shadow-card);
      animation: slide-up 0.3s ease; z-index: 40;
    }
    .invite-left { display: flex; align-items: center; gap: 10px; }
    .invite-avatar { font-size: 26px; }
    .invite-title { font-size: 13px; font-weight: 700; }
    .invite-sub { font-size: 12px; color: var(--text-secondary); }
    .invite-actions { display: flex; gap: 8px; flex-shrink: 0; }
  `]
})
export class GamesComponent {
  activeGameType = signal('all');
  showCreateModal = signal(false);
  showInvite = signal(true);
  selectedGameType = signal('ludo');
  playerCount = signal(4);

  gameTypes = [
    { key: 'all', icon: '🎮', name: 'All', maxPlayers: 0 },
    { key: 'ludo', icon: '🎲', name: 'Ludo', maxPlayers: 4 },
    { key: 'truth-or-dare', icon: '🎭', name: 'Truth/Dare', maxPlayers: 6 },
    { key: 'quiz', icon: '🧠', name: 'Quiz', maxPlayers: 8 },
    { key: 'word-chain', icon: '🔤', name: 'Word Chain', maxPlayers: 6 }
  ];

  activeGames = signal<Game[]>([
    {
      id: 'g1', type: 'ludo', hostId: 'u2', hostName: 'CryptoFeliz',
      players: [{ userId: 'u2', username: 'CryptoFeliz' }, { userId: 'u3', username: 'Sol_Runner' }],
      maxPlayers: 4, status: 'waiting', zoneId: 'zone_001', createdAt: new Date()
    },
    {
      id: 'g2', type: 'truth-or-dare', hostId: 'u4', hostName: 'Mochi_Babe',
      players: [{ userId: 'u4', username: 'Mochi_Babe' }, { userId: 'u5', username: 'NightOwl' }],
      maxPlayers: 6, status: 'playing', zoneId: 'zone_001', createdAt: new Date()
    }
  ]);

  adjustPlayers(delta: number) {
    const cur = this.playerCount();
    this.playerCount.set(Math.max(2, Math.min(8, cur + delta)));
  }

  createGame() {
    const newGame: Game = {
      id: 'g' + Date.now(),
      type: this.selectedGameType() as any,
      hostId: 'me',
      hostName: 'Nova_Stream',
      players: [{ userId: 'me', username: 'Nova_Stream' }],
      maxPlayers: this.playerCount(),
      status: 'waiting',
      zoneId: 'zone_001',
      createdAt: new Date()
    };
    this.activeGames.update(games => [newGame, ...games]);
    this.showCreateModal.set(false);
  }

  joinGame(game: Game) {
    this.activeGames.update(games => games.map(g =>
      g.id === game.id
        ? { ...g, players: [...g.players, { userId: 'me', username: 'Nova_Stream' }] }
        : g
    ));
  }

  acceptInvite() { this.showInvite.set(false); }

  getGameIcon(type: string): string {
    const icons: Record<string, string> = {
      'ludo': '🎲', 'truth-or-dare': '🎭', 'quiz': '🧠', 'word-chain': '🔤'
    };
    return icons[type] || '🎮';
  }

  getGameName(type: string): string {
    const names: Record<string, string> = {
      'ludo': 'Ludo', 'truth-or-dare': 'Truth or Dare', 'quiz': 'Zone Quiz', 'word-chain': 'Word Chain'
    };
    return names[type] || type;
  }
}
