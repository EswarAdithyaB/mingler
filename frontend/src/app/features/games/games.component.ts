import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Game } from '../../core/models';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="screen gradient-bg">
      <!-- Header -->
      <div class="screen-header">
        @if (fromZoneId()) {
          <button class="back-btn" (click)="goBackToZone()">← Back</button>
        } @else {
          <div class="header-icon-btn">⊞</div>
        }
        <h3 class="header-title">Games in This Zone</h3>
        <div class="header-right-actions">
          <button class="header-icon-btn" (click)="onRefresh()" title="Refresh">🔄</button>
          <button class="header-icon-btn notif-btn" title="Notifications">
            🔔<span class="notif-dot"></span>
          </button>
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
          <div class="empty-games">
            <!-- Floating Z letters -->
            <div class="z-letter z1">Z</div>
            <div class="z-letter z2">Z</div>
            <div class="z-letter z3">z</div>
            <!-- Floating dots -->
            <div class="dot dot-pink"></div>
            <div class="dot dot-green"></div>
            <div class="dot dot-blue"></div>
            <!-- Central orb -->
            <div class="game-orb">
              <div class="orb-ring orb-ring-1"></div>
              <div class="orb-ring orb-ring-2"></div>
              <div class="orb-core">
                <span class="orb-icon">🎮</span>
              </div>
            </div>
            <h3 class="empty-title">No Active Games</h3>
            <p class="empty-sub">Be the first to start a game and invite<br>players in this zone</p>
            <button class="btn-create-game" (click)="showCreateModal.set(true)">
              + Create First Game 🎮
            </button>
            <button class="refresh-link" (click)="refreshZone()">REFRESH ZONE</button>
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
    .header-right-actions { display: flex; align-items: center; gap: 6px; }
    .notif-btn { position: relative; }
    .notif-dot {
      position: absolute; top: 4px; right: 4px;
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--pink-accent); border: 1.5px solid var(--bg-primary);
    }
    .back-btn {
      background: none; border: none; color: var(--purple-light);
      font-size: 14px; font-weight: 700; cursor: pointer; padding: 4px 2px;
    }

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

    /* ── Rich Empty State ──────────────────────────────────── */
    .empty-games {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; position: relative; padding: 24px 32px 40px;
      overflow: hidden;
    }

    /* Floating Z letters */
    .z-letter {
      position: absolute; font-weight: 900; color: var(--purple-medium);
      opacity: 0.5; animation: float-z 3s ease-in-out infinite;
      font-family: serif;
    }
    .z1 { font-size: 28px; top: 12%; right: 22%; animation-delay: 0s; }
    .z2 { font-size: 20px; top: 8%; right: 14%; animation-delay: 0.6s; }
    .z3 { font-size: 14px; top: 5%; right: 8%; animation-delay: 1.2s; }
    @keyframes float-z {
      0%, 100% { transform: translateY(0) rotate(-10deg); opacity: 0.4; }
      50% { transform: translateY(-12px) rotate(10deg); opacity: 0.7; }
    }

    /* Floating dots */
    .dot {
      position: absolute; border-radius: 50%;
      animation: dot-float 4s ease-in-out infinite;
    }
    .dot-pink {
      width: 12px; height: 12px; background: #ec4899;
      left: 18%; top: 32%; box-shadow: 0 0 10px #ec489988;
      animation-delay: 0s;
    }
    .dot-green {
      width: 8px; height: 8px; background: #10b981;
      left: 12%; top: 52%; box-shadow: 0 0 8px #10b98188;
      animation-delay: 1s;
    }
    .dot-blue {
      width: 10px; height: 10px; background: #818cf8;
      right: 16%; top: 58%; box-shadow: 0 0 10px #818cf888;
      animation-delay: 2s;
    }
    @keyframes dot-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }

    /* Central orb */
    .game-orb {
      position: relative; width: min(180px, 48vw); height: min(180px, 48vw);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 28px;
    }
    .orb-ring {
      position: absolute; border-radius: 50%; border: 1.5px solid;
      animation: pulse-ring 2.5s ease-in-out infinite;
    }
    .orb-ring-1 {
      inset: 0; border-color: rgba(124,58,237,0.4);
      animation-delay: 0s;
    }
    .orb-ring-2 {
      inset: -14px; border-color: rgba(124,58,237,0.2);
      animation-delay: 0.5s;
    }
    @keyframes pulse-ring {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.04); }
    }
    .orb-core {
      width: 100%; height: 100%; border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, rgba(124,58,237,0.35), rgba(8,8,15,0.95) 70%);
      border: 1.5px solid rgba(124,58,237,0.5);
      box-shadow: 0 0 40px rgba(124,58,237,0.3), inset 0 0 30px rgba(124,58,237,0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .orb-icon {
      font-size: min(64px, 17vw);
      filter: drop-shadow(0 0 12px rgba(167,139,250,0.8));
      animation: icon-pulse 2s ease-in-out infinite;
    }
    @keyframes icon-pulse {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(167,139,250,0.7)); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(167,139,250,1)); }
    }

    .empty-title {
      font-size: 22px; font-weight: 800; color: var(--text-primary);
      margin: 0 0 10px; text-align: center;
    }
    .empty-sub {
      font-size: 13px; color: var(--text-secondary); text-align: center;
      line-height: 1.6; margin: 0 0 28px;
    }
    .btn-create-game {
      background: linear-gradient(135deg, var(--purple-primary), #5B21B6);
      border: none; border-radius: 28px; padding: 15px 36px;
      color: white; font-size: 15px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 20px var(--purple-glow); width: 100%; max-width: 320px;
      margin-bottom: 16px; transition: transform 0.15s, box-shadow 0.15s;
      &:active { transform: scale(0.97); }
    }
    .refresh-link {
      background: none; border: none; color: var(--text-secondary);
      font-size: 12px; font-weight: 700; letter-spacing: 1px;
      cursor: pointer; padding: 8px; text-transform: uppercase;
      &:hover { color: var(--text-primary); }
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
export class GamesComponent implements OnInit {
  activeGameType = signal('all');
  showCreateModal = signal(false);
  fromZoneId = signal<string | null>(null);
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

  refreshZone() {
    // In a real app this would re-fetch games from backend
    console.log('Refreshing zone...');
  }

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

  constructor(private router: Router, private route: ActivatedRoute) {}

  onRefresh() { window.location.reload(); }

  ngOnInit() {
    const fromZone = this.route.snapshot.queryParamMap.get('fromZone');
    if (!fromZone) {
      // Opened from shell nav — go to map instead
      this.router.navigate(['/app/map']);
      return;
    }
    this.fromZoneId.set(fromZone);
  }

  goBackToZone() {
    this.router.navigate(['/app/zone', this.fromZoneId()]);
  }
}
