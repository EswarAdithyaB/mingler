import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Achievement {
  id: string;
  icon: string;
  label: string;
  earned: boolean;
}

interface Activity {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  timeAgo: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-root">

      <!-- ── TOP BAR ── -->
      <div class="top-bar">
        <div class="app-logo">
          <div class="logo-dot"></div>
          <span class="logo-text">ZoneApp</span>
        </div>
        <div class="top-bar-actions">
          <button class="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="icon-btn" (click)="goSettings()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- ── SCROLLABLE BODY ── -->
      <div class="scroll-body">

        <!-- ── AVATAR SECTION ── -->
        <div class="avatar-section">
          <!-- Outer glow ring -->
          <div class="avatar-glow-ring">
            <div class="avatar-ring">
              <img class="avatar-img" src="assets/profile_avatar.svg" alt="Profile"/>
            </div>
          </div>
          <!-- Live in Zone badge -->
          <div class="live-badge">
            <span class="live-dot"></span>
            LIVE IN ZONE
          </div>
        </div>

        <!-- ── USER INFO ── -->
        <div class="user-info">
          <h1 class="username">&#64;NeoViper</h1>
          <p class="user-tag">Cyberpunk Explorer • Level 42</p>
        </div>

        <!-- ── ACTION BUTTONS ── -->
        <div class="action-buttons">
          <button class="action-btn action-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Avatar
          </button>
          <button class="action-btn action-ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="2"/>
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
            </svg>
            Change Vibe
          </button>
        </div>

        <!-- ── STATS ── -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">128</span>
            <span class="stat-label">ZONES<br>VISITED</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-card stat-highlight">
            <span class="stat-value stat-purple">42</span>
            <span class="stat-label">GAMES<br>WON</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-card">
            <span class="stat-value stat-teal">1.2k</span>
            <span class="stat-label">CONNECTIONS</span>
          </div>
        </div>

        <!-- ── ACHIEVEMENTS ── -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">ACHIEVEMENTS</h2>
            <button class="view-all-btn">VIEW ALL</button>
          </div>
          <div class="badges-row">
            @for (a of achievements; track a.id) {
              <div class="badge-card" [class.badge-earned]="a.earned">
                <span class="badge-icon">{{ a.icon }}</span>
              </div>
            }
            <!-- Add more slot -->
            <div class="badge-card badge-add">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- ── RECENT ACTIVITY ── -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">RECENT ACTIVITY</h2>
          </div>
          <div class="activity-list">
            @for (act of activities; track act.id) {
              <div class="activity-row">
                <div class="act-icon-wrap" [style.background]="act.iconBg">
                  <span class="act-icon" [innerHTML]="act.icon"></span>
                </div>
                <div class="act-content">
                  <span class="act-title">{{ act.title }}</span>
                  <span class="act-subtitle">{{ act.subtitle }}</span>
                </div>
                <div class="act-right">
                  <span class="act-time">{{ act.timeAgo }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            }
          </div>
        </div>

      </div><!-- /scroll-body -->

    </div>
  `,
  styles: [`
    :host {
      display: flex; flex-direction: column; flex: 1; min-height: 0;
      overflow: hidden; background: #0A0A14;
    }

    .profile-root {
      display: flex; flex-direction: column; flex: 1; min-height: 0;
      background: #0A0A14;
    }

    /* ── TOP BAR ──────────────────────────────────────── */
    .top-bar {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: calc(env(safe-area-inset-top, 0px) + 14px) 20px 12px;
    }
    .app-logo {
      display: flex; align-items: center; gap: 7px;
    }
    .logo-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #7B61FF;
      box-shadow: 0 0 8px rgba(123,97,255,0.8);
    }
    .logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px; font-weight: 800; color: white;
    }
    .top-bar-actions { display: flex; align-items: center; gap: 8px; }
    .icon-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }

    /* ── SCROLL BODY ──────────────────────────────────── */
    .scroll-body {
      flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;
      scrollbar-width: none;
      display: flex; flex-direction: column; align-items: center;
      padding: 0 20px calc(120px + env(safe-area-inset-bottom, 0px));
      &::-webkit-scrollbar { display: none; }
    }

    /* ── AVATAR SECTION ──────────────────────────────── */
    .avatar-section {
      display: flex; flex-direction: column; align-items: center;
      margin-top: 8px; margin-bottom: 12px;
      position: relative;
    }
    .avatar-glow-ring {
      padding: 4px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7B61FF, #AFA2FF, #7B61FF);
      box-shadow:
        0 0 0 4px rgba(123,97,255,0.15),
        0 0 40px rgba(123,97,255,0.4),
        0 0 80px rgba(123,97,255,0.15);
    }
    .avatar-ring {
      width: 130px; height: 130px; border-radius: 50%;
      overflow: hidden;
      background: #13132A;
      border: 3px solid #0A0A14;
    }
    .avatar-img {
      width: 100%; height: 100%;
      object-fit: cover; object-position: center top;
      display: block;
    }
    .live-badge {
      display: flex; align-items: center; gap: 5px;
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: 9999px; padding: 4px 12px;
      font-size: 9px; font-weight: 800; letter-spacing: 1.5px; color: #10b981;
      margin-top: 12px;
    }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #10b981;
      box-shadow: 0 0 6px #10b981;
      animation: blink 1.4s infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    /* ── USER INFO ───────────────────────────────────── */
    .user-info {
      text-align: center; margin-bottom: 16px;
    }
    .username {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px; font-weight: 800; color: #ffffff;
      margin: 0 0 4px; letter-spacing: 0.3px;
    }
    .user-tag {
      font-size: 12px; color: rgba(200,190,230,0.45);
      font-weight: 500; margin: 0;
    }

    /* ── ACTION BUTTONS ──────────────────────────────── */
    .action-buttons {
      display: flex; gap: 10px; width: 100%; margin-bottom: 20px;
    }
    .action-btn {
      flex: 1; display: flex; align-items: center; justify-content: center;
      gap: 7px; padding: 12px 16px; border-radius: 9999px;
      font-size: 13px; font-weight: 700; cursor: pointer;
      transition: all 0.2s;
      &:active { transform: scale(0.97); }
    }
    .action-primary {
      background: linear-gradient(to right, #AFA2FF, #7B61FF);
      border: none; color: white;
      box-shadow: 0 4px 20px rgba(123,97,255,0.4);
    }
    .action-ghost {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.7);
    }

    /* ── STATS ───────────────────────────────────────── */
    .stats-row {
      display: flex; align-items: center;
      width: 100%;
      background: #13132A;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      padding: 18px 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; gap: 4px;
    }
    .stat-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px; font-weight: 800; color: #ffffff;
      line-height: 1;
    }
    .stat-purple { color: #A78BFA; }
    .stat-teal   { color: #2DD4BF; }
    .stat-label {
      font-size: 9px; font-weight: 700; letter-spacing: 0.8px;
      color: rgba(255,255,255,0.3); text-align: center; line-height: 1.4;
    }
    .stat-divider {
      width: 1px; height: 40px;
      background: rgba(255,255,255,0.08);
      flex-shrink: 0;
    }

    /* ── SECTIONS ────────────────────────────────────── */
    .section {
      width: 100%; margin-bottom: 24px;
    }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px;
    }
    .section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px; font-weight: 800; letter-spacing: 1.5px;
      color: #ffffff; margin: 0;
    }
    .view-all-btn {
      background: none; border: none; cursor: pointer;
      font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
      color: #7B61FF;
    }

    /* ── BADGES ──────────────────────────────────────── */
    .badges-row {
      display: flex; gap: 10px;
    }
    .badge-card {
      width: 58px; height: 58px; border-radius: 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; flex-shrink: 0;
      transition: all 0.2s;
    }
    .badge-earned {
      background: rgba(123,97,255,0.12);
      border-color: rgba(123,97,255,0.3);
      box-shadow: 0 0 16px rgba(123,97,255,0.15);
    }
    .badge-add {
      background: rgba(255,255,255,0.02);
      border: 1px dashed rgba(255,255,255,0.1);
    }

    /* ── ACTIVITY LIST ───────────────────────────────── */
    .activity-list {
      display: flex; flex-direction: column; gap: 8px;
    }
    .activity-row {
      display: flex; align-items: center; gap: 14px;
      background: #13132A;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 14px 16px;
      cursor: pointer;
      transition: border-color 0.2s;
      &:active { border-color: rgba(123,97,255,0.3); }
    }
    .act-icon-wrap {
      width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .act-icon { line-height: 1; }
    .act-content {
      flex: 1; display: flex; flex-direction: column; gap: 3px;
    }
    .act-title {
      font-size: 13px; font-weight: 700; color: #ffffff;
    }
    .act-subtitle {
      font-size: 11px; color: rgba(200,190,230,0.4);
    }
    .act-right {
      display: flex; align-items: center; gap: 4px; flex-shrink: 0;
    }
    .act-time {
      font-size: 10px; color: rgba(255,255,255,0.25); font-weight: 600;
    }
  `]
})
export class ProfileComponent {

  achievements: Achievement[] = [
    { id: 'a1', icon: '🏆', label: 'Zone Master',   earned: true  },
    { id: 'a2', icon: '🚀', label: 'First Flight',  earned: true  },
    { id: 'a3', icon: '⚡', label: 'Speed Connect', earned: true  },
  ];

  activities: Activity[] = [
    {
      id: 'act1',
      icon: '🎮',
      iconBg: 'rgba(123,97,255,0.15)',
      title: 'Won at Cyber Arcade',
      subtitle: '+250 XP  •  2 hours ago',
      timeAgo: '',
    },
    {
      id: 'act2',
      icon: '📍',
      iconBg: 'rgba(16,185,129,0.12)',
      title: 'Visited Neon District',
      subtitle: 'Zone Unlocked  •  Yesterday',
      timeAgo: '',
    },
    {
      id: 'act3',
      icon: '🤝',
      iconBg: 'rgba(236,72,153,0.12)',
      title: 'Connected with @ZeroOne',
      subtitle: 'Mutual Match  •  2 days ago',
      timeAgo: '',
    },
  ];

  constructor(private router: Router) {}

  goSettings() {
    this.router.navigate(['/app/settings']);
  }
}
