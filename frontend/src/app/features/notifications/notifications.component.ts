import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type NotifType = 'zone' | 'game' | 'confession' | 'discovery' | 'mention';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  hasActions?: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-root">

      <!-- ── HEADER ── -->
      <div class="header">
        <!-- Top row: back + ZoneApp logo + bell icon -->
        <div class="header-top-row">
          <button class="back-btn" (click)="goBack()">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="logo-wrap">
            <span class="logo-text">ZoneApp</span>
          </div>
          <button class="bell-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="bell-badge"></span>
          </button>
        </div>
        <!-- Bottom row: title + mark all read -->
        <div class="header-bottom-row">
          <div>
            <span class="hub-label">ACTIVITY HUB</span>
            <h1 class="page-title">Notifications</h1>
          </div>
          <button class="mark-all-btn" (click)="markAllRead()">MARK ALL READ</button>
        </div>
      </div>

      <!-- ── SCROLL BODY ── -->
      <div class="scroll-body">

        @for (n of notifications(); track n.id) {
          <div class="notif-card" [class.unread]="!n.read" (click)="markRead(n)">

            <!-- Unread indicator bar -->
            @if (!n.read) {
              <div class="unread-bar"></div>
            }

            <!-- Icon -->
            <div class="notif-icon-wrap" [class]="'icon-' + n.type">
              @if (n.type === 'zone') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 9h18M9 21V9" stroke="currentColor" stroke-width="2"/>
                </svg>
              } @else if (n.type === 'game') {
                <svg width="18" height="13" viewBox="0 0 20 14" fill="none">
                  <path d="M2.535 14C1.685 14 1.02667 13.7042 0.56 13.1125C0.0933333 12.5208 -0.0816667 11.8 0.035 10.95L1.085 3.45C1.235 2.45 1.68083 1.625 2.4225 0.975C3.16417 0.325 4.035 0 5.035 0H14.935C15.935 0 16.8058 0.325 17.5475 0.975C18.2892 1.625 18.735 2.45 18.885 3.45L19.935 10.95C20.0517 11.8 19.8767 12.5208 19.41 13.1125C18.9433 13.7042 18.285 14 17.435 14C17.085 14 16.76 13.9375 16.46 13.8125C16.16 13.6875 15.885 13.5 15.635 13.25L13.385 11H6.585L4.335 13.25C4.085 13.5 3.81 13.6875 3.51 13.8125C3.21 13.9375 2.885 14 2.535 14ZM14.985 8C15.2683 8 15.5058 7.90417 15.6975 7.7125C15.8892 7.52083 15.985 7.28333 15.985 7C15.985 6.71667 15.8892 6.47917 15.6975 6.2875C15.5058 6.09583 15.2683 6 14.985 6C14.7017 6 14.4642 6.09583 14.2725 6.2875C14.0808 6.47917 13.985 6.71667 13.985 7C13.985 7.28333 14.0808 7.52083 14.2725 7.7125C14.4642 7.90417 14.7017 8 14.985 8ZM12.985 5C13.2683 5 13.5058 4.90417 13.6975 4.7125C13.8892 4.52083 13.985 4.28333 13.985 4C13.985 3.71667 13.8892 3.47917 13.6975 3.2875C13.5058 3.09583 13.2683 3 12.985 3C12.7017 3 12.4642 3.09583 12.2725 3.2875C12.0808 3.47917 11.985 3.71667 11.985 4C11.985 4.28333 12.0808 4.52083 12.2725 4.7125C12.4642 4.90417 12.7017 5 12.985 5ZM5.735 8H7.235V6.25H8.985V4.75H7.235V3H5.735V4.75H3.985V6.25H5.735V8Z" fill="currentColor"/>
                </svg>
              } @else if (n.type === 'confession') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                </svg>
              } @else if (n.type === 'discovery') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              } @else if (n.type === 'mention') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              }
            </div>

            <!-- Content -->
            <div class="notif-content">
              <div class="notif-top-row">
                <span class="notif-title">{{ n.title }}</span>
                <span class="notif-time">{{ n.timeAgo }}</span>
              </div>
              <p class="notif-desc">{{ n.description }}</p>

              @if (n.hasActions) {
                <div class="notif-actions">
                  <button class="action-accept" (click)="acceptInvite(n, $event)">Accept</button>
                  <button class="action-decline" (click)="declineInvite(n, $event)">Decline</button>
                </div>
              }
            </div>

          </div>
        }

        <!-- End label -->
        <div class="end-label">END OF RECENT ACTIVITY</div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    .notif-root {
      display: flex; flex-direction: column; flex: 1; min-height: 0;
      background: #08080F;
    }

    /* ── HEADER ── */
    .header {
      flex-shrink: 0;
      padding: 0 20px 14px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
      background: rgba(8,8,15,0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    /* Top row */
    .header-top-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px;
    }
    .back-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.10);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
      &:active { background: rgba(255,255,255,0.12); }
    }
    .logo-wrap {
      display: flex; align-items: center; gap: 8px;
    }
    .logo-dot {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #AFA2FF, #7B61FF);
      box-shadow: 0 0 12px rgba(123,97,255,0.5);
    }
    .logo-text {
      font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;
    }
    .bell-btn {
      position: relative;
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(123,97,255,0.12);
      border: 1px solid rgba(123,97,255,0.25);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
      &:active { background: rgba(123,97,255,0.2); }
    }
    .bell-badge {
      position: absolute; top: 6px; right: 6px;
      width: 7px; height: 7px; border-radius: 50%;
      background: #ec4899; border: 1.5px solid #08080F;
    }

    /* Bottom row */
    .header-bottom-row {
      display: flex; align-items: flex-end; justify-content: space-between;
    }
    .hub-label {
      font-size: 10px; font-weight: 700; letter-spacing: 2px;
      color: #7B61FF; display: block; margin-bottom: 2px;
    }
    .page-title {
      font-size: 28px; font-weight: 900; color: #ffffff;
      margin: 0; letter-spacing: -0.5px;
    }
    .mark-all-btn {
      background: none; border: none;
      font-size: 10px; font-weight: 700; letter-spacing: 1px;
      color: #7B61FF; cursor: pointer; padding: 4px 0; margin-bottom: 4px;
      &:active { opacity: 0.7; }
    }

    /* ── SCROLL BODY ── */
    .scroll-body {
      flex: 1; min-height: 0;
      overflow-y: auto; overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-bottom: calc(var(--nav-height, 70px) + env(safe-area-inset-bottom, 0px) + 16px);
      &::-webkit-scrollbar { display: none; }
    }

    /* ── NOTIFICATION CARD ── */
    .notif-card {
      position: relative;
      display: flex; align-items: flex-start; gap: 14px;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      cursor: pointer;
      transition: background 0.2s;
      &:active { background: rgba(255,255,255,0.03); }
    }

    /* Unread highlight */
    .notif-card.unread {
      background: rgba(123,97,255,0.06);
    }
    .unread-bar {
      position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; border-radius: 0 2px 2px 0;
      background: #7B61FF;
    }

    /* ── ICON ── */
    .notif-icon-wrap {
      width: 44px; height: 44px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px;
    }
    .icon-zone     { background: rgba(123,97,255,0.15); color: #AFA2FF; }
    .icon-game     { background: rgba(123,97,255,0.15); color: #AFA2FF; }
    .icon-confession { background: rgba(236,72,153,0.15); color: #f472b6; }
    .icon-discovery  { background: rgba(34,211,238,0.12); color: #22d3ee; }
    .icon-mention    { background: rgba(16,185,129,0.12); color: #10b981; }

    /* ── CONTENT ── */
    .notif-content { flex: 1; min-width: 0; }
    .notif-top-row {
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 8px;
      margin-bottom: 4px;
    }
    .notif-title {
      font-size: 14px; font-weight: 700; color: #ffffff;
      line-height: 1.3;
    }
    .notif-time {
      font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
      color: rgba(255,255,255,0.3); white-space: nowrap; flex-shrink: 0;
      margin-top: 2px;
    }
    .notif-desc {
      font-size: 12px; color: rgba(255,255,255,0.45);
      line-height: 1.55; margin: 0;
    }

    /* ── ACTION BUTTONS (game invite) ── */
    .notif-actions {
      display: flex; gap: 10px; margin-top: 12px;
    }
    .action-accept {
      padding: 8px 24px; border-radius: 9999px; border: none;
      background: linear-gradient(135deg, #AFA2FF, #7B61FF);
      color: #ffffff; font-size: 13px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
      &:active { transform: scale(0.96); }
    }
    .action-decline {
      padding: 8px 24px; border-radius: 9999px;
      background: none; border: 1.5px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
      &:active { transform: scale(0.96); }
    }

    /* ── END LABEL ── */
    .end-label {
      text-align: center;
      font-size: 10px; font-weight: 700; letter-spacing: 2px;
      color: rgba(255,255,255,0.15);
      padding: 28px 20px 8px;
    }
  `]
})
export class NotificationsComponent {

  notifications = signal<Notification[]>([
    {
      id: 'n1',
      type: 'zone',
      title: 'Alex entered your Zone',
      description: "Ghost_Rider has entered 'The Neon District'. They're just 200m away from you.",
      timeAgo: '2M AGO',
      read: false
    },
    {
      id: 'n2',
      type: 'game',
      title: 'Game Invitation',
      description: "Symmetry_Zero challenged you to 'Binary Duel'.",
      timeAgo: '15M AGO',
      read: false,
      hasActions: true
    },
    {
      id: 'n3',
      type: 'confession',
      title: 'Anonymous Response',
      description: 'Someone resonated with your last confession: "I feel the same way..."',
      timeAgo: '1H AGO',
      read: false
    },
    {
      id: 'n4',
      type: 'discovery',
      title: 'New Zone Discovered',
      description: "'Cyber Garden' has appeared 1.2km from your current location.",
      timeAgo: '3H AGO',
      read: true
    },
    {
      id: 'n5',
      type: 'mention',
      title: 'You were mentioned',
      description: 'V_Nomad tagged you: "Who\'s ready for the weekend raid?"',
      timeAgo: 'YESTERDAY',
      read: true
    }
  ]);

  markRead(n: Notification) {
    this.notifications.update(list =>
      list.map(item => item.id === n.id ? { ...item, read: true } : item)
    );
  }

  markAllRead() {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  acceptInvite(n: Notification, e: Event) {
    e.stopPropagation();
    this.markRead(n);
    this.notifications.update(list =>
      list.map(item => item.id === n.id ? { ...item, hasActions: false } : item)
    );
  }

  declineInvite(n: Notification, e: Event) {
    e.stopPropagation();
    this.notifications.update(list => list.filter(item => item.id !== n.id));
  }

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/app/profile']); }
}
