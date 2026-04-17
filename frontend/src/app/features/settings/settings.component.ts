import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface SettingsToggle {
  key: string;
  label: string;
  desc: string;
  value: boolean;
}

/* Emoji avatar generated from a username string */
const VIBE_EMOJIS: Record<string, string> = {
  chill:      '😌',
  social:     '🎉',
  creative:   '🎨',
  gamer:      '🎮',
  mysterious: '🌙'
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="screen gradient-bg">

      <!-- Header -->
      <div class="screen-header">
        <button class="back-btn-ghost">←</button>
        <h3 class="header-title">Settings</h3>
        <div class="header-right-actions">
          <button class="header-icon-btn" (click)="onRefresh()" title="Refresh">🔄</button>
          <button class="header-icon-btn notif-btn" title="Notifications">
            🔔<span class="notif-dot"></span>
          </button>
        </div>
      </div>

      <div class="screen-content">

        <!-- ── Profile Card ─────────────────────────────── -->
        <div class="profile-section">
          <div class="profile-card">
            <div class="profile-avatar avatar avatar-xl avatar-glow">
              {{ vibeEmoji() }}
            </div>
            <div class="profile-info">
              <div class="profile-name">{{ displayName() }}</div>
              <div class="profile-handle">&#64;{{ username() }}</div>
              <div class="profile-meta">
                <span class="badge badge-purple">{{ vibeBadge() }}</span>
              </div>
              @if (email()) {
                <div class="profile-email">{{ email() }}</div>
              }
            </div>
            <button class="btn btn-ghost btn-sm">Edit</button>
          </div>
        </div>

        <!-- ── Stats Row ─────────────────────────────────── -->
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ memberSince() }}</div>
            <div class="stat-label">Member since</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">{{ vibeLabel() }}</div>
            <div class="stat-label">Vibe</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">Lv. 1</div>
            <div class="stat-label">Level</div>
          </div>
        </div>

        <!-- ── Privacy ───────────────────────────────────── -->
        <div class="settings-section">
          <div class="section-title">PRIVACY</div>
          @for (toggle of privacyToggles; track toggle.key) {
            <div class="toggle-row">
              <div class="toggle-info">
                <div class="toggle-label">{{ toggle.label }}</div>
                <div class="toggle-desc">{{ toggle.desc }}</div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="toggle.value" />
                <span class="slider"></span>
              </label>
            </div>
          }
        </div>

        <!-- ── Vibe Visibility ───────────────────────────── -->
        <div class="settings-section">
          <div class="section-title">WHO CAN SEE MY VIBE</div>
          <div class="visibility-row">
            @for (opt of visibilityOptions; track opt.key) {
              <button class="visibility-btn"
                [class.active]="vibeVisibility() === opt.key"
                (click)="vibeVisibility.set(opt.key)">
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <!-- ── Notifications ─────────────────────────────── -->
        <div class="settings-section">
          <div class="section-title">NOTIFICATIONS</div>
          @for (toggle of notifToggles; track toggle.key) {
            <div class="toggle-row">
              <div class="toggle-info">
                <div class="toggle-label">{{ toggle.label }}</div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="toggle.value" />
                <span class="slider"></span>
              </label>
            </div>
          }
        </div>

        <!-- ── Zone ──────────────────────────────────────── -->
        <div class="settings-section">
          <div class="section-title">ZONE</div>
          <div class="toggle-row">
            <div class="toggle-info">
              <div class="toggle-label">Detection Radius</div>
              <div class="toggle-desc">{{ detectionRadius() }}m — nearby zones</div>
            </div>
          </div>
          <div class="radius-slider-row">
            <span class="text-sm text-muted">50m</span>
            <input type="range" class="radius-slider" min="50" max="500" step="25"
              [value]="detectionRadius()"
              (input)="detectionRadius.set(+$any($event.target).value)" />
            <span class="text-sm text-muted">500m</span>
          </div>
          <div class="radius-presets">
            @for (p of radiusPresets; track p.label) {
              <button class="preset-btn"
                [class.active]="detectionRadius() === p.val"
                (click)="detectionRadius.set(p.val)">{{ p.label }}</button>
            }
          </div>
          <div class="toggle-row" style="border-bottom:none">
            <div class="toggle-info">
              <div class="toggle-label">Auto-join favourite zones</div>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="autoJoin" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- ── Account ───────────────────────────────────── -->
        <div class="settings-section">
          <div class="section-title">ACCOUNT</div>
          <button class="settings-action-btn">Change Password</button>
          <button class="settings-action-btn">Emergency Contact</button>
          <button class="settings-action-btn danger">Delete Account</button>
        </div>

        <!-- ── Sign Out ──────────────────────────────────── -->
        <div class="logout-section">
          <button class="btn btn-secondary btn-full" (click)="logout()"
            [disabled]="loggingOut()">
            @if (loggingOut()) { Signing out... } @else { Sign Out }
          </button>
          <p class="version-text">Minglr · v1.0.0 beta</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    .screen-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 12px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
      background: rgba(8,8,15,0.9); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
    }
    .back-btn-ghost {
      width: 36px; height: 36px; border-radius: 50%; background: none;
      border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer;
    }
    .header-right-actions { display: flex; align-items: center; gap: 6px; }
    .notif-btn { position: relative; }
    .notif-dot {
      position: absolute; top: 4px; right: 4px;
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--pink-accent); border: 1.5px solid var(--bg-primary);
    }

    /* ── Profile card ── */
    .profile-section { padding: 16px 20px; }
    .profile-card {
      display: flex; align-items: center; gap: 14px; background: var(--bg-card);
      border: 1px solid var(--border-medium); border-radius: var(--radius-xl); padding: 16px;
    }
    .profile-info { flex: 1; min-width: 0; }
    .profile-name  { font-size: 16px; font-weight: 800; margin-bottom: 2px; }
    .profile-handle { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
    .profile-meta  { margin-bottom: 4px; }
    .profile-email { font-size: 11px; color: var(--text-muted); margin-top: 4px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* ── Stats row ── */
    .stats-row {
      display: flex; align-items: center; justify-content: space-around;
      margin: 0 20px 4px; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 14px 8px;
    }
    .stat-item { text-align: center; flex: 1; }
    .stat-value { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
    .stat-divider { width: 1px; height: 28px; background: var(--border-subtle); }

    /* ── Sections ── */
    .settings-section { padding: 4px 20px 8px; }
    .section-title {
      font-size: 11px; font-weight: 600; color: var(--text-muted);
      letter-spacing: 0.8px; padding: 12px 0 6px; text-transform: uppercase;
    }
    .toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 0; border-bottom: 1px solid var(--border-subtle);
    }
    .toggle-info { flex: 1; padding-right: 16px; }
    .toggle-label { font-size: 14px; font-weight: 500; }
    .toggle-desc  { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

    /* Toggle switch */
    .toggle { position: relative; width: 48px; height: 26px; flex-shrink: 0; }
    .toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .slider {
      position: absolute; inset: 0; background: var(--bg-card);
      border: 1.5px solid var(--border-medium); border-radius: 13px; cursor: pointer; transition: 0.3s;
      &::before {
        content: ''; position: absolute; width: 18px; height: 18px;
        left: 3px; top: 2px; background: var(--text-muted); border-radius: 50%; transition: 0.3s;
      }
    }
    .toggle input:checked + .slider {
      background: var(--purple-primary); border-color: var(--purple-medium);
      &::before { transform: translateX(22px); background: white; }
    }

    /* Visibility */
    .visibility-row { display: flex; gap: 8px; padding: 8px 0 12px; }
    .visibility-btn {
      flex: 1; padding: 8px; border-radius: var(--radius-md); font-size: 12px; font-weight: 600;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle);
      color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
      &.active { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }

    /* Radius slider */
    .radius-slider-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
    .radius-slider {
      flex: 1; accent-color: var(--purple-medium); cursor: pointer;
    }
    .radius-presets { display: flex; gap: 8px; padding-bottom: 8px; }
    .preset-btn {
      flex: 1; padding: 7px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      color: var(--text-secondary); cursor: pointer;
      &.active { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }

    /* Account actions */
    .settings-action-btn {
      display: flex; width: 100%; padding: 14px 0; background: none; border: none;
      border-bottom: 1px solid var(--border-subtle); color: var(--text-primary);
      font-size: 14px; font-weight: 500; cursor: pointer; text-align: left;
      &.danger { color: var(--danger, #EF4444); }
    }

    .logout-section {
      padding: 24px 20px 40px; display: flex; flex-direction: column;
      gap: 12px; align-items: center;
    }
    .version-text { font-size: 12px; color: var(--text-muted); }
  `]
})
export class SettingsComponent implements OnInit {

  loggingOut       = signal(false);
  vibeVisibility   = signal('Everyone');
  detectionRadius  = signal(200);
  autoJoin         = false;

  // ── Derived from AuthService ────────────────────────────────────────────
  private user = computed(() => this.authService.currentUser());

  displayName = computed(() => this.user()?.displayName  ?? 'Unknown');
  username    = computed(() => this.user()?.username     ?? '');
  email       = computed(() => this.user()?.email        ?? '');
  vibeKey     = computed(() => this.user()?.vibe         ?? 'chill');
  vibeEmoji   = computed(() => VIBE_EMOJIS[this.vibeKey()] ?? '🧑‍🎤');
  vibeLabel   = computed(() => {
    const map: Record<string, string> = {
      chill: 'Chill', social: 'Social', creative: 'Creative',
      gamer: 'Gamer', mysterious: 'Mysterious'
    };
    return map[this.vibeKey()] ?? this.vibeKey();
  });
  vibeBadge   = computed(() => `${this.vibeLabel()} Explorer`);
  memberSince = computed(() => {
    const d = this.user()?.createdAt;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  // ── Static config ───────────────────────────────────────────────────────
  visibilityOptions = [
    { key: 'Everyone',  label: 'Everyone'  },
    { key: 'Zone-Only', label: 'Zone Only' },
    { key: 'Nobody',    label: 'Nobody'    }
  ];
  radiusPresets = [
    { label: 'Small',  val: 100 },
    { label: 'Medium', val: 200 },
    { label: 'Large',  val: 400 }
  ];
  privacyToggles: SettingsToggle[] = [
    { key: 'anonymous', label: 'Anonymous Mode',  desc: 'Hide your identity in zones', value: false },
    { key: 'location',  label: 'Location Sharing', desc: 'Let others see your zone',   value: true  }
  ];
  notifToggles: SettingsToggle[] = [
    { key: 'zone_alerts',  label: 'Zone Alerts',      desc: '', value: true  },
    { key: 'game_invites', label: 'Game Invites',      desc: '', value: true  },
    { key: 'new_conf',     label: 'New Confessions',   desc: '', value: false },
    { key: 'nearby',       label: 'Nearby Players',    desc: '', value: true  }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRefresh() { window.location.reload(); }

  ngOnInit(): void {
    // Refresh from server in background so data stays fresh
    this.authService.refreshUser();
  }

  async logout(): Promise<void> {
    this.loggingOut.set(true);
    await this.authService.logout();
    this.router.navigate(['/splash']);
  }
}
