import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Connection } from '../../core/models';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="screen gradient-bg">
      <!-- Header -->
      <div class="screen-header">
        <h3 class="header-title">My Connections</h3>
        <div class="header-right">
          <button class="header-icon-btn">🔍</button>
          <button class="header-icon-btn" (click)="onRefresh()" title="Refresh">🔄</button>
          <button class="header-icon-btn notif-btn" title="Notifications" (click)="goNotifications()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="notif-dot"></span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-row">
        <button class="tab" [class.active]="activeTab() === 'connections'" (click)="activeTab.set('connections')">
          My Connections
          <span class="tab-count">{{ connections().length }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'nearby'" (click)="activeTab.set('nearby')">
          Nearby Strangers
          <span class="tab-count online">{{ nearbyPeople().length }}</span>
        </button>
      </div>

      <div class="screen-content">
        @if (activeTab() === 'connections') {
          @if (connections().length === 0) {
            <div class="empty-state">
              <div class="empty-icon animate-float">🤝</div>
              <h3>No Connections Yet</h3>
              <p>Connect with people in your zone to grow your vibe network</p>
              <button class="btn btn-primary btn-sm" (click)="activeTab.set('nearby')">
                Find People Nearby
              </button>
            </div>
          } @else {
            <div class="scroll-list">
              @for (conn of connections(); track conn.id) {
                <div class="connection-card">
                  <div class="conn-avatar avatar avatar-md avatar-online">{{ conn.avatar || conn.displayName[0] }}</div>
                  <div class="conn-info">
                    <div class="conn-name">{{ conn.displayName }}</div>
                    <div class="conn-username">&#64;{{ conn.username }}</div>
                    <div class="conn-meta">
                      <span class="badge badge-purple">{{ conn.vibe }}</span>
                      <span class="mutual">🗺️ {{ conn.mutualZones }} mutual zones</span>
                    </div>
                  </div>
                  <div class="conn-actions">
                    <button class="action-icon-btn">💬</button>
                  </div>
                </div>
              }
            </div>
          }
        }

        @if (activeTab() === 'nearby') {
          <div class="nearby-header">
            <p class="text-muted text-sm">People in your zone right now</p>
          </div>
          <div class="scroll-list" style="padding-top:8px">
            @for (person of nearbyPeople(); track person.id) {
              <div class="person-card">
                <div class="person-avatar avatar avatar-md avatar-glow">{{ person.avatar }}</div>
                <div class="person-info">
                  <div class="person-name">{{ person.displayName }}</div>
                  <div class="person-username">&#64;{{ person.username }}</div>
                  <div class="person-vibes">
                    <span class="badge badge-purple">{{ person.vibe }}</span>
                  </div>
                </div>
                <div class="person-actions">
                  <button class="btn btn-primary btn-sm" (click)="sendConnect(person)">Connect</button>
                </div>
              </div>
            }
          </div>
        }
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
      background: rgba(8,8,15,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border-subtle);
    }
    .header-right { display: flex; gap: 6px; align-items: center; }
    .notif-btn { position: relative; }
    .notif-dot {
      position: absolute; top: 4px; right: 4px;
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--pink-accent); border: 1.5px solid var(--bg-primary);
    }

    /* Sticky tabs row — does not scroll vertically */
    .tabs-row {
      flex-shrink: 0;
      display: flex; border-bottom: 1px solid var(--border-subtle);
      background: rgba(8,8,15,0.8);
    }
    .tab {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 13px 8px; font-size: 13px; font-weight: 600;
      color: var(--text-muted); border: none; background: none; cursor: pointer;
      border-bottom: 2px solid transparent; transition: all 0.2s;
      &.active { color: var(--purple-light); border-bottom-color: var(--purple-medium); }
    }
    .tab-count {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: 10px; padding: 1px 7px; font-size: 11px;
      &.online { background: rgba(16,185,129,0.15); color: var(--success); border-color: rgba(16,185,129,0.3); }
    }

    .connection-card, .person-card {
      display: flex; align-items: center; gap: 12px; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 14px;
    }
    .conn-info, .person-info { flex: 1; }
    .conn-name, .person-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .conn-username, .person-username { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
    .conn-meta { display: flex; align-items: center; gap: 8px; }
    .mutual { font-size: 11px; color: var(--text-secondary); }
    .person-vibes { display: flex; gap: 6px; }
    .action-icon-btn {
      width: 36px; height: 36px; border-radius: 50%; background: var(--bg-secondary);
      border: 1px solid var(--border-subtle); cursor: pointer; font-size: 17px;
      display: flex; align-items: center; justify-content: center; color: var(--text-secondary);
    }
    .nearby-header { padding: 12px 20px 0; }
  `]
})
export class ConnectionsComponent {
  activeTab = signal('connections');
  showNearby = signal(false);

  constructor(private router: Router) {}

  onRefresh() { window.location.reload(); }

  goNotifications() { this.router.navigate(['/app/notifications']); }

  connections = signal<Connection[]>([
    {
      id: 'c1', userId: 'u3', username: 'sol_runner', displayName: 'Sol Runner',
      avatar: '🧑‍🚀', vibe: 'Social', connectedAt: new Date(), mutualZones: 3
    },
    {
      id: 'c2', userId: 'u4', username: 'mochi_babe', displayName: 'Mochi Babe',
      avatar: '👧', vibe: 'Creative', connectedAt: new Date(), mutualZones: 1
    }
  ]);

  nearbyPeople = signal<Connection[]>([
    {
      id: 'n1', userId: 'u5', username: 'nightowl', displayName: 'NightOwl',
      avatar: '🧔', vibe: 'Gamer', connectedAt: new Date(), mutualZones: 0
    },
    {
      id: 'n2', userId: 'u6', username: 'cafe_wanderer', displayName: 'Café Wanderer',
      avatar: '☕', vibe: 'Chill', connectedAt: new Date(), mutualZones: 0
    },
    {
      id: 'n3', userId: 'u7', username: 'pixel_ghost', displayName: 'Pixel Ghost',
      avatar: '👻', vibe: 'Mysterious', connectedAt: new Date(), mutualZones: 2
    }
  ]);

  sendConnect(person: Connection) {
    this.connections.update(c => [...c, person]);
    this.nearbyPeople.update(p => p.filter(x => x.id !== person.id));
  }
}
