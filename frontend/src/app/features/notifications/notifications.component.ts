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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#7B61FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#7B61FF" stroke-width="2" stroke-linecap="round"/>
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
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <path d="M2.535 14C1.685 14 1.02667 13.7042 0.56 13.1125C0.0933333 12.5208 -0.0816667 11.8 0.035 10.95L1.085 3.45C1.235 2.45 1.68083 1.625 2.4225 0.975C3.16417 0.325 4.035 0 5.035 0H14.935C15.935 0 16.8058 0.325 17.5475 0.975C18.2892 1.625 18.735 2.45 18.885 3.45L19.935 10.95C20.0517 11.8 19.8767 12.5208 19.41 13.1125C18.9433 13.7042 18.285 14 17.435 14C17.085 14 16.76 13.9375 16.46 13.8125C16.16 13.6875 15.885 13.5 15.635 13.25L13.385 11H6.585L4.335 13.25C4.085 13.5 3.81 13.6875 3.51 13.8125C3.21 13.9375 2.885 14 2.535 14ZM14.985 8C15.2683 8 15.5058 7.90417 15.6975 7.7125C15.8892 7.52083 15.985 7.28333 15.985 7C15.985 6.71667 15.8892 6.47917 15.6975 6.2875C15.5058 6.09583 15.2683 6 14.985 6C14.7017 6 14.4642 6.09583 14.2725 6.2875C14.0808 6.47917 13.985 6.71667 13.985 7C13.985 7.28333 14.0808 7.52083 14.2725 7.7125C14.4642 7.90417 14.7017 8 14.985 8ZM12.985 5C13.2683 5 13.5058 4.90417 13.6975 4.7125C13.8892 4.52083 13.985 4.28333 13.985 4C13.985 3.71667 13.8892 3.47917 13.6975 3.2875C13.5058 3.09583 13.2683 3 12.985 3C12.7017 3 12.4642 3.09583 12.2725 3.2875C12.0808 3.47917 11.985 3.71667 11.985 4C11.985 4.28333 12.0808 4.52083 12.2725 4.7125C12.4642 4.90417 12.7017 5 12.985 5ZM5.735 8H7.235V6.25H8.985V4.75H7.235V3H5.735V4.75H3.985V6.25H5.735V8Z" fill="#C57EFF"/>
                </svg>
              } @else if (n.type === 'confession') {
                <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
                  <path d="M10 18.35L8.55 17.05C6.86667 15.5333 5.475 14.225 4.375 13.125C3.275 12.025 2.4 11.0375 1.75 10.1625C1.1 9.2875 0.645833 8.48333 0.3875 7.75C0.129167 7.01667 0 6.26667 0 5.5C0 3.93333 0.525 2.625 1.575 1.575C2.625 0.525 3.93333 0 5.5 0C6.36667 0 7.19167 0.183333 7.975 0.55C8.75833 0.916667 9.43333 1.43333 10 2.1C10.5667 1.43333 11.2417 0.916667 12.025 0.55C12.8083 0.183333 13.6333 0 14.5 0C16.0667 0 17.375 0.525 18.425 1.575C19.475 2.625 20 3.93333 20 5.5C20 6.26667 19.8708 7.01667 19.6125 7.75C19.3542 8.48333 18.9 9.2875 18.25 10.1625C17.6 11.0375 16.725 12.025 15.625 13.125C14.525 14.225 13.1333 15.5333 11.45 17.05L10 18.35Z" fill="#9EFFC8"/>
                </svg>
              } @else if (n.type === 'discovery') {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5.5 14.5L12.5 12.5L14.5 5.5L7.5 7.5L5.5 14.5ZM10 11.5C9.58333 11.5 9.22917 11.3542 8.9375 11.0625C8.64583 10.7708 8.5 10.4167 8.5 10C8.5 9.58333 8.64583 9.22917 8.9375 8.9375C9.22917 8.64583 9.58333 8.5 10 8.5C10.4167 8.5 10.7708 8.64583 11.0625 8.9375C11.3542 9.22917 11.5 9.58333 11.5 10C11.5 10.4167 11.3542 10.7708 11.0625 11.0625C10.7708 11.3542 10.4167 11.5 10 11.5ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2167 18 14.1042 17.2208 15.6625 15.6625C17.2208 14.1042 18 12.2167 18 10C18 7.78333 17.2208 5.89583 15.6625 4.3375C14.1042 2.77917 12.2167 2 10 2C7.78333 2 5.89583 2.77917 4.3375 4.3375C2.77917 5.89583 2 7.78333 2 10C2 12.2167 2.77917 14.1042 4.3375 15.6625C5.89583 17.2208 7.78333 18 10 18Z" fill="#E5E3FF"/>
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
      padding: 0 20px 16px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
      background: rgba(8,8,15,0.95);
      backdrop-filter: blur(12px);
      border-bottom: none;
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
      font-size: 16px; font-weight: 800; color: #7B61FF; letter-spacing: -0.3px;
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
      color: #ffffff; cursor: pointer; padding: 4px 0; margin-bottom: 4px;
      &:active { opacity: 0.7; }
    }

    /* ── SCROLL BODY ── */
    .scroll-body {
      flex: 1; min-height: 0;
      overflow-y: auto; overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 16px 16px;
      padding-bottom: calc(var(--nav-height, 70px) + env(safe-area-inset-bottom, 0px) + 16px);
      gap: 12px;
      display: flex;
      flex-direction: column;
      &::-webkit-scrollbar { display: none; }
    }

    /* ── NOTIFICATION CARD (Floating) ── */
    .notif-card {
      position: relative;
      display: flex; align-items: flex-start; gap: 14px;
      padding: 18px 16px;
      border-radius: 24px;
      border: 1px solid rgba(123, 97, 255, 0.25);
      background: rgba(20, 15, 35, 0.6);
      backdrop-filter: blur(10px);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      &:active {
        background: rgba(123, 97, 255, 0.12);
        transform: scale(0.98);
      }
      &:hover {
        border-color: rgba(123, 97, 255, 0.4);
        background: rgba(20, 15, 35, 0.8);
      }
    }

    /* Unread highlight */
    .notif-card.unread {
      background: rgba(123, 97, 255, 0.15);
      backdrop-filter: blur(15px);
      border-left: 3px solid #7B61FF;
      border-top: 1px solid #7B61FF;
      border-right: 1px solid #7B61FF;
      border-bottom: 1px solid #7B61FF;
    }
    .unread-bar {
      position: absolute; left: 0; top: 0; bottom: 0;
      width: 0;
      display: none;
    }

    /* ── ICON ── */
    .notif-icon-wrap {
      width: 44px; height: 44px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px;
    }
    .icon-zone     { background: rgba(123,97,255,0.15); color: #AFA2FF; }
    .icon-game     { background: rgba(197,126,255,0.15); color: #C57EFF; }
    .icon-confession { background: rgba(158,255,200,0.15); color: #9EFFC8; }
    .icon-discovery  { background: rgba(229,227,255,0.15); color: #E5E3FF; }
    .icon-mention    { background: rgba(231,197,255,0.15); color: #E7C5FF; }

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
      display: flex; gap: 12px; margin-top: 14px;
    }
    .action-accept {
      padding: 10px 28px; border-radius: 24px; border: none;
      background: linear-gradient(135deg, #AFA2FF, #7B61FF);
      color: #ffffff; font-size: 13px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
      flex: 1;
      &:active { transform: scale(0.96); opacity: 0.8; }
    }
    .action-decline {
      padding: 10px 28px; border-radius: 24px;
      background: transparent; border: 1.5px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
      flex: 1;
      &:active { transform: scale(0.96); opacity: 0.8; }
    }

    /* ── END LABEL ── */
    .end-label {
      text-align: center;
      font-size: 10px; font-weight: 700; letter-spacing: 2px;
      color: rgba(255,255,255,0.15);
      padding: 12px 20px 8px;
      flex-shrink: 0;
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
