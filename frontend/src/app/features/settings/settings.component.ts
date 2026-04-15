import { Component, signal } from '@angular/core';
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
        <div style="width:36px"></div>
      </div>

      <div class="screen-content">
        <!-- Profile Card -->
        <div class="profile-section">
          <div class="profile-card">
            <div class="profile-avatar avatar avatar-xl avatar-glow">🧑‍🎤</div>
            <div class="profile-info">
              <div class="profile-name">Nova_Stream</div>
              <div class="profile-handle">&#64;nova_stream</div>
              <div class="profile-vibe">
                <span class="badge badge-purple">Zone Explorer · Lv. 5</span>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm">Edit Profile</button>
          </div>
        </div>

        <!-- Privacy Section -->
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

        <!-- Who can see my vibe -->
        <div class="settings-section">
          <div class="section-title">WHO CAN SEE MY VIBE</div>
          <div class="visibility-row">
            @for (opt of visibilityOptions; track opt.key) {
              <button class="visibility-btn" [class.active]="vibeVisibility() === opt.key"
                (click)="vibeVisibility.set(opt.key)">
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <!-- Notifications -->
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

        <!-- Zone Settings -->
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
              [value]="detectionRadius()" (input)="detectionRadius.set(+$any($event.target).value)" />
            <span class="text-sm text-muted">500m</span>
          </div>
          <div class="radius-presets">
            @for (p of radiusPresets; track p.label) {
              <button class="preset-btn" [class.active]="detectionRadius() === p.val"
                (click)="detectionRadius.set(p.val)">{{ p.label }}</button>
            }
          </div>

          <div class="toggle-row" style="border-bottom:none">
            <div class="toggle-info">
              <div class="toggle-label">Auto-join favorite zones</div>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="autoJoin" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- Account -->
        <div class="settings-section">
          <div class="section-title">ACCOUNT</div>
          <button class="settings-action-btn">Change Password</button>
          <button class="settings-action-btn">Emergency Contact</button>
          <button class="settings-action-btn danger" (click)="logout()">Delete Account</button>
        </div>

        <!-- Logout -->
        <div class="logout-section">
          <button class="btn btn-secondary btn-full" (click)="logout()">Sign Out</button>
          <p class="version-text">ZoneApp · v1.0.0 beta</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    /* Fixed header */
    .screen-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 12px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
      background: rgba(8,8,15,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border-subtle);
    }
    .back-btn-ghost {
      width: 36px; height: 36px; border-radius: 50%; background: none;
      border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer;
    }

    .profile-section { padding: 16px 20px; }
    .profile-card {
      display: flex; align-items: center; gap: 14px; background: var(--bg-card);
      border: 1px solid var(--border-medium); border-radius: var(--radius-xl); padding: 16px;
    }
    .profile-info { flex: 1; }
    .profile-name { font-size: 16px; font-weight: 800; margin-bottom: 2px; }
    .profile-handle { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }

    .settings-section { padding: 4px 20px 8px; }
    .section-title {
      font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.8px;
      padding: 12px 0 6px; text-transform: uppercase;
    }

    .visibility-row { display: flex; gap: 8px; padding: 8px 0 12px; }
    .visibility-btn {
      flex: 1; padding: 8px; border-radius: var(--radius-md); font-size: 12px; font-weight: 600;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle); color: var(--text-secondary); cursor: pointer;
      transition: all 0.2s;
      &.active { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }

    .radius-slider-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 0;
    }
    .radius-slider {
      flex: 1; accent-color: var(--purple-medium); cursor: pointer;
      &::-webkit-slider-thumb { background: var(--purple-medium); }
    }
    .radius-presets { display: flex; gap: 8px; padding-bottom: 8px; }
    .preset-btn {
      flex: 1; padding: 7px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-secondary); cursor: pointer;
      &.active { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }

    .settings-action-btn {
      display: flex; width: 100%; padding: 14px 0; background: none; border: none;
      border-bottom: 1px solid var(--border-subtle); color: var(--text-primary);
      font-size: 14px; font-weight: 500; cursor: pointer; text-align: left;
      &.danger { color: var(--danger); }
    }

    .logout-section { padding: 24px 20px 40px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
    .version-text { font-size: 12px; color: var(--text-muted); }
  `]
})
export class SettingsComponent {
  vibeVisibility = signal('Everyone');
  detectionRadius = signal(200);
  autoJoin = false;

  visibilityOptions = [
    { key: 'Everyone', label: 'Everyone' },
    { key: 'Zone-Only', label: 'Zone Only' },
    { key: 'Nobody', label: 'Nobody' }
  ];

  radiusPresets = [
    { label: 'Small', val: 100 },
    { label: 'Medium', val: 200 },
    { label: 'Large', val: 400 }
  ];

  privacyToggles: SettingsToggle[] = [
    { key: 'anonymous', label: 'Anonymous Mode', desc: 'Hide your identity in zones', value: false },
    { key: 'location',  label: 'Location Sharing', desc: 'Let others see your zone', value: true }
  ];

  notifToggles: SettingsToggle[] = [
    { key: 'zone_alerts', label: 'Zone Alerts', desc: '', value: true },
    { key: 'game_invites', label: 'Game Invites', desc: '', value: true },
    { key: 'new_conf', label: 'New Confessions', desc: '', value: false },
    { key: 'nearby', label: 'Nearby Players', desc: '', value: true }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/splash']);
  }
}
