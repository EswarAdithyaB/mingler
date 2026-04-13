import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ZoneService } from '../../core/services/zone.service';
import { Zone, User } from '../../core/models';

interface ZoneUser {
  id: string;
  name: string;
  avatar: string;
  vibe: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="screen zone-screen">
      <!-- Header -->
      <div class="zone-header">
        <button class="back-btn" (click)="leaveZone()">← Leave</button>
        <div class="zone-header-info">
          <h3>{{ zone()?.name }}</h3>
          <span class="users-count">👥 {{ loungeUsers().length }} players</span>
        </div>
        <button class="header-icon-btn">⋯</button>
      </div>

      <!-- Lounge View -->
      <div class="lounge-area">
        <div class="lounge-bg">
          <!-- Stage / platform -->
          <div class="lounge-stage"></div>

          <!-- User avatars floating -->
          @for (user of loungeUsers(); track user.id) {
            <div class="lounge-user"
              [style.left.%]="user.x"
              [style.top.%]="user.y"
              (click)="openProfile(user)">
              <div class="lounge-avatar" [class.is-you]="user.id === 'me'">
                {{ user.avatar }}
              </div>
              <div class="lounge-username">{{ user.name }}</div>
              <div class="lounge-vibe-tag">{{ user.vibe }}</div>
            </div>
          }

          <!-- Zone name overlay -->
          <div class="zone-name-overlay">
            <span class="zone-emoji">{{ zone()?.coverEmoji || '✨' }}</span>
            <span>{{ zone()?.name }}</span>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="zone-actions">
        <button class="action-btn" (click)="goToGames()">
          <span>🎮</span>
          <span>Games</span>
        </button>
        <button class="action-btn action-btn-primary" (click)="shareVibe()">
          <span>✦</span>
          <span>Share Vibe</span>
        </button>
        <button class="action-btn" (click)="goToVibes()">
          <span>💬</span>
          <span>Wall</span>
        </button>
      </div>

      <!-- Profile peek modal -->
      @if (peekedUser()) {
        <div class="modal-backdrop" (click)="peekedUser.set(null)">
          <div class="profile-peek" (click)="$event.stopPropagation()">
            <div class="peek-avatar">{{ peekedUser()!.avatar }}</div>
            <h3>{{ peekedUser()!.name }}</h3>
            <span class="badge badge-purple">{{ peekedUser()!.vibe }}</span>
            <div class="peek-actions">
              <button class="btn btn-primary btn-sm">Connect 🤝</button>
              <button class="btn btn-ghost btn-sm">Say hi 👋</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .zone-screen { background: var(--bg-primary); }

    .zone-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; background: rgba(8,8,15,0.9); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; z-index: 10;
      padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
    }
    .back-btn {
      background: none; border: none; color: var(--purple-light); cursor: pointer;
      font-size: 14px; font-weight: 600; padding: 6px;
    }
    .zone-header-info { text-align: center; }
    .zone-header-info h3 { font-size: 16px; font-weight: 700; }
    .users-count { font-size: 12px; color: var(--text-secondary); }

    .lounge-area {
      flex: 1; position: relative; overflow: hidden;
    }

    .lounge-bg {
      width: 100%; height: 100%; min-height: 420px; position: relative;
      background:
        radial-gradient(ellipse at 50% 80%, rgba(76,29,149,0.5) 0%, transparent 60%),
        radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.2) 0%, transparent 40%),
        radial-gradient(ellipse at 80% 10%, rgba(236,72,153,0.15) 0%, transparent 35%),
        var(--bg-primary);
    }

    .lounge-stage {
      position: absolute; bottom: 15%; left: 50%; transform: translateX(-50%);
      width: 70%; height: 45%; border-radius: 50%;
      background: radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.25) 0%, transparent 70%);
      border: 1px solid rgba(124,58,237,0.2);
    }

    .lounge-user {
      position: absolute; display: flex; flex-direction: column; align-items: center;
      cursor: pointer; transform: translate(-50%,-50%); transition: transform 0.2s;
      &:active { transform: translate(-50%,-50%) scale(0.92); }
    }
    .lounge-avatar {
      width: 52px; height: 52px; border-radius: 50%; font-size: 28px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-card); border: 2px solid var(--border-medium);
      box-shadow: 0 0 14px var(--purple-glow);
      &.is-you { border-color: var(--purple-medium); box-shadow: 0 0 20px var(--purple-glow-strong); }
    }
    .lounge-username { font-size: 10px; color: white; font-weight: 600; margin-top: 4px; white-space: nowrap; }
    .lounge-vibe-tag { font-size: 9px; color: var(--text-secondary); }

    .zone-name-overlay {
      position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 6px; background: rgba(13,13,26,0.75);
      border: 1px solid var(--border-medium); border-radius: 20px; padding: 5px 14px;
      font-size: 13px; font-weight: 600; white-space: nowrap;
    }
    .zone-emoji { font-size: 16px; }

    .zone-actions {
      display: flex; gap: 10px; padding: 14px 20px;
      padding-bottom: calc(var(--nav-height) + 10px);
      background: rgba(8,8,15,0.9); border-top: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .action-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 12px 8px; background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer;
      font-size: 11px; font-weight: 500; transition: all 0.2s;
      span:first-child { font-size: 22px; }
    }
    .action-btn-primary {
      background: linear-gradient(135deg, var(--purple-primary), #5B21B6);
      border-color: var(--purple-medium); color: white; flex: 1.4;
      box-shadow: 0 4px 16px var(--purple-glow);
    }

    .modal-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: flex-end; z-index: 50;
    }
    .profile-peek {
      width: 100%; background: var(--bg-secondary); border-radius: 24px 24px 0 0;
      padding: 24px 28px 40px; display: flex; flex-direction: column; align-items: center; gap: 12px;
      border-top: 1px solid var(--border-medium);
    }
    .peek-avatar {
      width: 72px; height: 72px; border-radius: 50%; font-size: 36px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-card); border: 2px solid var(--purple-medium);
      box-shadow: 0 0 20px var(--purple-glow);
    }
    .peek-actions { display: flex; gap: 10px; margin-top: 8px; }
  `]
})
export class ZoneComponent implements OnInit {
  zone = signal<Zone | null>(null);
  peekedUser = signal<ZoneUser | null>(null);

  loungeUsers = signal<ZoneUser[]>([
    { id: 'me',     name: 'Nova_Stream',  avatar: '🧑‍🎤', vibe: 'Zone Explorer',  x: 45, y: 55 },
    { id: 'u2',     name: 'CryptoFeliz',  avatar: '👩‍💻', vibe: 'Chill',           x: 28, y: 42 },
    { id: 'u3',     name: 'Sol_Runner',   avatar: '🧑‍🚀', vibe: 'Social',          x: 65, y: 38 },
    { id: 'u4',     name: 'Mochi_Babe',   avatar: '👧',   vibe: 'Creative',        x: 55, y: 68 },
    { id: 'u5',     name: 'NightOwl',     avatar: '🧔',   vibe: 'Gamer',           x: 35, y: 70 },
  ]);

  constructor(
    private zoneService: ZoneService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const zoneId = this.route.snapshot.params['id'];
    const found = this.zoneService.mockZones.find(z => z.id === zoneId);
    this.zone.set(found || this.zoneService.mockZones[0]);
  }

  leaveZone() {
    this.zoneService.leaveZone();
    this.router.navigate(['/app/map']);
  }

  openProfile(user: ZoneUser) { this.peekedUser.set(user); }
  shareVibe()  { this.router.navigate(['/app/vibes']); }
  goToGames()  { this.router.navigate(['/app/games']); }
  goToVibes()  { this.router.navigate(['/app/vibes']); }
}
