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
          <button class="icon-btn" (click)="goNotifications()">
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
            <!-- Live in Zone badge — overlaps bottom of avatar -->
            <div class="live-badge">
              <span class="live-dot"></span>
              LIVE IN ZONE
            </div>
          </div>
        </div>

        <!-- ── USER INFO ── -->
        <div class="user-info">
          <h1 class="username">&#64;NeoViper</h1>
          <p class="user-tag">Cyberpunk Explorer • Level 42</p>
        </div>

        <!-- ── ACTION BUTTONS ── -->
        <div class="action-buttons">
          <button class="action-btn action-primary" (click)="goEditAvatar()">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.16667 9.33333H1.99792L7.7 3.63125L6.86875 2.8L1.16667 8.50208V9.33333ZM0 10.5V8.02083L7.7 0.335417C7.81667 0.228472 7.94549 0.145833 8.08646 0.0875C8.22743 0.0291667 8.37569 0 8.53125 0C8.68681 0 8.8375 0.0291667 8.98333 0.0875C9.12917 0.145833 9.25556 0.233333 9.3625 0.35L10.1646 1.16667C10.2812 1.27361 10.3663 1.4 10.4198 1.54583C10.4733 1.69167 10.5 1.8375 10.5 1.98333C10.5 2.13889 10.4733 2.28715 10.4198 2.42812C10.3663 2.5691 10.2812 2.69792 10.1646 2.81458L2.47917 10.5H0ZM9.33333 1.98333L8.51667 1.16667L9.33333 1.98333ZM7.27708 3.22292L6.86875 2.8L7.7 3.63125L7.27708 3.22292Z" fill="black"/>
            </svg>
            Edit Avatar
          </button>
          <button class="action-btn action-ghost">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.875 5.25C8.11806 5.25 8.32465 5.16493 8.49479 4.99479C8.66493 4.82465 8.75 4.61806 8.75 4.375C8.75 4.13194 8.66493 3.92535 8.49479 3.75521C8.32465 3.58507 8.11806 3.5 7.875 3.5C7.63194 3.5 7.42535 3.58507 7.25521 3.75521C7.08507 3.92535 7 4.13194 7 4.375C7 4.61806 7.08507 4.82465 7.25521 4.99479C7.42535 5.16493 7.63194 5.25 7.875 5.25ZM3.79167 5.25C4.03472 5.25 4.24132 5.16493 4.41146 4.99479C4.5816 4.82465 4.66667 4.61806 4.66667 4.375C4.66667 4.13194 4.5816 3.92535 4.41146 3.75521C4.24132 3.58507 4.03472 3.5 3.79167 3.5C3.54861 3.5 3.34201 3.58507 3.17188 3.75521C3.00174 3.92535 2.91667 4.13194 2.91667 4.375C2.91667 4.61806 3.00174 4.82465 3.17188 4.99479C3.34201 5.16493 3.54861 5.25 3.79167 5.25ZM5.83333 9.04167C6.49444 9.04167 7.09479 8.85451 7.63438 8.48021C8.17396 8.1059 8.56528 7.6125 8.80833 7H2.85833C3.10139 7.6125 3.49271 8.1059 4.03229 8.48021C4.57188 8.85451 5.17222 9.04167 5.83333 9.04167ZM5.83333 11.6667C5.02639 11.6667 4.26806 11.5135 3.55833 11.2073C2.84861 10.901 2.23125 10.4854 1.70625 9.96042C1.18125 9.43542 0.765625 8.81806 0.459375 8.10833C0.153125 7.39861 0 6.64028 0 5.83333C0 5.02639 0.153125 4.26806 0.459375 3.55833C0.765625 2.84861 1.18125 2.23125 1.70625 1.70625C2.23125 1.18125 2.84861 0.765625 3.55833 0.459375C4.26806 0.153125 5.02639 0 5.83333 0C6.64028 0 7.39861 0.153125 8.10833 0.459375C8.81806 0.765625 9.43542 1.18125 9.96042 1.70625C10.4854 2.23125 10.901 2.84861 11.2073 3.55833C11.5135 4.26806 11.6667 5.02639 11.6667 5.83333C11.6667 6.64028 11.5135 7.39861 11.2073 8.10833C10.901 8.81806 10.4854 9.43542 9.96042 9.96042C9.43542 10.4854 8.81806 10.901 8.10833 11.2073C7.39861 11.5135 6.64028 11.6667 5.83333 11.6667ZM5.83333 10.5C7.13611 10.5 8.23958 10.0479 9.14375 9.14375C10.0479 8.23958 10.5 7.13611 10.5 5.83333C10.5 4.53056 10.0479 3.42708 9.14375 2.52292C8.23958 1.61875 7.13611 1.16667 5.83333 1.16667C4.53056 1.16667 3.42708 1.61875 2.52292 2.52292C1.61875 3.42708 1.16667 4.53056 1.16667 5.83333C1.16667 7.13611 1.61875 8.23958 2.52292 9.14375C3.42708 10.0479 4.53056 10.5 5.83333 10.5Z" fill="#E5E3FF"/>
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
                @if (a.icon === 'medal') {
                  <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.09375 14.625L8.1875 11.0625L5.3125 8.75H8.875L10 5.25L11.125 8.75H14.6875L11.7812 11.0625L12.875 14.625L10 12.4062L7.09375 14.625ZM2.5 26.25V16.5938C1.70833 15.7188 1.09375 14.7188 0.65625 13.5938C0.21875 12.4688 0 11.2708 0 10C0 7.20833 0.96875 4.84375 2.90625 2.90625C4.84375 0.96875 7.20833 0 10 0C12.7917 0 15.1562 0.96875 17.0938 2.90625C19.0312 4.84375 20 7.20833 20 10C20 11.2708 19.7812 12.4688 19.3438 13.5938C18.9062 14.7188 18.2917 15.7188 17.5 16.5938V26.25L10 23.75L2.5 26.25ZM10 17.5C12.0833 17.5 13.8542 16.7708 15.3125 15.3125C16.7708 13.8542 17.5 12.0833 17.5 10C17.5 7.91667 16.7708 6.14583 15.3125 4.6875C13.8542 3.22917 12.0833 2.5 10 2.5C7.91667 2.5 6.14583 3.22917 4.6875 4.6875C3.22917 6.14583 2.5 7.91667 2.5 10C2.5 12.0833 3.22917 13.8542 4.6875 15.3125C6.14583 16.7708 7.91667 17.5 10 17.5Z" fill="#AFA2FF"/>
                  </svg>
                } @else if (a.icon === 'bolt') {
                  <svg width="20" height="25" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 25L6.25 16.25H0L11.25 0H13.75L12.5 10H20L7.5 25H5Z" fill="#00EC9A"/>
                  </svg>
                } @else {
                  <span class="badge-icon">{{ a.icon }}</span>
                }
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
      margin-top: 8px; margin-bottom: 10px;
      position: relative;
    }
    .avatar-glow-ring {
      position: relative;
      padding: 4px;
      border-radius: 50%;
      background: linear-gradient(to bottom, #7459F7,#1D1D37);
      box-shadow:
        0 0 0 0px rgba(123,97,255,0.15),
        0 0 40px rgba(123,97,255,0.4),
        0 0 80px rgba(123,97,255,0.15);
    }
    .avatar-ring {
      width: 180px; height: 180px; border-radius: 50%;
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
      position: absolute;
      bottom: 7.5px;
      right: 10px;
      transform: none;
      display: flex; align-items: center; gap: 5px;
      background: #10b981;
      border: 1px solid #059669;
      border-radius: 9999px; padding: 4px 12px;
      font-size: 9px; font-weight: 800; letter-spacing: 1.5px; color: #022c22;
      white-space: nowrap;
      box-shadow: 0 0 14px rgba(16,185,129,0.5);
    }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #022c22;
      box-shadow: 0 0 4px rgba(2,44,34,0.6);
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
      margin: 0 0 1px; letter-spacing: 0.3px;
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
      width: 151px; height: 50px;
      display: flex; align-items: center; justify-content: center;
      gap: 7px; padding: 0; border-radius: 9999px;
      font-size: 13px; font-weight: 700; cursor: pointer;
      transition: all 0.2s; flex-shrink: 0;
      &:active { transform: scale(0.97); }
    }
    .action-primary {
      background: linear-gradient(to right, #AFA2FF, #7B61FF);
      border: none; color: black;
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
    { id: 'a1', icon: 'medal', label: 'Zone Master',   earned: true  },
    { id: 'a2', icon: 'bolt',  label: 'Speed Connect', earned: true  },
    { id: 'a3', icon: 'bolt',  label: 'First Flight',  earned: true  },
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

  goNotifications() {
    this.router.navigate(['/app/notifications']);
  }

  goEditAvatar() {
    this.router.navigate(['/app/avatar-gen']);
  }
}
