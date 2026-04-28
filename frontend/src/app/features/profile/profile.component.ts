import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Achievement {
  id: string;
  icon: string;
  label: string;
  earned: boolean;
  description?: string;
  earnedDate?: string;
}

interface Activity {
  id: string;
  icon: string | SafeHtml;
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#7B61FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#7B61FF" stroke-width="2" stroke-linecap="round"/>
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
              <div class="badge-card" [class.badge-earned]="a.earned" (click)="showBadgeInfo(a, $event)" #badgeRef>
                @if (a.icon === 'medal') {
                  <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.09375 14.625L8.1875 11.0625L5.3125 8.75H8.875L10 5.25L11.125 8.75H14.6875L11.7812 11.0625L12.875 14.625L10 12.4062L7.09375 14.625ZM2.5 26.25V16.5938C1.70833 15.7188 1.09375 14.7188 0.65625 13.5938C0.21875 12.4688 0 11.2708 0 10C0 7.20833 0.96875 4.84375 2.90625 2.90625C4.84375 0.96875 7.20833 0 10 0C12.7917 0 15.1562 0.96875 17.0938 2.90625C19.0312 4.84375 20 7.20833 20 10C20 11.2708 19.7812 12.4688 19.3438 13.5938C18.9062 14.7188 18.2917 15.7188 17.5 16.5938V26.25L10 23.75L2.5 26.25ZM10 17.5C12.0833 17.5 13.8542 16.7708 15.3125 15.3125C16.7708 13.8542 17.5 12.0833 17.5 10C17.5 7.91667 16.7708 6.14583 15.3125 4.6875C13.8542 3.22917 12.0833 2.5 10 2.5C7.91667 2.5 6.14583 3.22917 4.6875 4.6875C3.22917 6.14583 2.5 7.91667 2.5 10C2.5 12.0833 3.22917 13.8542 4.6875 15.3125C6.14583 16.7708 7.91667 17.5 10 17.5Z" fill="#AFA2FF"/>
                  </svg>
                } @else if (a.icon === 'bolt') {
                  <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.34375 10.243L5.59375 4.99303C5.88542 4.70136 6.22917 4.49303 6.625 4.36803C7.02083 4.24303 7.42708 4.22219 7.84375 4.30553L9.46875 4.64928C8.34375 5.98261 7.45833 7.19094 6.8125 8.27428C6.16667 9.35761 5.54167 10.6701 4.9375 12.2118L0.34375 10.243ZM6.75 13.0868C7.22917 11.5868 7.88021 10.1701 8.70312 8.83678C9.52604 7.50344 10.5208 6.25344 11.6875 5.08678C13.5208 3.25344 15.6146 1.88365 17.9688 0.977402C20.3229 0.0711519 22.5208 -0.20489 24.5625 0.149277C24.9167 2.19094 24.6458 4.38886 23.75 6.74303C22.8542 9.09719 21.4896 11.1909 19.6562 13.0243C18.5104 14.1701 17.2604 15.1649 15.9062 16.0087C14.5521 16.8524 13.125 17.5139 11.625 17.993L6.75 13.0868ZM15.375 9.33678C15.8542 9.81594 16.4427 10.0555 17.1406 10.0555C17.8385 10.0555 18.4271 9.81594 18.9062 9.33678C19.3854 8.85761 19.625 8.26907 19.625 7.57115C19.625 6.87324 19.3854 6.28469 18.9062 5.80553C18.4271 5.32636 17.8385 5.08678 17.1406 5.08678C16.4427 5.08678 15.8542 5.32636 15.375 5.80553C14.8958 6.28469 14.6562 6.87324 14.6562 7.57115C14.6562 8.26907 14.8958 8.85761 15.375 9.33678ZM14.5 24.368L12.5 19.7743C14.0417 19.1701 15.3594 18.5451 16.4531 17.8993C17.5469 17.2534 18.7604 16.368 20.0938 15.243L20.4062 16.868C20.4896 17.2847 20.4688 17.6962 20.3438 18.1024C20.2188 18.5087 20.0104 18.8576 19.7188 19.1493L14.5 24.368ZM2.34375 17.0868C3.07292 16.3576 3.95833 15.9878 5 15.9774C6.04167 15.967 6.92708 16.3264 7.65625 17.0555C8.38542 17.7847 8.75 18.6701 8.75 19.7118C8.75 20.7534 8.38542 21.6389 7.65625 22.368C7.13542 22.8889 6.26562 23.3368 5.04688 23.7118C3.82812 24.0868 2.14583 24.4201 0 24.7118C0.291667 22.5659 0.625 20.8889 1 19.6805C1.375 18.4722 1.82292 17.6076 2.34375 17.0868Z" fill="#C57EFF"/>
                  </svg>
                } @else if (a.icon === 'lightning') {
                  <svg width="20" height="25" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 25L6.25 16.25H0L11.25 0H13.75L12.5 10H20L7.5 25H5Z" fill="#00EC9A"/>
                  </svg>
                } @else {
                  <span class="badge-icon">{{ a.icon }}</span>
                }

                <!-- Badge Info Popup - INSIDE badge-card -->
                @if (selectedBadge() === a.id && badgePosition()) {
                  <div class="badge-popup" [ngStyle]="{
                    'top.px': badgePosition()!.top - 140,
                    'left.px': badgePosition()!.left
                  }" [style.--arrow-left.px]="badgePosition()!.arrowLeft">
                    <div class="popup-title">{{ a.label }}</div>
                    @if (a.description) {
                      <div class="popup-description">{{ a.description }}</div>
                    }
                    <div class="popup-divider"></div>
                    <div class="popup-footer">
                      <span class="popup-status">{{ a.earned ? '✓ EARNED' : 'LOCKED' }}</span>
                      @if (a.earnedDate) {
                        <span class="popup-date">{{ a.earnedDate }}</span>
                      }
                    </div>
                  </div>
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
      font-size: 16px; font-weight: 800; color: #7B61FF;
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
      flex: 1; min-height: 0; overflow-y: auto; overflow-x: visible;
      scrollbar-width: none;
      display: flex; flex-direction: column; align-items: center;
      padding: 0 20px calc(120px + env(safe-area-inset-bottom, 0px));
      position: relative;
      z-index: 0;
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
      display: flex; gap: 10px; position: relative;
      overflow: visible;
      z-index: 100;
    }
    .badge-card {
      width: 58px; height: 58px; border-radius: 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; flex-shrink: 0;
      transition: all 0.2s;
      cursor: pointer;
      position: relative;
      &:active { transform: scale(0.95); }

      /* Ensure popup is positioned relative to badge */
      &:has(.badge-popup) {
        z-index: 999;
      }
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

    /* ── BADGE POPUP ──────────────────────────────── */
    .badge-popup {
      position: fixed;
      background: rgba(13, 10, 28, 0.98);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(123, 97, 255, 0.35);
      border-radius: 14px;
      padding: 14px 16px;
      width: auto;
      max-width: calc(100vw - 32px);
      z-index: 1000;
      animation: popupFadeIn 0.2s ease;
      box-shadow: 0 12px 48px rgba(123, 97, 255, 0.15), 0 0 1px rgba(123, 97, 255, 0.2);
      white-space: normal;
      overflow: visible;
    }

    /* Pointer border */
    .badge-popup::before {
      content: '';
      position: absolute;
      bottom: -10px;
      left: calc(var(--arrow-left, 20px) - 10px);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 11px solid rgba(123, 97, 255, 0.35);
      z-index: 999;
    }

    /* Small pointer at bottom of popup */
    .badge-popup::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: calc(var(--arrow-left, 20px) - 8px);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 10px solid rgba(13, 10, 28, 0.98);
      z-index: 1001;
    }

    @media (max-width: 480px) {
      .badge-popup {
        max-width: calc(100vw - 32px);
        padding: 12px 14px;
        font-size: 11px;
      }
    }
    .popup-title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }
    .popup-description {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.65);
      margin-bottom: 10px;
      line-height: 1.4;
    }
    .popup-divider {
      height: 1px;
      background: rgba(123, 97, 255, 0.2);
      margin: 10px 0;
    }
    .popup-footer {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .popup-status {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #10b981;
    }
    .popup-date {
      font-size: 9px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.45);
      letter-spacing: 0.5px;
    }
    @keyframes popupFadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(8px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
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

  selectedBadge = signal<string | null>(null);
  badgePosition = signal<{ top: number; left: number; arrowLeft: number } | null>(null);

  achievements: Achievement[] = [
    {
      id: 'a1',
      icon: 'medal',
      label: 'Zone Master',
      earned: true,
      description: 'Visited 10 unique zones',
      earnedDate: 'Earned 2 months ago'
    },
    {
      id: 'a2',
      icon: 'bolt',
      label: 'Speed Connect',
      earned: true,
      description: 'Made 5 quick connections',
      earnedDate: 'Earned 1 month ago'
    },
    {
      id: 'a3',
      icon: 'lightning',
      label: 'First Flight',
      earned: true,
      description: 'Won your first game',
      earnedDate: 'Earned 3 weeks ago'
    },
  ];

  activities: Activity[] = [];

  constructor(private router: Router, private sanitizer: DomSanitizer) {
    this.activities = [
      {
        id: 'act1',
        icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.535 14C1.685 14 1.02667 13.7042 0.56 13.1125C0.0933333 12.5208 -0.0816667 11.8 0.035 10.95L1.085 3.45C1.235 2.45 1.68083 1.625 2.4225 0.975C3.16417 0.325 4.035 0 5.035 0H14.935C15.935 0 16.8058 0.325 17.5475 0.975C18.2892 1.625 18.735 2.45 18.885 3.45L19.935 10.95C20.0517 11.8 19.8767 12.5208 19.41 13.1125C18.9433 13.7042 18.285 14 17.435 14C17.085 14 16.76 13.9375 16.46 13.8125C16.16 13.6875 15.885 13.5 15.635 13.25L13.385 11H6.585L4.335 13.25C4.085 13.5 3.81 13.6875 3.51 13.8125C3.21 13.9375 2.885 14 2.535 14ZM2.935 11.85L5.785 9H14.185L17.035 11.85C17.0683 11.8833 17.2017 11.9333 17.435 12C17.6183 12 17.7642 11.9458 17.8725 11.8375C17.9808 11.7292 18.0183 11.5833 17.985 11.4L16.885 3.7C16.8183 3.21667 16.6017 2.8125 16.235 2.4875C15.8683 2.1625 15.435 2 14.935 2H5.035C4.535 2 4.10167 2.1625 3.735 2.4875C3.36833 2.8125 3.15167 3.21667 3.085 3.7L1.985 11.4C1.95167 11.5833 1.98917 11.7292 2.0975 11.8375C2.20583 11.9458 2.35167 12 2.535 12C2.56833 12 2.70167 11.95 2.935 11.85ZM14.985 8C15.2683 8 15.5058 7.90417 15.6975 7.7125C15.8892 7.52083 15.985 7.28333 15.985 7C15.985 6.71667 15.8892 6.47917 15.6975 6.2875C15.5058 6.09583 15.2683 6 14.985 6C14.7017 6 14.4642 6.09583 14.2725 6.2875C14.0808 6.47917 13.985 6.71667 13.985 7C13.985 7.28333 14.0808 7.52083 14.2725 7.7125C14.4642 7.90417 14.7017 8 14.985 8ZM12.985 5C13.2683 5 13.5058 4.90417 13.6975 4.7125C13.8892 4.52083 13.985 4.28333 13.985 4C13.985 3.71667 13.8892 3.47917 13.6975 3.2875C13.5058 3.09583 13.2683 3 12.985 3C12.7017 3 12.4642 3.09583 12.2725 3.2875C12.0808 3.47917 11.985 3.71667 11.985 4C11.985 4.28333 12.0808 4.52083 12.2725 4.7125C12.4642 4.90417 12.7017 5 12.985 5ZM5.735 8H7.235V6.25H8.985V4.75H7.235V3H5.735V4.75H3.985V6.25H5.735V8Z" fill="#AFA2FF"/></svg>'),
        iconBg: 'rgba(123,97,255,0.15)',
        title: 'Won at Cyber Arcade',
        subtitle: '+250 XP  •  2 hours ago',
        timeAgo: '',
      },
      {
        id: 'act2',
        icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10C8.55 10 9.02083 9.80417 9.4125 9.4125C9.80417 9.02083 10 8.55 10 8C10 7.45 9.80417 6.97917 9.4125 6.5875C9.02083 6.19583 8.55 6 8 6C7.45 6 6.97917 6.19583 6.5875 6.5875C6.19583 6.97917 6 7.45 6 8C6 8.55 6.19583 9.02083 6.5875 9.4125C6.97917 9.80417 7.45 10 8 10ZM8 17.35C10.0333 15.4833 11.5417 13.7875 12.525 12.2625C13.5083 10.7375 14 9.38333 14 8.2C14 6.38333 13.4208 4.89583 12.2625 3.7375C11.1042 2.57917 9.68333 2 8 2C6.31667 2 4.89583 2.57917 3.7375 3.7375C2.57917 4.89583 2 6.38333 2 8.2C2 9.38333 2.49167 10.7375 3.475 12.2625C4.45833 13.7875 5.96667 15.4833 8 17.35ZM8 20C5.31667 17.7167 3.3125 15.5958 1.9875 13.6375C0.6625 11.6792 0 9.86667 0 8.2C0 5.7 0.804167 3.70833 2.4125 2.225C4.02083 0.741667 5.88333 0 8 0C10.1167 0 11.9792 0.741667 13.5875 2.225C15.1958 3.70833 16 5.7 16 8.2C16 9.86667 15.3375 11.6792 14.0125 13.6375C12.6875 15.5958 10.6833 17.7167 8 20Z" fill="#C57EFF"/></svg>'),
        iconBg: 'rgba(16,185,129,0.12)',
        title: 'Visited Neon District',
        subtitle: 'Zone Unlocked  •  Yesterday',
        timeAgo: '',
      },
      {
        id: 'act3',
        icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 10V7H14V5H17V2H19V5H22V7H19V10H17ZM8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z" fill="#00EC9A"/></svg>'),
        iconBg: 'rgba(236,72,153,0.12)',
        title: 'Connected with @ZeroOne',
        subtitle: 'Mutual Match  •  2 days ago',
        timeAgo: '',
      },
    ];
  }

  showBadgeInfo(achievement: Achievement, event: Event) {
    const badgeElement = event.currentTarget as HTMLElement;
    const rect = badgeElement.getBoundingClientRect();

    // Position pop-up directly above badge, touching it
    // Check available space and position accordingly
    let leftPos = rect.left;
    const popupWidth = 200;
    const screenWidth = window.innerWidth;
    const padding = 16;
    const badgeCenter = rect.left + rect.width / 2;

    // If badge is on left side, position popup from badge left
    // If badge is on right side, position popup from badge right
    if (rect.left + popupWidth + padding > screenWidth) {
      // Not enough space on right, position from right edge
      leftPos = rect.right - popupWidth;
    } else {
      // Position from left edge of badge
      leftPos = rect.left;
    }

    // Ensure stays within padding bounds
    leftPos = Math.max(padding, Math.min(leftPos, screenWidth - popupWidth - padding));

    // Calculate arrow position relative to popup
    const arrowLeftPos = badgeCenter - leftPos;

    this.badgePosition.set({
      top: rect.top,  // Contact with badge (top edge)
      left: leftPos,
      arrowLeft: arrowLeftPos
    });

    this.selectedBadge.set(achievement.id);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (this.selectedBadge() === achievement.id) {
        this.selectedBadge.set(null);
        this.badgePosition.set(null);
      }
    }, 3000);
  }

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
