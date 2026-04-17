import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../core/services/zone.service';
import { Zone } from '../../core/models';

type ActionTab = 'lounge' | 'games' | 'vibe' | 'confess';

/** Positions are in WORLD coordinates (0–100%) inside the 300%×300% world div */
interface LoungeUser {
  id: string;
  name: string;
  avatarEmoji: string;
  ringColor: string;
  activityEmoji: string;
  nameStyle: 'pill' | 'text';
  nameColor: string;
  /** world x position 0-100 (50 = viewport center) */
  wx: number;
  /** world y position 0-100 (50 = viewport center) */
  wy: number;
  size: 'lg' | 'md' | 'sm';
  isMe: boolean;
  /** distance ring: 1=near, 2=mid, 3=far (far users only visible when zoomed out) */
  ring: 1 | 2 | 3;
}

interface ConfessionPost {
  id: string; avatarEmoji: string; timeAgo: string;
  text: string; revealed: boolean; mood: string;
}

const STEPS = ['Syncing your avatar...', 'Scanning zone frequencies...', 'Connecting...', 'Almost there...'];

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="zone-root">

      <!-- ══ HEADER ══════════════════════════════════════════ -->
      <div class="zone-header">
        <div class="zh-left">
          <div class="signal-icon">
            <span class="sig-ring sr-o"></span>
            <span class="sig-ring sr-m"></span>
            <span class="sig-dot"></span>
          </div>
          <h1 class="zone-title">{{ (zone()?.name || 'Neon Lounge') | uppercase }}</h1>
        </div>
        <div class="zh-right">
          <button class="players-pill">
            <span class="pill-dot"></span>
            {{ playerCount() }} MEMBERS
          </button>
          <button class="leave-btn" (click)="leaveZone()">✕</button>
        </div>
      </div>

      <!-- ══ LOUNGE VIEWPORT (clips the 300% world) ══════════ -->
      <div class="lounge-viewport">

        <!-- 300%×300% scalable world — transform-origin = viewport center -->
        <div class="lounge-world"
          [style.transform]="'scale(' + zoomLevel() + ')'">

          <!-- ── Isometric room background ── -->
          <div class="iso-room">
            <div class="iso-ceiling">
              <div class="ceiling-spot cs1"></div>
              <div class="ceiling-spot cs2"></div>
              <div class="ceiling-spot cs3"></div>
            </div>
            <div class="iso-wall-left"></div>
            <div class="iso-wall-right">
              <div class="neon-strip"></div>
            </div>
            <div class="iso-floor"><div class="floor-grid"></div></div>
            <div class="iso-pillar p1"></div>
            <div class="iso-pillar p2"></div>
            <div class="glow-pool gp1"></div>
            <div class="glow-pool gp2"></div>
          </div>

          <!-- ── Avatar nodes ── -->
          @for (u of loungeUsers(); track u.id) {
            <div class="avatar-node"
              [class]="'size-' + u.size"
              [style.left]="u.wx + '%'"
              [style.top]="u.wy + '%'"
              (click)="openProfile(u)">

              @if (u.activityEmoji) {
                <div class="activity-float">{{ u.activityEmoji }}</div>
              }

              <div class="avatar-frame"
                [class.me-frame]="u.isMe"
                [style.border-color]="u.ringColor"
                [style.box-shadow]="'0 0 20px ' + u.ringColor + '99, 0 0 6px ' + u.ringColor + '55'">
                <div class="avatar-inner">{{ u.avatarEmoji }}</div>
              </div>

              @if (u.nameStyle === 'pill') {
                <div class="username-pill">{{ u.name }}</div>
              } @else {
                <div class="username-text" [style.color]="u.nameColor">{{ u.name }}</div>
              }

              @if (u.isMe) {
                <div class="you-sparkle">✦ ✦</div>
              }
            </div>
          }
        </div><!-- /lounge-world -->

        <!-- ── Zoom controls (outside world, always same size) ── -->
        <div class="zoom-controls">
          <button class="zoom-btn" (click)="adjustZoom(0.12)"
            [disabled]="zoomLevel() >= MAX_ZOOM">
            <span>+</span>
          </button>
          <div class="zoom-indicator">
            <div class="zoom-bar-track">
              <div class="zoom-bar-fill"
                [style.height]="zoomPercent() + '%'"></div>
            </div>
          </div>
          <button class="zoom-btn" (click)="adjustZoom(-0.12)"
            [disabled]="zoomLevel() <= MIN_ZOOM">
            <span>−</span>
          </button>
        </div>

      </div><!-- /lounge-viewport -->

      <!-- ══ ZONE ACTION BAR ══════════════════════════════════ -->
      <div class="zone-bar">
        <button class="zb-btn" [class.active]="activeAction() === 'games'"
          (click)="setAction('games')">
          <div class="zb-icon-wrap" [class.active-wrap]="activeAction() === 'games'">🎮</div>
          <span class="zb-label">GAMES</span>
        </button>
        <button class="zb-btn" [class.active]="activeAction() === 'vibe'"
          (click)="setAction('vibe')">
          <div class="zb-icon-wrap" [class.active-wrap]="activeAction() === 'vibe'">💜</div>
          <span class="zb-label">VIBE</span>
        </button>
        <button class="zb-btn" [class.active]="activeAction() === 'confess'"
          (click)="setAction('confess')">
          <div class="zb-icon-wrap" [class.active-wrap]="activeAction() === 'confess'">✦</div>
          <span class="zb-label">CONFESS</span>
        </button>
      </div>

      <!-- ══ CONFESS OVERLAY (slides up over lounge) ══════════ -->
      @if (activeAction() === 'confess') {
        <div class="confess-overlay">
          <div class="confess-hdr">
            <div class="confess-hdr-left">
              <span class="lock-icon">🔒</span>
              <span class="confess-hdr-title">This stays in the zone 🤫</span>
            </div>
            <button class="confess-menu-btn" (click)="activeAction.set('lounge')">✕</button>
          </div>
          <div class="confess-body">
            <div class="privacy-shield">
              <span class="ps-label">PRIVACY SHIELD ACTIVE</span>
              <span class="ps-sub">No one outside can see this. Be real.</span>
            </div>
            <div class="confess-card">
              <textarea class="confess-ta" [(ngModel)]="confessText"
                placeholder="Say what you've been holding in..."
                rows="3" maxlength="500"></textarea>
              <div class="anon-row">
                <span class="anon-label">🔒 POST ANONYMOUSLY</span>
                <div class="toggle-wrap" (click)="confessAnon.set(!confessAnon())">
                  <div class="toggle-track" [class.on]="confessAnon()">
                    <div class="toggle-thumb"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mood-section">
              <div class="mood-label">HOW ARE YOU FEELING?</div>
              <div class="mood-chips">
                @for (m of moods; track m.key) {
                  <button class="mood-chip" [class.active]="selectedMood() === m.key"
                    (click)="selectedMood.set(m.key)">{{ m.emoji }} {{ m.label }}</button>
                }
              </div>
            </div>
            <button class="release-btn" [disabled]="!confessText.trim()"
              (click)="releaseConfession()">Release It 🔥</button>
            <div class="feed-hdr">
              <span class="feed-title">From this zone, right now</span>
              <span class="feed-live-dot"></span>
            </div>
            @for (post of confessionFeed(); track post.id) {
              <div class="cf-card">
                <div class="cf-top">
                  <span class="cf-avatar">{{ post.avatarEmoji }}</span>
                  <span class="cf-time">{{ post.timeAgo }}</span>
                </div>
                <div class="cf-content-wrap">
                  <p class="cf-text" [class.blurred]="!post.revealed">{{ post.text }}</p>
                  @if (!post.revealed) {
                    <button class="tap-to-read" (click)="revealPost(post)">TAP TO READ</button>
                  }
                </div>
              </div>
            }
            <div style="height:20px"></div>
          </div>
        </div>
      }

      <!-- ══ PROFILE PEEK SHEET ════════════════════════════════ -->
      @if (peekedUser()) {
        <div class="sheet-backdrop" (click)="peekedUser.set(null)">
          <div class="profile-sheet" (click)="$event.stopPropagation()">
            <div class="sheet-handle"></div>
            <div class="sheet-avatar"
              [style.border-color]="peekedUser()!.ringColor"
              [style.box-shadow]="'0 0 24px ' + peekedUser()!.ringColor + '88'">
              {{ peekedUser()!.avatarEmoji }}
            </div>
            <div class="sheet-name">{{ peekedUser()!.name }}</div>
            <div class="sheet-badge">{{ peekedUser()!.activityEmoji || '✨' }} Active now</div>
            <div class="sheet-actions">
              <button class="btn btn-primary">Connect 🤝</button>
              <button class="btn btn-ghost">Say hi 👋</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    /* ── Root ─────────────────────────────────────────── */
    .zone-root {
      display: flex; flex-direction: column; flex: 1; min-height: 0;
      background: #090912; position: relative; overflow: hidden;
    }

    /* ── Header ───────────────────────────────────────── */
    .zone-header {
      flex-shrink: 0; display: flex; align-items: center;
      justify-content: space-between; padding: 12px 16px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
      background: rgba(9,9,18,0.96); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06); z-index: 20;
    }
    .zh-left { display: flex; align-items: center; gap: 10px; }
    .zh-right { display: flex; align-items: center; gap: 8px; }

    .signal-icon {
      position: relative; width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
    }
    .sig-ring {
      position: absolute; border-radius: 50%; border: 1.5px solid #a78bfa;
      animation: sig-pulse 2s ease-in-out infinite;
    }
    .sr-o { width: 20px; height: 20px; opacity: 0.3; animation-delay: 0s; }
    .sr-m { width: 13px; height: 13px; opacity: 0.55; animation-delay: 0.4s; }
    .sig-dot {
      position: absolute; width: 5px; height: 5px; border-radius: 50%;
      background: #a78bfa; box-shadow: 0 0 6px #a78bfa;
    }
    @keyframes sig-pulse {
      0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.1)}
    }
    .zone-title {
      font-size: 15px; font-weight: 900; color: white; letter-spacing: 1.5px; margin: 0;
    }
    .players-pill {
      display: flex; align-items: center; gap: 6px;
      background: rgba(16,185,129,0.1); border: 1.5px solid rgba(16,185,129,0.35);
      border-radius: 20px; padding: 5px 12px; font-size: 11px; font-weight: 700;
      color: #10b981; cursor: default; letter-spacing: 0.5px;
    }
    .pill-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #10b981;
      box-shadow: 0 0 6px #10b981; animation: pill-blink 1.5s infinite;
    }
    @keyframes pill-blink { 0%,100%{opacity:1}50%{opacity:0.4} }
    .leave-btn {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(255,255,255,0.08); border: none;
      color: rgba(255,255,255,0.5); font-size: 13px; cursor: pointer;
    }

    /* ══ LOUNGE VIEWPORT ══════════════════════════════════ */
    .lounge-viewport {
      flex: 1; min-height: 0; position: relative; overflow: hidden;
    }

    /*
      The world is 3× the viewport in both dimensions.
      top: -100% and left: -100% centre it so viewport-centre = world 50,50%.
      transform-origin: 50% 50%  keeps that centre-point fixed while scaling.
    */
    .lounge-world {
      position: absolute;
      width: 300%; height: 300%;
      top: -100%; left: -100%;
      transform-origin: 50% 50%;
      transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
    }

    /* ── ISO room (fills entire world) ─────────────────── */
    .iso-room { position: absolute; inset: 0; pointer-events: none; }

    .iso-ceiling {
      position: absolute; top: 0; left: 0; right: 0; height: 38%;
      background: linear-gradient(180deg,
        rgba(14,14,30,1) 0%, rgba(18,15,38,0.85) 60%, rgba(9,9,18,0) 100%);
      &::before {
        content: ''; position: absolute; inset: 0;
        background:
          repeating-linear-gradient(90deg,rgba(255,255,255,0.025) 0,rgba(255,255,255,0.025) 1px,transparent 1px,transparent 60px),
          repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0,rgba(255,255,255,0.025) 1px,transparent 1px,transparent 60px);
        transform: perspective(300px) rotateX(-30deg);
        transform-origin: top center; opacity: 0.5;
      }
    }
    .ceiling-spot {
      position: absolute; border-radius: 50%;
      background: radial-gradient(ellipse at 50% 0%,rgba(120,80,220,0.22) 0%,rgba(120,80,220,0.05) 50%,transparent 70%);
      animation: spot-breathe 4s ease-in-out infinite;
    }
    .cs1{width:220px;height:320px;top:0;left:20%;animation-delay:0s}
    .cs2{width:160px;height:240px;top:0;left:50%;transform:translateX(-50%);animation-delay:1.2s}
    .cs3{width:190px;height:280px;top:0;right:15%;animation-delay:0.6s}
    @keyframes spot-breathe{0%,100%{opacity:0.6}50%{opacity:1}}

    .iso-wall-left {
      position: absolute; top:0; left:0; bottom:0; width:8%;
      background: linear-gradient(90deg,rgba(20,18,40,0.95) 0%,transparent 100%);
    }
    .iso-wall-right {
      position: absolute; top:0; right:0; bottom:0; width:8%;
      background: linear-gradient(270deg,rgba(20,18,40,0.9) 0%,transparent 100%);
    }
    .neon-strip {
      position:absolute;top:20%;left:0;width:4px;height:50%;
      background:linear-gradient(180deg,transparent,#ec4899 20%,#c084fc 50%,#ec4899 80%,transparent);
      box-shadow:0 0 12px #ec4899,0 0 24px rgba(236,72,153,0.4); border-radius:2px;
    }
    .iso-floor {
      position:absolute;bottom:0;left:0;right:0;height:45%;
      background:linear-gradient(0deg,rgba(10,8,22,0.98) 0%,rgba(14,12,30,0.5) 60%,transparent 100%);
      overflow:hidden;
    }
    .floor-grid {
      position:absolute;inset:0;
      background:
        repeating-linear-gradient(90deg,rgba(124,58,237,0.08) 0,rgba(124,58,237,0.08) 1px,transparent 1px,transparent 44px),
        repeating-linear-gradient(0deg,rgba(124,58,237,0.06) 0,rgba(124,58,237,0.06) 1px,transparent 1px,transparent 44px);
      transform:perspective(280px) rotateX(45deg);
      transform-origin:bottom center;
    }
    .iso-pillar {
      position:absolute;bottom:28%;width:22px;
      background:linear-gradient(180deg,rgba(40,35,70,0.9),rgba(22,20,45,0.8));
      border:1px solid rgba(124,58,237,0.15); border-radius:3px;
    }
    .p1{left:38%;height:28%} .p2{left:54%;height:24%}
    .glow-pool{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;}
    .gp1{width:240px;height:90px;bottom:10%;left:22%;background:rgba(124,58,237,0.18);}
    .gp2{width:180px;height:70px;bottom:8%;right:12%;background:rgba(6,182,212,0.12);}

    /* ── Avatar nodes ───────────────────────────────────── */
    .avatar-node {
      position: absolute; display: flex; flex-direction: column;
      align-items: center; gap: 4px;
      transform: translate(-50%, -50%); cursor: pointer; z-index: 10;
      transition: transform 0.2s;
      &:active { transform: translate(-50%, -50%) scale(0.92); }
    }
    /* Sizes */
    .size-lg .avatar-frame { width: min(86px, 20vw); height: min(86px, 20vw); }
    .size-md .avatar-frame { width: min(64px, 15vw); height: min(64px, 15vw); }
    .size-sm .avatar-frame { width: min(50px, 12vw); height: min(50px, 12vw); }
    .size-lg .avatar-inner  { font-size: min(42px, 10vw); }
    .size-md .avatar-inner  { font-size: min(30px, 7vw); }
    .size-sm .avatar-inner  { font-size: min(22px, 5.5vw); }

    .activity-float {
      font-size: min(20px, 5vw); margin-bottom: -2px;
      animation: float-bob 2.5s ease-in-out infinite;
      filter: drop-shadow(0 0 4px rgba(255,200,0,0.6));
    }
    @keyframes float-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}

    .avatar-frame {
      border-radius: 50%; border: 2.5px solid; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      background: radial-gradient(circle at 38% 36%,rgba(80,50,120,0.5),rgba(9,9,18,0.95) 75%);
      animation: avatar-appear 0.6s ease both;
    }
    .me-frame {
      border-width: 3px !important;
      box-shadow: 0 0 0 4px rgba(167,139,250,0.2), 0 0 24px rgba(167,139,250,0.5) !important;
    }
    @keyframes avatar-appear{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
    .avatar-inner { line-height: 1; user-select: none; }

    .username-pill {
      background: rgba(30,25,55,0.88); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px; padding: 4px 12px;
      font-size: min(11px, 2.8vw); font-weight: 700; color: white;
      white-space: nowrap; backdrop-filter: blur(6px);
    }
    .username-text {
      font-size: min(10px, 2.5vw); font-weight: 700;
      letter-spacing: 0.5px; white-space: nowrap;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
    }
    .you-sparkle {
      font-size: 10px; color: #facc15; letter-spacing: 4px;
      animation: sparkle-spin 2s linear infinite;
    }
    @keyframes sparkle-spin{0%,100%{opacity:0.7}50%{opacity:1;transform:scale(1.15)}}

    /* ── Zoom Controls ─────────────────────────────────── */
    .zoom-controls {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      z-index: 30;
    }
    .zoom-btn {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(20,18,40,0.85); border: 1.5px solid rgba(124,58,237,0.35);
      color: white; font-size: 22px; font-weight: 300; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(8px); transition: all 0.2s;
      line-height: 1;
      &:not(:disabled):active {
        background: rgba(124,58,237,0.3); border-color: rgba(124,58,237,0.7);
        transform: scale(0.92);
      }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .zoom-indicator { display: flex; flex-direction: column; align-items: center; }
    .zoom-bar-track {
      width: 4px; height: 50px; border-radius: 2px;
      background: rgba(255,255,255,0.1); overflow: hidden;
      display: flex; flex-direction: column-reverse;
    }
    .zoom-bar-fill {
      width: 100%; border-radius: 2px;
      background: linear-gradient(0deg, #7c3aed, #c4b5fd);
      transition: height 0.3s ease;
    }

    /* ══ ZONE ACTION BAR ══════════════════════════════════ */
    .zone-bar {
      flex-shrink: 0; display: flex; align-items: center;
      justify-content: space-around;
      padding: 10px 20px calc(env(safe-area-inset-bottom, 0px) + 10px);
      background: rgba(9,9,18,0.98);
      border-top: 1px solid rgba(124,58,237,0.2);
      z-index: 20;
    }
    .zb-btn {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 4px 16px;
      color: rgba(255,255,255,0.3); transition: color 0.2s;
      &.active { color: white; }
    }
    .zb-icon-wrap {
      width: 54px; height: 54px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; background: rgba(255,255,255,0.06);
      border: 1.5px solid rgba(255,255,255,0.1);
      transition: all 0.25s;
    }
    .zb-icon-wrap.active-wrap {
      background: linear-gradient(135deg, #7c3aed, #5B21B6);
      border-color: #8b5cf6; font-size: 24px;
      box-shadow: 0 4px 20px rgba(124,58,237,0.5);
    }
    .zb-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
    }

    /* ══ CONFESS OVERLAY ══════════════════════════════════ */
    .confess-overlay {
      position: absolute; inset: 0; z-index: 40; background: #0d0b1e;
      display: flex; flex-direction: column;
      animation: slide-up 0.32s cubic-bezier(0.16,1,0.3,1) both;
    }
    @keyframes slide-up{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    .confess-hdr {
      flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
      padding:14px 18px; background:rgba(18,15,38,0.95);
      border-bottom:1px solid rgba(255,255,255,0.06);
    }
    .confess-hdr-left{display:flex;align-items:center;gap:10px;}
    .lock-icon{font-size:18px}
    .confess-hdr-title{font-size:14px;font-weight:700;color:white}
    .confess-menu-btn{
      width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.08);
      border:none;color:rgba(255,255,255,0.6);font-size:14px;cursor:pointer;
    }
    .confess-body{
      /* Never flex-shrink children — scroll the whole body instead */
      flex:1;min-height:0;overflow-y:auto;padding:12px 16px;scrollbar-width:none;
      display:flex;flex-direction:column;gap:10px;
      /* Prevent flex from squeezing children */
      align-items:stretch;
      &::-webkit-scrollbar{display:none}
    }
    .privacy-shield{display:flex;flex-direction:column;gap:3px;flex-shrink:0}
    .ps-label{font-size:11px;font-weight:800;letter-spacing:1px;color:#f59e0b}
    .ps-sub{font-size:13px;color:rgba(255,255,255,0.45)}

    /* Divider below privacy shield */
    .privacy-shield::after{
      content:''; display:block; height:1px;
      background:rgba(255,255,255,0.08); margin-top:10px;
    }

    .confess-card{
      /* Fixed size — never shrinks */
      flex-shrink:0;
      background:rgba(22,18,45,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;
    }
    .confess-ta{
      /* Locked height — resize:none + explicit height so flex cannot crush it */
      display:block;
      width:100%; height:110px;           /* fixed, always 110 px tall */
      padding:14px 16px;resize:none;
      border:none;outline:none;
      background:transparent;color:white;font-size:14px;line-height:1.6;
      font-family:inherit;box-sizing:border-box;
      overflow-y:auto;                     /* scroll inside if text overflows */
      &::placeholder{color:rgba(255,255,255,0.25)}
    }
    .anon-row{
      display:flex;align-items:center;justify-content:space-between;
      padding:11px 16px;border-top:1px solid rgba(255,255,255,0.06);
    }
    .anon-label{font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:0.5px}
    .toggle-wrap{cursor:pointer}
    .toggle-track{
      width:44px;height:26px;border-radius:13px;background:rgba(255,255,255,0.12);
      position:relative;transition:background 0.25s;
      &.on{background:#10b981}
    }
    .toggle-thumb{
      position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;
      background:white;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    }
    .toggle-track.on .toggle-thumb{transform:translateX(18px)}
    .mood-section{display:flex;flex-direction:column;gap:10px;flex-shrink:0}
    .mood-label{font-size:11px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,0.35)}
    .mood-chips{display:flex;gap:6px;flex-wrap:wrap}
    .mood-chip{
      padding:6px 11px;border-radius:20px;font-size:12px;font-weight:600;
      background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
      color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.2s;
      &.active{background:rgba(124,58,237,0.2);border-color:#8b5cf6;color:white}
    }
    .release-btn{
      flex-shrink:0;
      width:100%;padding:13px;border-radius:16px;border:none;
      background:linear-gradient(90deg,#7c3aed 0%,#a855f7 40%,#f97316 100%);
      color:white;font-size:16px;font-weight:800;cursor:pointer;
      box-shadow:0 4px 24px rgba(124,58,237,0.4);transition:opacity 0.2s,transform 0.15s;
      &:disabled{opacity:0.3;cursor:default}
      &:not(:disabled):active{transform:scale(0.98)}
    }
    .feed-hdr{display:flex;align-items:center;justify-content:space-between;padding:4px 0 2px;flex-shrink:0}
    .feed-title{font-size:15px;font-weight:800;color:white}
    .feed-live-dot{
      width:9px;height:9px;border-radius:50%;background:#10b981;
      box-shadow:0 0 8px #10b981;animation:pill-blink 1.5s infinite;
    }
    .cf-card{
      background:rgba(18,15,38,0.7);border:1px solid rgba(255,255,255,0.07);
      border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;
    }
    .cf-top{display:flex;align-items:center;justify-content:space-between}
    .cf-avatar{font-size:22px} .cf-time{font-size:11px;color:rgba(255,255,255,0.3)}
    .cf-content-wrap{position:relative}
    .cf-text{
      font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;margin:0;
      transition:filter 0.4s;
      &.blurred{filter:blur(5px);user-select:none}
    }
    .tap-to-read{
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      background:rgba(30,25,55,0.88);border:1px solid rgba(255,255,255,0.15);
      border-radius:20px;padding:7px 18px;font-size:12px;font-weight:700;
      color:white;cursor:pointer;white-space:nowrap;backdrop-filter:blur(6px);letter-spacing:0.5px;
    }

    /* ══ PROFILE SHEET ════════════════════════════════════ */
    .sheet-backdrop{
      position:absolute;inset:0;background:rgba(0,0,0,0.65);
      display:flex;align-items:flex-end;z-index:50;
    }
    .profile-sheet{
      width:100%;background:rgba(18,15,38,0.98);border-radius:24px 24px 0 0;
      border-top:1px solid rgba(124,58,237,0.3);padding:16px 28px 40px;
      display:flex;flex-direction:column;align-items:center;gap:12px;
    }
    .sheet-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15);margin-bottom:8px}
    .sheet-avatar{
      width:80px;height:80px;border-radius:50%;border:2.5px solid;font-size:42px;
      display:flex;align-items:center;justify-content:center;
      background:radial-gradient(circle at 38% 36%,rgba(80,50,120,0.5),rgba(9,9,18,0.95) 75%);
    }
    .sheet-name{font-size:18px;font-weight:800;color:white;letter-spacing:0.5px}
    .sheet-badge{
      font-size:12px;color:rgba(255,255,255,0.5);font-weight:600;
      background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);
      border-radius:20px;padding:4px 14px;
    }
    .sheet-actions{display:flex;gap:12px;margin-top:8px;width:100%}
    .sheet-actions .btn{flex:1}
  `]
})
export class ZoneComponent implements OnInit, OnDestroy {
  readonly MIN_ZOOM = 0.35;
  readonly MAX_ZOOM = 1.05;

  zone         = signal<Zone | null>(null);
  peekedUser   = signal<LoungeUser | null>(null);
  activeAction = signal<ActionTab>('lounge');
  playerCount  = signal(42);
  zoomLevel    = signal(0.65);   // default: near+mid ring visible

  /** 0–100 % for the zoom bar fill (0 = min zoom, 100 = max zoom) */
  zoomPercent = computed(() => {
    const range = this.MAX_ZOOM - this.MIN_ZOOM;
    return Math.round(((this.zoomLevel() - this.MIN_ZOOM) / range) * 100);
  });

  /* ── Confess state ─────────────────────────────────── */
  confessText  = '';
  confessAnon  = signal(true);
  selectedMood = signal('heartbroken');
  moods = [
    { key: 'frustrated',  emoji: '😤', label: 'Frustrated' },
    { key: 'heartbroken', emoji: '💔', label: 'Heartbroken' },
    { key: 'overwhelmed', emoji: '😮‍💨', label: 'Overwhelm' },
    { key: 'lonely',      emoji: '🌙', label: 'Lonely' },
    { key: 'anxious',     emoji: '😰', label: 'Anxious' }
  ];
  confessionFeed = signal<ConfessionPost[]>([
    { id:'c1', avatarEmoji:'🦊', timeAgo:'2m ago',  revealed:false, mood:'frustrated',
      text:"I can't stop thinking about someone I met here last week. We talked for hours but I didn't get their contact. Came back every day hoping to see them again." },
    { id:'c2', avatarEmoji:'🙏', timeAgo:'12m ago', revealed:false, mood:'heartbroken',
      text:"Actually the reason I'm always here working late is because going home feels empty. I keep smiling because I don't want to be a burden." },
    { id:'c3', avatarEmoji:'🌻', timeAgo:'31m ago', revealed:false, mood:'overwhelmed',
      text:"I quit my job today without a backup plan. Terrified but also weirdly free? Told no one. You're the first to know." }
  ]);

  /* ── Lounge users ──────────────────────────────────── */
  /*
    wx/wy are world % positions (0-100).
    world = 300%×300% div, so world 50%/50% = viewport center.
    Ring 1 (±8-12%):  visible at default zoom 0.65
    Ring 2 (±18-23%): visible at default zoom 0.65 (near edge)
    Ring 3 (±30-38%): visible only when zoomed out ≤ 0.48
  */
  loungeUsers = signal<LoungeUser[]>([
    // ── ME ── always center
    { id:'me', name:'NOVA_STREAM', avatarEmoji:'👩‍🎤', ringColor:'#c084fc',
      activityEmoji:'', nameStyle:'pill', nameColor:'white',
      wx:50, wy:50, size:'lg', isMe:true, ring:1 },
    // ── Ring 1 (near) ──
    { id:'u1', name:'ZANDER_9X',  avatarEmoji:'🧑',   ringColor:'#7c3aed',
      activityEmoji:'🎮', nameStyle:'text', nameColor:'#a78bfa',
      wx:40, wy:41, size:'md', isMe:false, ring:1 },
    { id:'u2', name:'KAI_GHOST',  avatarEmoji:'🧑‍💻', ringColor:'#10b981',
      activityEmoji:'🔥', nameStyle:'text', nameColor:'#34d399',
      wx:61, wy:40, size:'sm', isMe:false, ring:1 },
    // ── Ring 2 (medium) ──
    { id:'u3', name:'SOL_RUNNER', avatarEmoji:'🧔',   ringColor:'#06b6d4',
      activityEmoji:'🎵', nameStyle:'text', nameColor:'#67e8f9',
      wx:30, wy:60, size:'sm', isMe:false, ring:2 },
    { id:'u4', name:'MOCHI_BABE', avatarEmoji:'👩',   ringColor:'#ec4899',
      activityEmoji:'✨', nameStyle:'text', nameColor:'#f9a8d4',
      wx:68, wy:57, size:'sm', isMe:false, ring:2 },
    { id:'u5', name:'DRIFT_X',    avatarEmoji:'🧑‍🚀', ringColor:'#f59e0b',
      activityEmoji:'🎯', nameStyle:'text', nameColor:'#fcd34d',
      wx:47, wy:68, size:'sm', isMe:false, ring:2 },
    // ── Ring 3 (far — only visible when zoomed out) ──
    { id:'u6', name:'NIGHT_OWL',  avatarEmoji:'🦉',   ringColor:'#8b5cf6',
      activityEmoji:'🌙', nameStyle:'text', nameColor:'#c4b5fd',
      wx:19, wy:37, size:'sm', isMe:false, ring:3 },
    { id:'u7', name:'PIXEL_WAVE', avatarEmoji:'🎧',   ringColor:'#22d3ee',
      activityEmoji:'🎶', nameStyle:'text', nameColor:'#67e8f9',
      wx:73, wy:28, size:'sm', isMe:false, ring:3 },
    { id:'u8', name:'GHOST_RUN',  avatarEmoji:'👻',   ringColor:'#a3e635',
      activityEmoji:'💨', nameStyle:'text', nameColor:'#bef264',
      wx:42, wy:76, size:'sm', isMe:false, ring:3 },
  ]);

  private countTimer?: ReturnType<typeof setInterval>;

  constructor(
    private zoneService: ZoneService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const zoneId = this.route.snapshot.params['id'];
    const found  = this.zoneService.mockZones.find(z => z.id === zoneId);
    this.zone.set(found || this.zoneService.mockZones[0]);
    this.countTimer = setInterval(() =>
      this.playerCount.set(38 + Math.floor(Math.random() * 10)), 7000);
  }

  ngOnDestroy() { if (this.countTimer) clearInterval(this.countTimer); }

  adjustZoom(delta: number) {
    const next = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, this.zoomLevel() + delta));
    this.zoomLevel.set(Math.round(next * 100) / 100);
  }

  openProfile(u: LoungeUser) {
    if (!u.isMe) this.peekedUser.set(u);
  }

  setAction(tab: ActionTab) {
    this.activeAction.set(tab);
    const zoneId = this.route.snapshot.params['id'] || 'zone_001';
    if (tab === 'games') this.router.navigate(['/app/games'],  { queryParams: { fromZone: zoneId } });
    if (tab === 'vibe')  this.router.navigate(['/app/vibes'],  { queryParams: { fromZone: zoneId } });
    // 'confess' and 'lounge' — handled in-place, no navigation
  }

  leaveZone() {
    this.zoneService.leaveZone();
    this.router.navigate(['/app/map']);
  }

  releaseConfession() {
    if (!this.confessText.trim()) return;
    this.confessionFeed.update(f => [{
      id: 'c' + Date.now(), avatarEmoji: '🎭', timeAgo: 'just now',
      mood: this.selectedMood(), text: this.confessText, revealed: false
    }, ...f]);
    this.confessText = '';
  }

  revealPost(post: ConfessionPost) {
    this.confessionFeed.update(f => f.map(p => p.id === post.id ? {...p, revealed:true} : p));
  }
}
