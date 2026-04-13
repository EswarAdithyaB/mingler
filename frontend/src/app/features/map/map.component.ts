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
      <!-- Header -->
      <div class="screen-header">
        <div class="header-left">
          <h3>ZoneApp</h3>
          <span class="location-tag">
            📍 {{ locationName() }}
          </span>
        </div>
        <div class="header-right">
          <button class="header-icon-btn" (click)="refreshZones()">🔄</button>
          <button class="header-icon-btn">🔔</button>
        </div>
      </div>

      <!-- Map Area -->
      <div class="map-area">
        @if (loading()) {
          <div class="map-loading">
            <div class="radar-ring ring-1"></div>
            <div class="radar-ring ring-2"></div>
            <div class="radar-ring ring-3"></div>
            <div class="radar-dot"></div>
            <p>Scanning for zones...</p>
          </div>
        } @else {
          <!-- Fake map background -->
          <div class="map-bg">
            <!-- Zone dots on map -->
            @for (zone of zones(); track zone.id; let i = $index) {
              <div class="map-zone-marker" [style.left]="getMarkerLeft(i)" [style.top]="getMarkerTop(i)"
                (click)="selectZone(zone)">
                <div class="marker-ring" [class.active]="selectedZone()?.id === zone.id"></div>
                <div class="marker-dot">{{ zone.coverEmoji }}</div>
                <div class="marker-label">{{ zone.name }}</div>
              </div>
            }
            <!-- User position -->
            <div class="user-marker">
              <div class="user-pulse"></div>
              <div class="user-dot">🧍</div>
            </div>
          </div>
        }
      </div>

      <!-- No Zones State -->
      @if (!loading() && zones().length === 0) {
        <div class="empty-state" style="position:absolute;inset:0;z-index:5;justify-content:center;">
          <div class="empty-icon">📡</div>
          <h3>No Zones Near You</h3>
          <p>Be the first to discover or create a zone in your area</p>
          <button class="btn btn-secondary btn-sm">Explore Further</button>
          <div style="height:12px"></div>
          <button class="btn btn-primary btn-sm" (click)="createZone()">+ Create a Zone</button>
        </div>
      }

      <!-- Zone List Panel -->
      @if (!loading() && zones().length > 0) {
        <div class="zone-list-panel">
          <div class="panel-handle"></div>
          <div class="panel-header">
            <h4>Zones nearby</h4>
            <span class="badge badge-purple">{{ zones().length }} active</span>
          </div>
          <div class="zone-list">
            @for (zone of zones(); track zone.id) {
              <div class="zone-card" [class.selected]="selectedZone()?.id === zone.id"
                (click)="selectZone(zone)">
                <div class="zone-card-emoji">{{ zone.coverEmoji }}</div>
                <div class="zone-card-info">
                  <div class="zone-card-name">{{ zone.name }}</div>
                  <div class="zone-card-meta">
                    <span>👥 {{ zone.activeUsers }} vibing</span>
                    <span>📍 ~{{ getDistance(zone) }}m</span>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" (click)="enterZone(zone, $event)">
                  Enter →
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .screen { position: relative; }

    .screen-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);
      background: rgba(8,8,15,0.9); backdrop-filter: blur(12px); flex-shrink: 0; z-index: 10;
      padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
    }
    .header-left h3 { font-size: 18px; font-weight: 700; }
    .location-tag { font-size: 11px; color: var(--text-secondary); margin-top: 2px; display: block; }
    .header-right { display: flex; gap: 8px; }

    .map-area {
      flex: 1; position: relative; overflow: hidden; min-height: 300px;
    }

    .map-bg {
      width: 100%; height: 100%;
      background:
        radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(236,72,153,0.08) 0%, transparent 40%),
        repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(124,58,237,0.06) 39px, rgba(124,58,237,0.06) 40px),
        repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(124,58,237,0.06) 39px, rgba(124,58,237,0.06) 40px),
        var(--bg-primary);
      position: relative;
      min-height: 320px;
    }

    .map-loading {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 320px; gap: 20px; position: relative;
      p { color: var(--text-secondary); font-size: 14px; margin-top: 60px; }
    }

    .radar-ring {
      position: absolute; border-radius: 50%; border: 1.5px solid rgba(124,58,237,0.4);
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      animation: radar-pulse 2s ease-out infinite;
    }
    .ring-1 { width: 80px; height: 80px; animation-delay: 0s; }
    .ring-2 { width: 140px; height: 140px; animation-delay: 0.5s; }
    .ring-3 { width: 200px; height: 200px; animation-delay: 1s; }
    .radar-dot {
      position: absolute; width: 16px; height: 16px; border-radius: 50%;
      background: var(--purple-primary); top: 50%; left: 50%; transform: translate(-50%,-50%);
      box-shadow: 0 0 20px var(--purple-glow);
    }
    @keyframes radar-pulse {
      0% { transform: translate(-50%,-50%) scale(0.3); opacity: 1; }
      100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
    }

    .map-zone-marker {
      position: absolute; display: flex; flex-direction: column; align-items: center; cursor: pointer;
      transform: translate(-50%, -50%);
    }
    .marker-ring {
      position: absolute; width: 50px; height: 50px; border-radius: 50%;
      border: 2px solid rgba(124,58,237,0.3); animation: pulse-glow 2s infinite;
      &.active { border-color: var(--purple-medium); animation: pulse-glow 1s infinite; }
    }
    .marker-dot {
      width: 36px; height: 36px; border-radius: 50%; background: var(--bg-card);
      border: 2px solid var(--purple-medium); display: flex; align-items: center; justify-content: center;
      font-size: 18px; z-index: 1; box-shadow: 0 0 14px var(--purple-glow);
    }
    .marker-label {
      font-size: 10px; color: var(--text-primary); background: rgba(8,8,15,0.8);
      padding: 2px 6px; border-radius: 4px; margin-top: 4px; white-space: nowrap;
    }

    .user-marker {
      position: absolute; left: 50%; top: 55%; transform: translate(-50%,-50%);
      display: flex; flex-direction: column; align-items: center;
    }
    .user-pulse {
      position: absolute; width: 28px; height: 28px; border-radius: 50%;
      background: rgba(34, 211, 238, 0.3); animation: pulse-glow 1.5s infinite;
    }
    .user-dot { font-size: 22px; z-index: 1; }

    .zone-list-panel {
      background: var(--bg-secondary); border-top: 1px solid var(--border-medium);
      border-radius: 24px 24px 0 0; padding: 12px 0 calc(var(--nav-height) + 10px);
      max-height: 55%; overflow-y: auto; -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .panel-handle {
      width: 36px; height: 4px; border-radius: 2px; background: var(--border-medium);
      margin: 0 auto 14px;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px 12px;
    }
    .panel-header h4 { font-size: 15px; font-weight: 700; }
    .zone-list { display: flex; flex-direction: column; gap: 10px; padding: 0 16px; }

    .zone-card {
      display: flex; align-items: center; gap: 12px; background: var(--bg-card);
      border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 14px;
      cursor: pointer; transition: all 0.2s;
      &.selected { border-color: var(--purple-medium); background: rgba(124,58,237,0.1); }
    }
    .zone-card-emoji { font-size: 28px; flex-shrink: 0; }
    .zone-card-info { flex: 1; }
    .zone-card-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .zone-card-meta { display: flex; gap: 10px; font-size: 11px; color: var(--text-secondary); }
  `]
})
export class MapComponent implements OnInit {
  loading = signal(true);
  zones = signal<Zone[]>([]);
  selectedZone = signal<Zone | null>(null);
  locationName = signal('Detecting...');

  constructor(private zoneService: ZoneService, private router: Router) {}

  ngOnInit() {
    this.zoneService.loadNearbyZones();
    setTimeout(() => {
      this.loading.set(false);
      this.zones.set(this.zoneService.mockZones);
      this.locationName.set('Hyderabad, IN');
    }, 1200);
  }

  refreshZones() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.zones.set(this.zoneService.mockZones);
    }, 1000);
  }

  selectZone(zone: Zone) { this.selectedZone.set(zone); }

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
