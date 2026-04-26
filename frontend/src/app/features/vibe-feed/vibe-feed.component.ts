import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ZoneSessionService } from '../../core/services/zone-session.service';

/* ── Data Shapes ───────────────────────────────────────────── */
interface VibeChannel {
  id: string; title: string; description: string;
  category: string; categoryIcon: string;
  liveCount: number; members: string[]; memberCount: number;
  tags: string[]; recentMessages: { user: string; text: string }[];
  joined: boolean;
}
interface MyActiveVibe {
  id: string; title: string; subtitle: string;
  liveCount: number; memberCount: number;
  timestamp: string; isLive: boolean; avatarEmoji: string;
}
interface Squad {
  id: string; name: string; memberCount: number;
  emoji: string; color: string;
}
interface StreamMsg {
  id: string; user: string; avatarEmoji: string;
  text: string; timeAgo: string; likes: number; replies: number;
  isMe: boolean;
}
interface TrendingZone {
  id: string; name: string; subtitle: string;
  type: 'hero' | 'match' | 'live'; matchPct?: number;
  liveLabel?: string; activeCount?: number;
  tags: string[]; bgGradient: string; distance?: string;
}

@Component({
  selector: 'app-vibe-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="screen gradient-bg">

      <!-- ═══════════════════ HEADER ═══════════════════ -->
      <div class="screen-header">
        @if (fromZoneId()) {
          <button class="back-btn" (click)="goBackToZone()">← Back</button>
        } @else {
          <div class="header-logo">
            <span class="logo-dot"></span>
            <span class="logo-text">ZoneApp</span>
          </div>
        }
        <div class="header-actions">
          <button class="hdr-btn">🔍</button>
          <button class="hdr-btn" (click)="onRefresh()" title="Refresh">🔄</button>
          <button class="hdr-btn hdr-bell" title="Notifications" (click)="goNotifications()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="notif-dot"></span>
          </button>
        </div>
      </div>

      <!-- ═══════════════════ MAIN TABS ═══════════════════ -->
      <div class="main-tabs">
        @for (t of mainTabs; track t.key) {
          <button class="main-tab" [class.active]="activeMain() === t.key"
            (click)="activeMain.set(t.key)">{{ t.label }}</button>
        }
      </div>

      <!-- ═══════════════════ TAB: ALL VIBES ═══════════════════ -->
      @if (activeMain() === 'all') {
        <div class="screen-content">

          <!-- Featured vibe card -->
          @for (ch of allVibes(); track ch.id; let i = $index) {
            @if (i === 0) {
              <div class="featured-vibe-card">
                <div class="fvc-badges">
                  <span class="badge-live">{{ ch.liveCount }} ACTIVE</span>
                  <span class="badge-category">{{ ch.category }}</span>
                </div>
                <h2 class="fvc-title">{{ ch.title }}</h2>
                <p class="fvc-desc">{{ ch.description }}</p>
                <div class="fvc-footer">
                  <button class="btn-join-vibe" (click)="joinVibe(ch)">
                    {{ ch.joined ? '✓ Joined' : 'Join Vibe' }}
                  </button>
                  <div class="fvc-members">
                    @for (m of ch.members.slice(0,4); track m) {
                      <div class="mini-avatar">{{ m }}</div>
                    }
                    @if (ch.memberCount > 4) {
                      <div class="mini-avatar extra">+{{ ch.memberCount - 4 }}</div>
                    }
                  </div>
                </div>
                <!-- Recent activity mini-feed -->
                <div class="recent-activity">
                  <div class="ra-label">Recent Activity</div>
                  @for (msg of ch.recentMessages; track msg.user) {
                    <div class="ra-row">
                      <span class="ra-user">{{ msg.user }}</span>
                      <span class="ra-text">"{{ msg.text }}"</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Daily Spark card (after 1st channel) -->
            @if (i === 1) {
              <div class="daily-spark-card">
                <div class="spark-left">
                  <span class="spark-icon">✦</span>
                  <div>
                    <div class="spark-label">DAILY SPARK</div>
                    <div class="spark-text">Start a vibe about <strong>'{{ sparkTopic }}'</strong> today.</div>
                  </div>
                </div>
                <button class="btn-spark" (click)="openCompose()">→</button>
              </div>
            }

            <!-- Regular vibe list cards -->
            @if (i >= 1) {
              <div class="vibe-list-card" (click)="joinVibe(ch)">
                <div class="vlc-left">
                  <div class="vlc-icon-wrap">{{ ch.categoryIcon }}</div>
                  <div class="vlc-info">
                    <div class="vlc-title">{{ ch.title }}</div>
                    <p class="vlc-desc">{{ ch.description }}</p>
                    <div class="vlc-tags">
                      @for (tag of ch.tags; track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </div>
                  </div>
                </div>
                <div class="vlc-right">
                  <span class="badge-live-sm">{{ ch.liveCount }} LIVE</span>
                  <span class="vlc-arrow">›</span>
                </div>
              </div>
            }
          }

          <!-- ── Vibe Stream ── -->
          <div class="vibe-stream-section">
            <div class="vs-header">
              <span class="vs-title">Vibe Stream</span>
              <span class="vs-live-pill">● LIVE UPDATES</span>
            </div>
            @for (msg of streamMessages(); track msg.id) {
              <div class="stream-msg" [class.me]="msg.isMe">
                @if (!msg.isMe) {
                  <div class="sm-avatar">{{ msg.avatarEmoji }}</div>
                  <div class="sm-body">
                    <div class="sm-header-row">
                      <span class="sm-user">{{ msg.user }}</span>
                      <span class="sm-time">{{ msg.timeAgo }}</span>
                    </div>
                    <div class="sm-text">{{ msg.text }}</div>
                    <div class="sm-actions">
                      <span class="sm-react">❤️ {{ msg.likes }}</span>
                      <span class="sm-react">💬 {{ msg.replies }}</span>
                    </div>
                  </div>
                } @else {
                  <div class="sm-me-bubble">
                    <div class="sm-text">{{ msg.text }}</div>
                  </div>
                  <div class="sm-me-avatar">{{ msg.avatarEmoji }}</div>
                }
              </div>
            }
          </div>

        </div>
        <!-- Share Vibe FAB -->
        <button class="compose-fab" (click)="openCompose()">✦ Share Vibe</button>
      }

      <!-- ═══════════════════ TAB: MY VIBES ═══════════════════ -->
      @if (activeMain() === 'mine') {
        <div class="screen-content">

          <!-- Active Vibes header -->
          <div class="section-header-row">
            <span class="section-title">Active Vibes</span>
            <span class="live-now-badge">{{ myActiveVibes().length }} LIVE NOW</span>
          </div>

          @for (v of myActiveVibes(); track v.id) {
            <div class="active-vibe-row">
              <div class="avr-avatar">{{ v.avatarEmoji }}</div>
              <div class="avr-body">
                <div class="avr-top">
                  <span class="avr-title">{{ v.title }}</span>
                  @if (v.isLive) { <span class="live-pulse-dot"></span> }
                  <span class="avr-time">{{ v.timestamp }}</span>
                </div>
                <div class="avr-sub">{{ v.subtitle }}</div>
                <div class="avr-meta">
                  @if (v.isLive) {
                    <span class="avr-live">{{ v.liveCount }} VIBING</span>
                  } @else {
                    <span class="avr-members">{{ v.memberCount }} MEMBERS</span>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Squads section -->
          <div class="section-header-row" style="margin-top:20px">
            <span class="section-title">Your Squads</span>
            <button class="see-all-btn">SEE ALL</button>
          </div>

          <div class="squads-row">
            @for (sq of mySquads(); track sq.id) {
              <div class="squad-card" [style.border-color]="sq.color + '55'">
                <div class="squad-orb" [style.background]="sq.color + '22'"
                  [style.border-color]="sq.color + '66'">
                  <span class="squad-emoji">{{ sq.emoji }}</span>
                </div>
                <div class="squad-name">{{ sq.name }}</div>
                <div class="squad-members">{{ sq.memberCount }} MEMBERS</div>
              </div>
            }
          </div>

          <!-- Start a new Vibe CTA -->
          <div class="new-vibe-cta">
            <div class="nvc-left">
              <div class="nvc-icon">✦</div>
              <div>
                <div class="nvc-title">Start a new Vibe</div>
                <div class="nvc-sub">Gather your squad or find new ones.</div>
              </div>
            </div>
            <button class="nvc-plus" (click)="openCompose()">+</button>
          </div>

        </div>
      }

      <!-- ═══════════════════ TAB: TRENDING ═══════════════════ -->
      @if (activeMain() === 'trending') {
        <div class="screen-content">

          <!-- Live Pulse header -->
          <div class="live-pulse-header">
            <span class="lph-dot">●</span>
            <span class="lph-text">LIVE PULSE</span>
          </div>

          @for (zone of trendingZones(); track zone.id) {

            <!-- Hero trending card -->
            @if (zone.type === 'hero') {
              <div class="hero-trend-card" [style.background]="zone.bgGradient">
                <div class="htc-tags">
                  @for (tag of zone.tags; track tag) {
                    <span class="htc-tag">{{ tag }}</span>
                  }
                </div>
                <div class="htc-vibing">{{ zone.liveLabel }}</div>
                <h2 class="htc-title">{{ zone.name }}</h2>
                <div class="htc-footer">
                  <div class="htc-vibing-badge">
                    <span class="vib-dot"></span> VIBING
                  </div>
                  <button class="btn-join-zone">JOIN ZONE</button>
                </div>
              </div>
            }

            <!-- Match card -->
            @if (zone.type === 'match') {
              <div class="match-zone-card">
                <div class="mzc-left">
                  <div class="mzc-avatar">{{ zone.bgGradient }}</div>
                  <div class="mzc-info">
                    <div class="mzc-name">{{ zone.name }}</div>
                    <div class="mzc-sub">{{ zone.subtitle }}</div>
                    <div class="mzc-active">
                      <span class="active-dot"></span>
                      {{ zone.activeCount }} ACTIVE NOW
                    </div>
                    <div class="mzc-tags">
                      @for (tag of zone.tags; track tag) {
                        <span class="mzc-tag">{{ tag }}</span>
                      }
                    </div>
                  </div>
                </div>
                <div class="mzc-match">
                  <div class="match-pct">{{ zone.matchPct }}%</div>
                  <div class="match-label">Match</div>
                </div>
              </div>
            }

            <!-- Live jam card -->
            @if (zone.type === 'live') {
              <div class="live-zone-card">
                <div class="lzc-left">
                  <div class="lzc-avatar">{{ zone.bgGradient }}</div>
                  <div class="lzc-info">
                    <div class="lzc-name">{{ zone.name }}</div>
                    <div class="lzc-sub">{{ zone.subtitle }}</div>
                    <div class="lzc-tags">
                      @for (tag of zone.tags; track tag) {
                        <span class="mzc-tag">{{ tag }}</span>
                      }
                    </div>
                  </div>
                </div>
                <span class="live-jam-badge">{{ zone.liveLabel }}</span>
              </div>
            }
          }

          <!-- Nearby Heatmap -->
          <div class="heatmap-section">
            <div class="heatmap-label">Nearby Heatmap</div>
            <div class="heatmap-card">
              <div class="heatmap-grid">
                @for (dot of heatDots; track dot.id) {
                  <div class="heat-dot" [style.left]="dot.x + '%'" [style.top]="dot.y + '%'"
                    [style.width]="dot.size + 'px'" [style.height]="dot.size + 'px'"
                    [style.background]="dot.color" [style.opacity]="dot.opacity + ''"></div>
                }
              </div>
              <div class="heatmap-overlay-label">🔴 Activity Hotspots</div>
              <button class="heatmap-open-btn">OPEN MAP</button>
            </div>
          </div>

        </div>
      }

      <!-- ═══════════════════ COMPOSE MODAL ═══════════════════ -->
      @if (showCompose()) {
        <div class="modal-backdrop" (click)="showCompose.set(false)">
          <div class="compose-modal" (click)="$event.stopPropagation()">
            <div class="compose-handle"></div>
            <h4>Share your vibe</h4>
            <div class="compose-types">
              @for (t of vibeTypes; track t.key) {
                <div class="type-chip" [class.active]="composeType() === t.key"
                  (click)="composeType.set(t.key)">
                  {{ t.emoji }} {{ t.label }}
                </div>
              }
            </div>
            <textarea class="input compose-textarea" [(ngModel)]="composeText"
              [placeholder]="getPlaceholder()" maxlength="280" rows="4"></textarea>
            <div class="compose-footer">
              <label class="anon-toggle">
                <input type="checkbox" [(ngModel)]="composeAnon" />
                <span>Post anonymously</span>
              </label>
              <button class="btn btn-primary btn-sm" (click)="postVibe()"
                [disabled]="!composeText.trim()">Post →</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    /* ── Header ────────────────────────────────────────── */
    .screen-header {
      flex-shrink: 0; display: flex; align-items: center;
      justify-content: space-between; padding: 16px 20px 10px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
      background: rgba(8,8,15,0.95); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
    }
    .back-btn {
      background: none; border: none; color: var(--purple-light);
      font-size: 14px; font-weight: 700; cursor: pointer; padding: 4px 2px;
    }
    .header-logo { display: flex; align-items: center; gap: 8px; }
    .logo-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--purple-primary); box-shadow: 0 0 8px var(--purple-glow);
    }
    .logo-text { font-size: 16px; font-weight: 800; color: var(--purple-light); letter-spacing: 0.5px; }
    .header-actions { display: flex; gap: 6px; }
    .hdr-btn {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: var(--bg-card); font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; position: relative;
    }
    .hdr-bell { position: relative; }
    .notif-dot {
      position: absolute; top: 6px; right: 6px; width: 7px; height: 7px;
      border-radius: 50%; background: var(--pink-accent);
      border: 1.5px solid var(--bg-primary);
    }

    /* ── Main Tabs ─────────────────────────────────────── */
    .main-tabs {
      flex-shrink: 0; display: flex; border-bottom: 1px solid var(--border-subtle);
      background: rgba(8,8,15,0.9);
    }
    .main-tab {
      flex: 1; padding: 12px 4px; font-size: 13px; font-weight: 600;
      color: var(--text-secondary); background: none; border: none;
      cursor: pointer; border-bottom: 2px solid transparent;
      transition: all 0.2s; white-space: nowrap;
      &.active { color: var(--purple-light); border-bottom-color: var(--purple-medium); }
    }

    /* ── Featured Vibe Card ────────────────────────────── */
    .featured-vibe-card {
      background: linear-gradient(135deg, rgba(124,58,237,0.18), rgba(8,8,15,0.95));
      border: 1px solid rgba(124,58,237,0.3); border-radius: 16px;
      padding: 18px; margin: 16px 16px 0;
    }
    .fvc-badges { display: flex; gap: 8px; margin-bottom: 10px; }
    .badge-live {
      padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700;
      background: rgba(124,58,237,0.25); color: var(--purple-light);
      border: 1px solid rgba(124,58,237,0.4);
    }
    .badge-category {
      padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600;
      background: var(--bg-card); color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }
    .fvc-title { font-size: 22px; font-weight: 800; line-height: 1.25; margin: 0 0 8px; color: var(--text-primary); }
    .fvc-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 14px; }
    .fvc-footer { display: flex; align-items: center; justify-content: space-between; }
    .btn-join-vibe {
      background: var(--purple-primary); border: none; border-radius: 20px;
      padding: 9px 20px; color: white; font-size: 13px; font-weight: 700;
      cursor: pointer; box-shadow: 0 2px 12px var(--purple-glow);
      transition: transform 0.15s;
      &:active { transform: scale(0.97); }
    }
    .fvc-members { display: flex; }
    .mini-avatar {
      width: 28px; height: 28px; border-radius: 50%; background: rgba(124,58,237,0.3);
      border: 2px solid var(--bg-primary); display: flex; align-items: center;
      justify-content: center; font-size: 12px; margin-left: -6px; font-weight: 700;
      color: var(--purple-light);
      &:first-child { margin-left: 0; }
      &.extra { background: var(--bg-card); color: var(--text-secondary); font-size: 10px; }
    }

    /* Recent activity */
    .recent-activity { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-subtle); }
    .ra-label { font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.5px; }
    .ra-row { display: flex; gap: 6px; margin-bottom: 5px; font-size: 12px; line-height: 1.4; }
    .ra-user { color: var(--purple-light); font-weight: 600; white-space: nowrap; }
    .ra-text { color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ── Daily Spark Card ──────────────────────────────── */
    .daily-spark-card {
      margin: 12px 16px 0; background: rgba(124,58,237,0.08);
      border: 1px solid rgba(124,58,237,0.2); border-radius: 12px;
      padding: 13px 16px; display: flex; align-items: center; justify-content: space-between;
    }
    .spark-left { display: flex; align-items: center; gap: 10px; }
    .spark-icon { font-size: 18px; color: var(--purple-light); }
    .spark-label { font-size: 10px; font-weight: 700; color: var(--purple-light); letter-spacing: 1px; margin-bottom: 2px; }
    .spark-text { font-size: 13px; color: var(--text-secondary); }
    .spark-text strong { color: var(--text-primary); }
    .btn-spark {
      width: 32px; height: 32px; border-radius: 50%; background: var(--purple-primary);
      border: none; color: white; font-size: 16px; cursor: pointer; flex-shrink: 0;
    }

    /* ── Vibe List Cards ───────────────────────────────── */
    .vibe-list-card {
      margin: 10px 16px 0; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: 14px;
      padding: 14px 14px; display: flex; align-items: flex-start;
      justify-content: space-between; cursor: pointer; transition: border-color 0.2s;
      &:active { border-color: var(--purple-medium); }
    }
    .vlc-left { display: flex; gap: 12px; flex: 1; min-width: 0; }
    .vlc-icon-wrap {
      width: 42px; height: 42px; border-radius: 10px; background: rgba(124,58,237,0.12);
      border: 1px solid rgba(124,58,237,0.25); display: flex; align-items: center;
      justify-content: center; font-size: 20px; flex-shrink: 0;
    }
    .vlc-info { flex: 1; min-width: 0; }
    .vlc-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
    .vlc-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 7px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .vlc-tags { display: flex; gap: 5px; flex-wrap: wrap; }
    .tag {
      padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;
      background: var(--bg-secondary); color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }
    .vlc-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; padding-left: 8px; flex-shrink: 0; }
    .badge-live-sm {
      padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700;
      background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3);
    }
    .vlc-arrow { color: var(--text-secondary); font-size: 18px; }

    /* ── Vibe Stream ───────────────────────────────────── */
    .vibe-stream-section { margin: 20px 16px 0; padding-bottom: 8px; }
    .vs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .vs-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .vs-live-pill {
      font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
      background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3);
    }
    .stream-msg {
      display: flex; gap: 10px; margin-bottom: 14px; align-items: flex-start;
      &.me { flex-direction: row-reverse; }
    }
    .sm-avatar {
      width: 34px; height: 34px; border-radius: 50%; background: var(--bg-card);
      border: 1.5px solid var(--border-medium); font-size: 18px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sm-me-avatar {
      width: 34px; height: 34px; border-radius: 50%; background: rgba(124,58,237,0.2);
      border: 1.5px solid var(--purple-medium); font-size: 18px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sm-body { flex: 1; }
    .sm-header-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 3px; }
    .sm-user { font-size: 12px; font-weight: 700; color: var(--purple-light); }
    .sm-time { font-size: 10px; color: var(--text-secondary); }
    .sm-text { font-size: 13px; color: var(--text-primary); line-height: 1.5;
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: 0 12px 12px 12px; padding: 8px 12px;
    }
    .sm-me-bubble { flex: 1; display: flex; justify-content: flex-end; }
    .sm-me-bubble .sm-text {
      background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.3);
      border-radius: 12px 0 12px 12px; max-width: 80%;
    }
    .sm-actions { display: flex; gap: 12px; margin-top: 5px; padding-left: 12px; }
    .sm-react { font-size: 11px; color: var(--text-secondary); }

    /* ── MY VIBES Tab ─────────────────────────────────── */
    .section-header-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px; margin-bottom: 12px;
    }
    .section-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .live-now-badge {
      font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
      background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3);
    }
    .see-all-btn {
      font-size: 11px; font-weight: 700; color: var(--purple-light); background: none;
      border: none; cursor: pointer; letter-spacing: 0.5px;
    }
    .active-vibe-row {
      display: flex; gap: 12px; margin: 0 16px 2px;
      padding: 13px 14px; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: 14px; margin-bottom: 8px;
      align-items: flex-start;
    }
    .avr-avatar {
      width: 42px; height: 42px; border-radius: 50%; background: rgba(124,58,237,0.15);
      border: 1.5px solid rgba(124,58,237,0.3); font-size: 22px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .avr-body { flex: 1; min-width: 0; }
    .avr-top { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
    .avr-title { font-size: 14px; font-weight: 700; color: var(--text-primary); flex: 1; min-width: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .live-pulse-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #10b981; flex-shrink: 0;
      box-shadow: 0 0 6px #10b981; animation: pulse-dot 1.5s ease-in-out infinite;
    }
    @keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.4} }
    .avr-time { font-size: 10px; color: var(--text-secondary); white-space: nowrap; flex-shrink: 0; }
    .avr-sub { font-size: 12px; color: var(--text-secondary); margin-bottom: 5px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .avr-live { font-size: 10px; font-weight: 700; color: #10b981; }
    .avr-members { font-size: 10px; color: var(--text-secondary); font-weight: 600; }

    /* Squads row */
    .squads-row {
      display: flex; gap: 10px; padding: 0 16px;
      overflow-x: auto; scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .squad-card {
      flex-shrink: 0; width: 130px; background: var(--bg-card);
      border: 1.5px solid var(--border-subtle); border-radius: 14px;
      padding: 14px 12px; display: flex; flex-direction: column;
      align-items: center; gap: 8px; text-align: center;
    }
    .squad-orb {
      width: 52px; height: 52px; border-radius: 50%; border: 2px solid;
      display: flex; align-items: center; justify-content: center;
    }
    .squad-emoji { font-size: 24px; }
    .squad-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .squad-members { font-size: 10px; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.3px; }

    /* Start New Vibe CTA */
    .new-vibe-cta {
      margin: 14px 16px 0; background: rgba(124,58,237,0.08);
      border: 1.5px dashed rgba(124,58,237,0.35); border-radius: 14px;
      padding: 16px; display: flex; align-items: center; justify-content: space-between;
    }
    .nvc-left { display: flex; align-items: center; gap: 12px; }
    .nvc-icon { font-size: 22px; color: var(--purple-light); }
    .nvc-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
    .nvc-sub { font-size: 12px; color: var(--text-secondary); }
    .nvc-plus {
      width: 42px; height: 42px; border-radius: 50%;
      background: linear-gradient(135deg, var(--purple-primary), #5B21B6);
      border: none; color: white; font-size: 22px; cursor: pointer;
      box-shadow: 0 2px 12px var(--purple-glow); flex-shrink: 0;
    }

    /* ── TRENDING Tab ─────────────────────────────────── */
    .live-pulse-header {
      display: flex; align-items: center; gap: 6px; padding: 14px 16px 8px;
      font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #10b981;
    }
    .lph-dot { font-size: 9px; animation: pulse-dot 1.5s infinite; }

    /* Hero trending card */
    .hero-trend-card {
      margin: 0 16px 12px; border-radius: 16px; padding: 20px;
      min-height: 160px; display: flex; flex-direction: column; justify-content: flex-end;
      position: relative; overflow: hidden;
      border: 1px solid rgba(124,58,237,0.3);
    }
    .htc-tags { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
    .htc-tag {
      padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700;
      background: rgba(0,0,0,0.4); color: var(--purple-light);
      border: 1px solid rgba(124,58,237,0.4);
    }
    .htc-vibing { font-size: 10px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
    .htc-title { font-size: 24px; font-weight: 900; color: white; margin: 0 0 12px; }
    .htc-footer { display: flex; align-items: center; justify-content: space-between; }
    .htc-vibing-badge { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: white; }
    .vib-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981;
      box-shadow: 0 0 6px #10b981; animation: pulse-dot 1.5s infinite; }
    .btn-join-zone {
      background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.4);
      border-radius: 20px; padding: 7px 16px; color: white; font-size: 12px;
      font-weight: 700; cursor: pointer; backdrop-filter: blur(8px);
    }

    /* Match card */
    .match-zone-card {
      margin: 0 16px 10px; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: 14px;
      padding: 14px; display: flex; align-items: flex-start; justify-content: space-between;
    }
    .mzc-left { display: flex; gap: 12px; flex: 1; min-width: 0; }
    .mzc-avatar {
      width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
      background: var(--bg-secondary); border: 1.5px solid var(--border-medium);
      display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .mzc-info { flex: 1; min-width: 0; }
    .mzc-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
    .mzc-sub { font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; }
    .mzc-active { display: flex; align-items: center; gap: 5px; font-size: 10px;
      color: #10b981; font-weight: 700; margin-bottom: 6px; }
    .active-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; flex-shrink: 0; }
    .mzc-tags { display: flex; gap: 5px; flex-wrap: wrap; }
    .mzc-tag {
      padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;
      background: var(--bg-secondary); color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }
    .mzc-match { text-align: center; flex-shrink: 0; padding-left: 12px; }
    .match-pct { font-size: 18px; font-weight: 900; color: #10b981; }
    .match-label { font-size: 10px; color: var(--text-secondary); font-weight: 600; }

    /* Live jam card */
    .live-zone-card {
      margin: 0 16px 10px; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: 14px;
      padding: 14px; display: flex; align-items: flex-start; justify-content: space-between;
    }
    .lzc-left { display: flex; gap: 12px; flex: 1; min-width: 0; }
    .lzc-avatar {
      width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
      background: var(--bg-secondary); border: 1.5px solid var(--border-medium);
      display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .lzc-info { flex: 1; min-width: 0; }
    .lzc-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
    .lzc-sub { font-size: 11px; color: var(--text-secondary); margin-bottom: 6px; }
    .lzc-tags { display: flex; gap: 5px; flex-wrap: wrap; }
    .live-jam-badge {
      flex-shrink: 0; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700;
      background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3);
      white-space: nowrap; height: fit-content;
    }

    /* Nearby Heatmap */
    .heatmap-section { margin: 16px 16px 0; padding-bottom: 8px; }
    .heatmap-label { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
    .heatmap-card {
      border-radius: 14px; background: var(--bg-card); border: 1px solid var(--border-subtle);
      height: 140px; position: relative; overflow: hidden;
    }
    .heatmap-grid { position: absolute; inset: 0; background: rgba(8,8,15,0.6); }
    .heat-dot {
      position: absolute; border-radius: 50%; transform: translate(-50%, -50%);
      filter: blur(8px);
    }
    .heatmap-overlay-label {
      position: absolute; bottom: 8px; left: 12px;
      font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.7);
    }
    .heatmap-open-btn {
      position: absolute; bottom: 8px; right: 10px;
      background: rgba(124,58,237,0.3); border: 1px solid rgba(124,58,237,0.5);
      border-radius: 10px; padding: 4px 10px; color: var(--purple-light);
      font-size: 10px; font-weight: 700; cursor: pointer;
    }

    /* ── Compose FAB + Modal ───────────────────────────── */
    .compose-fab {
      position: absolute; bottom: calc(var(--nav-height) + 16px); left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, var(--purple-primary), #5B21B6);
      border: none; border-radius: 24px; padding: 13px 28px;
      color: white; font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 20px var(--purple-glow); white-space: nowrap; z-index: 10;
    }
    .modal-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.7);
      display: flex; align-items: flex-end; z-index: 50;
    }
    .compose-modal {
      width: 100%; background: var(--bg-secondary); border-radius: 24px 24px 0 0;
      padding: 16px 24px 40px; border-top: 1px solid var(--border-medium);
      display: flex; flex-direction: column; gap: 16px;
    }
    .compose-handle {
      width: 36px; height: 4px; border-radius: 2px; background: var(--border-medium); margin: 0 auto -4px;
    }
    .compose-modal h4 { font-size: 16px; font-weight: 700; }
    .compose-types { display: flex; gap: 8px; flex-wrap: wrap; }
    .type-chip {
      padding: 6px 13px; border-radius: 20px; font-size: 13px; cursor: pointer;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle); color: var(--text-secondary);
      &.active { background: rgba(124,58,237,0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }
    .compose-textarea { resize: none; min-height: 100px; }
    .compose-footer { display: flex; align-items: center; justify-content: space-between; }
    .anon-toggle {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      font-size: 13px; color: var(--text-secondary);
      input { accent-color: var(--purple-medium); }
    }

    /* ── Shared screen-content top padding ─────────────── */
    .screen-content { padding-top: 12px; }
  `]
})
export class VibeFeedComponent implements OnInit {
  activeMain = signal<'all' | 'mine' | 'trending'>('all');
  fromZoneId = signal<string | null>(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zoneSession: ZoneSessionService
  ) {}

  onRefresh() { window.location.reload(); }

  showCompose = signal(false);
  composeType = signal('vibe');
  composeText = '';
  composeAnon = false;

  mainTabs: { key: 'all' | 'mine' | 'trending'; label: string }[] = [
    { key: 'all',      label: 'All Vibes' },
    { key: 'mine',     label: 'My Vibes' },
    { key: 'trending', label: 'Trending' }
  ];

  vibeTypes = [
    { key: 'vibe',       emoji: '💜', label: 'Vibe' },
    { key: 'confession', emoji: '🤫', label: 'Confession' },
    { key: 'shoutout',   emoji: '📢', label: 'Shoutout' },
    { key: 'question',   emoji: '❓', label: 'Question' }
  ];

  sparkTopic = 'Memory Synthesis';

  /* ── ALL VIBES data ──────────────────────────────── */
  allVibes = signal<VibeChannel[]>([
    {
      id: 'vc1', title: 'Post-Digital Philosophy & Chill', category: 'Global Nexus',
      categoryIcon: '💬', liveCount: 128,
      description: 'Discussing the intersection of AI, consciousness, and the future of social architecture.',
      tags: ['#philosophy', '#AI'], members: ['🧑', '👩', '🧔', '👸'],
      memberCount: 175, joined: false,
      recentMessages: [
        { user: 'Ghost_99', text: 'The neural net is just a mirror...' },
        { user: 'Echo_User', text: 'Vibe check on the new protocol?' },
        { user: 'Nex_5',    text: 'Anyone seen the latest drop?' }
      ]
    },
    {
      id: 'vc2', title: 'Vaporwave Aesthetics', category: 'Visual', categoryIcon: '🎞️',
      liveCount: 42, description: '90s nostalgia meets futuristic dystopia. Share your best visual finds.',
      tags: ['#visuals', '#retro'], members: ['🧑', '👩'], memberCount: 58, joined: true,
      recentMessages: []
    },
    {
      id: 'vc3', title: 'Techno Underground', category: 'Audio', categoryIcon: '🎵',
      liveCount: 99, description: 'Berlin scene updates, hardware talk, and set recommendations.',
      tags: ['#audio', '#modular'], members: ['🧑', '👩', '🧔'], memberCount: 130, joined: false,
      recentMessages: []
    },
    {
      id: 'vc4', title: 'The Syntax Void', category: 'Dev', categoryIcon: '< />',
      liveCount: 13, description: 'Deep dives into obscure languages and the philosophy of code.',
      tags: ['#dev', '#logic'], members: ['🧑'], memberCount: 22, joined: false,
      recentMessages: []
    }
  ]);

  streamMessages = signal<StreamMsg[]>([
    {
      id: 's1', user: 'Anon_4012', avatarEmoji: '🧑', timeAgo: '1M AGO',
      text: "Just uploaded a new track to the 'Vaporwave' vibe. Let me know what you think of the synth layering!",
      likes: 12, replies: 4, isMe: false
    },
    {
      id: 's2', user: 'Me', avatarEmoji: '🧑‍🎤', timeAgo: 'JUST NOW',
      text: "The layering is insane. Especially around 0:45. Gives me heavy Blade Runner 2049 vibes.",
      likes: 0, replies: 0, isMe: true
    },
    {
      id: 's3', user: 'Circuit_Breaker', avatarEmoji: '🤖', timeAgo: '5M AGO',
      text: "Agreed. The low-pass filter sweep was buttery smooth.",
      likes: 24, replies: 0, isMe: false
    }
  ]);

  /* ── MY VIBES data ───────────────────────────────── */
  myActiveVibes = signal<MyActiveVibe[]>([
    {
      id: 'mv1', title: 'Midnight Lo-Fi', subtitle: 'This drop is actually insane, wh...',
      liveCount: 9, memberCount: 15, timestamp: '', isLive: true, avatarEmoji: '🎧'
    },
    {
      id: 'mv2', title: 'Retro Raiders', subtitle: 'Alex: "Anyone up for a speedrun..."',
      liveCount: 0, memberCount: 3, timestamp: '15m ago', isLive: false, avatarEmoji: '🕹️'
    },
    {
      id: 'mv3', title: 'After Hours', subtitle: '"The vibe in Tokyo right now is..."',
      liveCount: 43, memberCount: 148, timestamp: '', isLive: true, avatarEmoji: '🌙'
    }
  ]);

  mySquads = signal<Squad[]>([
    { id: 'sq1', name: 'Alpha Team', memberCount: 129, emoji: '⚡', color: '#7c3aed' },
    { id: 'sq2', name: 'Glitch Runners', memberCount: 52, emoji: '◎', color: '#06b6d4' }
  ]);

  /* ── TRENDING data ───────────────────────────────── */
  trendingZones = signal<TrendingZone[]>([
    {
      id: 'tz1', name: 'Neon Cathedral', type: 'hero',
      subtitle: 'Downtown • 0.3 miles away', liveLabel: 'IS HOT RIGHT NOW',
      activeCount: 0, tags: ['#ELECTONIGHT', '#TECHNWAVE'],
      bgGradient: 'linear-gradient(145deg, rgba(60,20,120,0.9), rgba(120,20,80,0.8), rgba(8,8,15,0.95))'
    },
    {
      id: 'tz2', name: 'The Blue Note Loft', type: 'match',
      subtitle: 'Lounge • Downtown • 2.4 miles away',
      matchPct: 94, activeCount: 192,
      tags: ['#JazzLounge', '#Chill'],
      bgGradient: '🎷'
    },
    {
      id: 'tz3', name: 'Echo Chambers', type: 'live',
      subtitle: 'Creative • Arts District • 0.8 miles away',
      liveLabel: 'Live Jam', activeCount: 42,
      tags: ['#Beats', '#StudioFlow'],
      bgGradient: '🎙️'
    }
  ]);

  heatDots = [
    { id: 1, x: 28, y: 35, size: 60, color: '#ec4899', opacity: 0.6 },
    { id: 2, x: 55, y: 55, size: 80, color: '#7c3aed', opacity: 0.5 },
    { id: 3, x: 72, y: 30, size: 45, color: '#06b6d4', opacity: 0.4 },
    { id: 4, x: 40, y: 70, size: 35, color: '#f59e0b', opacity: 0.35 },
    { id: 5, x: 82, y: 65, size: 50, color: '#10b981', opacity: 0.4 }
  ];

  joinVibe(ch: VibeChannel) {
    this.allVibes.update(list =>
      list.map(v => v.id === ch.id ? { ...v, joined: !v.joined } : v)
    );
  }

  openCompose() { this.showCompose.set(true); }

  postVibe() {
    if (!this.composeText.trim()) return;
    this.composeText = '';
    this.showCompose.set(false);
  }

  getPlaceholder(): string {
    const map: Record<string, string> = {
      confession: 'Confess something anonymously...',
      shoutout:   'Give a shoutout to someone here...',
      question:   'Ask something to everyone around...',
      vibe:       "What's your vibe right now?"
    };
    return map[this.composeType()] || 'Share something...';
  }

  ngOnInit() {
    // Priority: query param → active session
    const fromZone = this.route.snapshot.queryParamMap.get('fromZone')
      ?? this.zoneSession.activeZoneId();
    if (fromZone) this.fromZoneId.set(fromZone);
  }

  goBackToZone() {
    this.router.navigate(['/app/zone', this.fromZoneId()]);
  }

  goNotifications() { this.router.navigate(['/app/notifications']); }
}
