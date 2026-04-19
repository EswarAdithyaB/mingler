import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Vibe {
  id: string;
  emoji: string;
  label: string;
}

const VIBES: Vibe[] = [
  { id: 'hyped',        emoji: '🔥', label: 'Hyped'         },
  { id: 'chill',        emoji: '😌', label: 'Chill'         },
  { id: 'lonely',       emoji: '💜', label: 'Lonely'        },
  { id: 'lets-play',    emoji: '🎮', label: "Let's Play"    },
  { id: 'need-to-talk', emoji: '🗣️', label: 'Need to Talk'  },
  { id: 'just-vibing',  emoji: '👻', label: 'Just Vibing'   },
];

@Component({
  selector: 'app-vibe-check',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top nav bar -->
    <div class="top-bar">
      <button class="back-btn" (click)="goBack()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span class="top-bar-title">Set Your Vibe</span>
      <div class="top-bar-spacer"></div>
    </div>

    <!-- Alert banner -->
    @if (showAlert()) {
      <div class="alert-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#FBBF24" stroke-width="2"/>
          <path d="M12 8v4M12 16h.01" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Please select a vibe before continuing!</span>
      </div>
    }

    <!-- Scrollable content -->
    <div class="screen">

      <!-- Background glows -->
      <div class="bg-glow bg-glow-top"></div>
      <div class="bg-glow bg-glow-bottom"></div>

      <!-- Header -->
      <div class="header">
        <span class="status-pill">CURRENT STATUS</span>
        <h1 class="heading">How are you<br><span class="heading-accent">feeling?</span></h1>
        <p class="sub">Update your vibe to let your squad know<br>what's up in the digital nocturne.</p>
      </div>

      <!-- Vibe grid -->
      <div class="vibe-grid">
        @for (vibe of vibes; track vibe.id) {
          <button
            class="vibe-card"
            [class.selected]="selected() === vibe.id"
            (click)="select(vibe.id)">
            @if (selected() === vibe.id) {
              <span class="check-badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="#7B61FF"/>
                  <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            }
            <span class="vibe-emoji">{{ vibe.emoji }}</span>
            <span class="vibe-label" [class.active-label]="selected() === vibe.id">{{ vibe.label }}</span>
          </button>
        }
      </div>

      <!-- Map preview – fixed height with zone pill overlay -->
      <div class="map-preview">
        <div class="map-grid"></div>
        <div class="map-overlay"></div>
        <div class="zone-pill">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" fill="#22C55E"/>
            <circle cx="5" cy="5" r="2" fill="white"/>
          </svg>
          <span>{{ zoneName }}</span>
        </div>
      </div>

      <!-- CTA – below map, inside scroll -->
      <button class="cta-btn" (click)="proceed()">
        Set My Vibe &nbsp;
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:inline;vertical-align:middle">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white"/>
        </svg>
      </button>

    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      min-height: 0;
      overflow: hidden;
      background: #0A0A14;
      position: relative;
    }

    /* ── Top bar ─────────────────────────────── */
    .top-bar {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px;
      background: #0A0A14;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      z-index: 10;
    }

    .back-btn {
      width: 36px; height: 36px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 9999px;
      color: #A78BFA;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
      &:active { background: rgba(123,97,255,0.15); }
    }

    .top-bar-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.2px;
    }

    .top-bar-spacer { width: 36px; }

    /* ── Alert banner ────────────────────────── */
    .alert-banner {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(251,191,36,0.12);
      border-bottom: 1px solid rgba(251,191,36,0.25);
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 500;
      color: #FBBF24;
      animation: slide-down 0.2s ease;
      z-index: 9;
    }

    @keyframes slide-down {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Scrollable screen ───────────────────── */
    .screen {
      flex: 1 1 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px 20px 120px;
      position: relative;
      gap: 18px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    /* ── Background glows ────────────────────── */
    .bg-glow {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
    }
    .bg-glow-top {
      width: 320px; height: 320px;
      top: -120px; left: 50%;
      transform: translateX(-50%);
      background: radial-gradient(circle, rgba(123,97,255,0.25) 0%, transparent 70%);
      filter: blur(40px);
    }
    .bg-glow-bottom {
      width: 260px; height: 260px;
      bottom: 80px; left: -60px;
      background: radial-gradient(circle, rgba(197,126,255,0.15) 0%, transparent 70%);
      filter: blur(50px);
    }

    /* ── Header ──────────────────────────────── */
    .header {
      width: 100%;
      text-align: center;
      position: relative; z-index: 1;
    }

    .status-pill {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #7B61FF;
      display: block;
      margin-bottom: 10px;
    }

    .heading {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.15;
      margin: 0 0 12px;
    }

    .heading-accent { color: #7B61FF; }

    .sub {
      font-size: 13px;
      color: rgba(200,190,230,0.6);
      line-height: 1.6;
      margin: 0;
    }

    /* ── Vibe grid ───────────────────────────── */
    .vibe-grid {
      width: 100%;
      display: grid;
      grid-template-columns: 163px 163px;
      justify-content: center;
      gap: 12px;
      position: relative; z-index: 1;
    }

    .vibe-card {
      position: relative;
      background: #13132A;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 48px;
      width: 163px;
      height: 136px;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;

      &:active { transform: scale(0.97); }

      &.selected {
        border-color: rgba(123,97,255,0.5);
        background: #16163A;
        box-shadow: 0 0 0 1px rgba(123,97,255,0.3), 0 0 24px rgba(123,97,255,0.2);
      }
    }

    .check-badge {
      position: absolute;
      top: 10px; right: 10px;
    }

    .vibe-emoji {
      font-size: 48px;
      line-height: 1;
    }

    .vibe-label {
      font-size: 16px;
      font-weight: 700;
      color: rgba(255,255,255,0.55);
      transition: color 0.2s;

      &.active-label { color: #7B61FF; }
    }

    /* ── Zone pill ───────────────────────────── */
    .zone-pill {
      position: absolute;
      bottom: 50%;
      left: 50%;
      transform: translate(-50%, 50%);
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(10, 10, 20, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.85);
      z-index: 2;
      white-space: nowrap;
    }

    /* ── Map preview – fixed height ─────────── */
    .map-preview {
      width: 100%;
      height: 120px;
      flex-shrink: 0;
      border-radius: 20px;
      background: #0D0D1F;
      border: 1px solid rgba(255,255,255,0.06);
      position: relative;
      overflow: hidden;
      z-index: 1;
    }

    .map-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(123,97,255,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(123,97,255,0.08) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .map-overlay {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 50% 50%, rgba(123,97,255,0.12) 0%, transparent 70%);
    }

    /* ── CTA ─────────────────────────────────── */
    .cta-btn {
      width: 100%;
      position: relative; z-index: 1;
      width: 100%;
      padding: 18px 24px;
      border-radius: 9999px;
      border: none;
      background: linear-gradient(to right, #AFA2FF, #7B61FF);
      color: #ffffff;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 24px rgba(123,97,255,0.4);

      &:active { transform: scale(0.97); }
      &:hover  { box-shadow: 0 6px 32px rgba(123,97,255,0.6); }
    }
  `]
})
export class VibeCheckComponent {
  vibes = VIBES;
  selected = signal<string | null>(null);
  showAlert = signal(false);
  zoneName = 'SHIBUYA DISTRICT';

  private alertTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    const name = this.route.snapshot.queryParamMap.get('name');
    if (name) this.zoneName = decodeURIComponent(name).toUpperCase();
  }

  goBack() { this.router.navigate(['/app/map']); }

  select(id: string) {
    this.selected.set(id);
    this.showAlert.set(false);
  }

  proceed() {
    if (!this.selected()) {
      this.showAlert.set(true);
      if (this.alertTimer) clearTimeout(this.alertTimer);
      this.alertTimer = setTimeout(() => this.showAlert.set(false), 3000);
      return;
    }
    const zoneId = this.route.snapshot.paramMap.get('id') || 'zone_001';
    const name   = this.route.snapshot.queryParamMap.get('name') || '';
    this.router.navigate(['/app/zone-entry', zoneId], {
      queryParams: { name, vibe: this.selected() }
    });
  }
}
