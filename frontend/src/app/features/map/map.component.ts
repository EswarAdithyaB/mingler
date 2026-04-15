import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ZoneService } from '../../core/services/zone.service';
import { Zone } from '../../core/models';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="screen gradient-bg">

      <!-- ── Header ─────────────────────────────────── -->
      <div class="screen-header">
        <div class="header-left">
          <h3>ZoneApp</h3>
          <span class="location-tag">📍 {{ locationName() }}</span>
        </div>
        <div class="header-right">
          <button class="header-icon-btn" (click)="refreshZones()">🔄</button>
          <button class="header-icon-btn">🔔</button>
        </div>
      </div>

      <!-- ── Map Canvas (fills all remaining vertical space) ── -->
      <div class="map-area">

        <!-- Loading / Radar scan -->
        @if (loading()) {
          <div class="map-loading">
            <div class="radar-ring ring-1"></div>
            <div class="radar-ring ring-2"></div>
            <div class="radar-ring ring-3"></div>
            <div class="radar-dot"></div>
            <p class="scan-label">Scanning for zones...</p>
          </div>
        } @else {
          <!-- Map grid background + markers -->
          <div class="map-bg">
            @for (zone of zones(); track zone.id; let i = $index) {
              <div class="map-zone-marker"
                [style.left]="getMarkerLeft(i)"
                [style.top]="getMarkerTop(i)"
                (click)="selectZone(zone)">
                <div class="marker-ring" [class.active]="selectedZone()?.id === zone.id"></div>
                <div class="marker-dot">{{ zone.coverEmoji }}</div>
                <div class="marker-label">{{ zone.name }}</div>
              </div>
            }
            <div class="user-marker">
              <div class="user-pulse"></div>
              <div class="user-dot">🧍</div>
            </div>
          </div>
        }

        <!-- No Zones overlay -->
        @if (!loading() && zones().length === 0) {
          <div class="empty-overlay">
            <div class="empty-icon">📡</div>
            <h3>No Zones Near You</h3>
            <p>Be the first to discover or create a zone in your area</p>
            <button class="btn btn-secondary btn-sm">Explore Further</button>
            <div style="height:10px"></div>
            <button class="btn btn-primary btn-sm" (click)="createZone()">+ Create a Zone</button>
          </div>
        }

        <!-- ── Bottom Sheet (absolutely overlays map) ──────── -->
        @if (!loading() && zones().length > 0) {
          <div class="zone-sheet" [class.expanded]="panelExpanded()">

            <!-- Drag handle — tap to toggle -->
            <div class="sheet-handle-row" (click)="togglePanel()">
              <div class="panel-handle"></div>
            </div>

            <!-- Sheet header always visible when collapsed -->
            <div class="panel-header" (click)="togglePanel()">
              <div class="panel-title-row">
                <h4>Zones nearby</h4>
                <span class="badge badge-purple">{{ zones().length }} active</span>
              </div>
              <span class="panel-chevron" [class.up]="panelExpanded()">›</span>
            </div>

            <!-- Scrollable list — only accessible when expanded -->
            <div class="zone-list-scroll">
              <div class="zone-list">
                @for (zone of zones(); track zone.id) {
                  <div class="zone-card"
                    [class.selected]="selectedZone()?.id === zone.id"
                    (click)="selectZone(zone)">
                    <div class="zone-card-emoji">{{ zone.coverEmoji }}</div>
                    <div class="zone-card-info">
                      <div class="zone-card-name">{{ zone.name }}</div>
                      <div class="zone-card-meta">
                        <span>👥 {{ zone.activeUsers }} vibing</span>
                        <span>📍 ~{{ getDistance(zone) }}m</span>
                      </div>
                    </div>
                    <button class="btn btn-primary btn-sm"
                      (click)="enterZone(zone, $event)">Enter →</button>
                  </div>
                }
                <!-- bottom padding clears the nav bar -->
                <div class="list-end-spacer"></div>
              </div>
            </div>

          </div>
        }

      </div><!-- /map-area -->
    </div>
  `,
  styles: [`
    /* ── Host & screen shell ─────────────────────────────── */
    :host {
      display: flex; flex-direction: column;
      flex: 1; min-height: 0; overflow: hidden;
    }
    .screen {
      display: flex; flex-direction: column;
      flex: 1; min-height: 0; overflow: hidden;
      position: relative;
    }

    /* ── Header ──────────────────────────────────────────── */
    .screen-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);
      background: rgba(8,8,15,0.9); backdrop-filter: blur(12px); z-index: 10;
      padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
    }
    .header-left h3 { font-size: 18px; font-weight: 700; }
    .location-tag { font-size: 11px; color: var(--text-secondary); margin-top: 2px; display: block; }
    .header-right { display: flex; gap: 8px; }

    /* ── Map area — fills ALL remaining vertical space ───── */
    .map-area {
      flex: 1; min-height: 0; position: relative; overflow: hidden;
    }

    /* ── Map background grid ─────────────────────────────── */
    .map-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.14) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(236,72,153,0.09) 0%, transparent 40%),
        repeating-linear-gradient(0deg,   transparent, transparent 39px,
          rgba(124,58,237,0.06) 39px, rgba(124,58,237,0.06) 40px),
        repeating-linear-gradient(90deg,  transparent, transparent 39px,
          rgba(124,58,237,0.06) 39px, rgba(124,58,237,0.06) 40px),
        var(--bg-primary);
    }

    /* ── Radar loading — fills map-area ─────────────────── */
    .map-loading {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .scan-label {
      position: absolute; bottom: 30%; color: var(--text-secondary); font-size: 14px;
    }

    .radar-ring {
      position: absolute; border-radius: 50%; border: 1.5px solid rgba(124,58,237,0.4);
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      animation: radar-pulse 2s ease-out infinite;
    }
    /* rings scale with the smaller of viewport width/height */
    .ring-1 { width: min(80px, 22vw);  height: min(80px, 22vw);  animation-delay: 0s;   }
    .ring-2 { width: min(140px, 38vw); height: min(140px, 38vw); animation-delay: 0.5s; }
    .ring-3 { width: min(200px, 54vw); height: min(200px, 54vw); animation-delay: 1s;   }

    .radar-dot {
      position: absolute; width: 16px; height: 16px; border-radius: 50%;
      background: var(--purple-primary); top: 50%; left: 50%; transform: translate(-50%,-50%);
      box-shadow: 0 0 20px var(--purple-glow);
    }
    @keyframes radar-pulse {
      0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 1; }
      100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
    }

    /* ── Zone markers ────────────────────────────────────── */
    .map-zone-marker {
      position: absolute; display: flex; flex-direction: column; align-items: center;
      cursor: pointer; transform: translate(-50%,-50%); z-index: 2;
    }
    .marker-ring {
      position: absolute; width: 50px; height: 50px; border-radius: 50%;
      border: 2px solid rgba(124,58,237,0.3); animation: pulse-glow 2s infinite;
      &.active { border-color: var(--purple-medium); animation: pulse-glow 1s infinite; }
    }
    .marker-dot {
      width: 36px; height: 36px; border-radius: 50%; background: var(--bg-card);
      border: 2px solid var(--purple-medium);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; z-index: 1; box-shadow: 0 0 14px var(--purple-glow);
    }
    .marker-label {
      font-size: 10px; color: var(--text-primary); background: rgba(8,8,15,0.8);
      padding: 2px 6px; border-radius: 4px; margin-top: 4px; white-space: nowrap;
    }

    /* ── User marker ─────────────────────────────────────── */
    .user-marker {
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%,-50%);
      display: flex; flex-direction: column; align-items: center; z-index: 2;
    }
    .user-pulse {
      position: absolute; width: 28px; height: 28px; border-radius: 50%;
      background: rgba(34,211,238,0.3); animation: pulse-glow 1.5s infinite;
    }
    .user-dot { font-size: 22px; z-index: 1; }

    /* ── Empty overlay ───────────────────────────────────── */
    .empty-overlay {
      position: absolute; inset: 0; z-index: 5;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 32px; text-align: center; gap: 8px;
      background: rgba(8,8,15,0.7); backdrop-filter: blur(4px);
    }
    .empty-overlay .empty-icon { font-size: 56px; margin-bottom: 12px; }
    .empty-overlay h3 { font-size: 20px; font-weight: 700; }
    .empty-overlay p  { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

    /* ── Bottom sheet ────────────────────────────────────── */
    /*
     * Absolutely positioned at the bottom of .map-area.
     * Collapsed → translateY(calc(100% - 80px)) — only handle+header peeks out.
     * Expanded  → translateY(0) — full sheet visible, capped at 56% of map height.
     */
    .zone-sheet {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 20;
      max-height: 56%;
      display: flex; flex-direction: column;
      background: var(--bg-secondary);
      border-radius: 22px 22px 0 0;
      border-top: 1px solid var(--border-medium);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.5);
      transform: translateY(calc(100% - 80px));
      transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
      &.expanded { transform: translateY(0); }
    }

    .sheet-handle-row {
      flex-shrink: 0; padding: 10px 0 2px; cursor: pointer;
    }
    .panel-handle {
      width: 36px; height: 4px; border-radius: 2px;
      background: var(--border-medium); margin: 0 auto;
    }

    .panel-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 20px 12px; cursor: pointer;
    }
    .panel-title-row {
      display: flex; align-items: center; gap: 10px;
      h4 { font-size: 15px; font-weight: 700; }
    }
    .panel-chevron {
      font-size: 22px; color: var(--text-secondary); line-height: 1;
      transform: rotate(90deg);
      transition: transform 0.3s ease;
      &.up { transform: rotate(270deg); }
    }

    /* Scrollable list inside the sheet */
    .zone-list-scroll {
      flex: 1; min-height: 0;
      overflow-y: auto; overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .zone-list {
      display: flex; flex-direction: column; gap: 10px; padding: 4px 16px 0;
    }
    .list-end-spacer {
      height: calc(var(--nav-height, 64px) + 12px);
      flex-shrink: 0;
    }

    .zone-card {
      display: flex; align-items: center; gap: 12px; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      padding: 14px; cursor: pointer; transition: all 0.2s;
      &.selected { border-color: var(--purple-medium); background: rgba(124,58,237,0.1); }
    }
    .zone-card-emoji { font-size: 28px; flex-shrink: 0; }
    .zone-card-info  { flex: 1; }
    .zone-card-name  { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .zone-card-meta  { display: flex; gap: 10px; font-size: 11px; color: var(--text-secondary); }
  `]
})
export class MapComponent implements OnInit {
  loading      = signal(true);
  zones        = signal<Zone[]>([]);
  selectedZone = signal<Zone | null>(null);
  locationName = signal('Detecting...');
  panelExpanded = signal(false);

  constructor(private zoneService: ZoneService, private router: Router) {}

  ngOnInit() {
    this.zoneService.loadNearbyZones();
    setTimeout(() => {
      this.loading.set(false);
      this.zones.set(this.zoneService.mockZones);
      this.locationName.set('Hyderabad, IN');
      // Briefly delay so the sheet entrance animation is visible
      setTimeout(() => this.panelExpanded.set(true), 300);
    }, 1200);
  }

  refreshZones() {
    this.loading.set(true);
    this.panelExpanded.set(false);
    setTimeout(() => {
      this.loading.set(false);
      this.zones.set(this.zoneService.mockZones);
      setTimeout(() => this.panelExpanded.set(true), 300);
    }, 1000);
  }

  togglePanel() { this.panelExpanded.update(v => !v); }

  selectZone(zone: Zone) {
    this.selectedZone.set(zone);
    this.panelExpanded.set(true);  // auto-expand when a marker is tapped
  }

  enterZone(zone: Zone, event: Event) {
    event.stopPropagation();
    this.zoneService.joinZone(zone);
    this.router.navigate(['/app/zone', zone.id]);
  }

  createZone() { /* open modal */ }

  getMarkerLeft(i: number): string {
    const positions = ['35%', '60%', '25%', '70%'];
    return positions[i % positions.length];
  }

  getMarkerTop(i: number): string {
    const positions = ['40%', '30%', '60%', '55%'];
    return positions[i % positions.length];
  }

  getDistance(zone: Zone): number {
    return Math.floor(Math.random() * 80 + 20);
  }
}
