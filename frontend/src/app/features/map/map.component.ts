import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ZoneService } from '../../core/services/zone.service';
import { ZoneSessionService } from '../../core/services/zone-session.service';
import { Zone } from '../../core/models';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnDestroy {
  private paramSub?: Subscription;
  loading       = signal(true);
  zones         = signal<Zone[]>([]);
  selectedZone  = signal<Zone | null>(null);
  locationName  = signal('Detecting...');
  panelExpanded = signal(false);
  warningBanner = signal<string | null>(null);

  hasActiveSession = this.zoneSession.isInZone;
  activeZoneName   = this.zoneSession.activeZoneName;

  constructor(
    private zoneService:  ZoneService,
    private zoneSession:  ZoneSessionService,
    private router:       Router,
    private route:        ActivatedRoute
  ) {}

  ngOnInit() {
    this.paramSub = this.route.queryParams.subscribe(params => {
      if (params['sessionExpired'] === '1') {
        this.warningBanner.set('Your zone session expired due to inactivity. Enter a zone to continue.');
        this.router.navigate([], { replaceUrl: true, queryParams: {} });
      } else if (params['noZone'] === '1') {
        this.warningBanner.set('You need to be inside a zone to access Games or Vibes. Tap ENTER ZONE first.');
        this.router.navigate([], { replaceUrl: true, queryParams: {} });
      }
    });

    this.zoneService.loadNearbyZones();
    setTimeout(() => {
      this.loading.set(false);
      this.zones.set(this.zoneService.mockZones);
      this.locationName.set('Hyderabad, IN');
      setTimeout(() => this.panelExpanded.set(true), 300);
    }, 1200);
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
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

  private touchStartY = 0;

  onTouchStart(e: TouchEvent) {
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent) {
    const delta = e.changedTouches[0].clientY - this.touchStartY;
    if (delta > 50) {
      this.panelExpanded.set(false);
    } else if (delta < -50) {
      this.panelExpanded.set(true);
    }
  }

  selectZone(zone: Zone) {
    this.selectedZone.set(zone);
    this.panelExpanded.set(true);
    setTimeout(() => {
      const card = document.getElementById('zone-card-' + zone.id);
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 400);
  }

  enterZone(zone: Zone, event: Event) {
    event.stopPropagation();
    this.zoneService.joinZone(zone);
    this.router.navigate(['/app/zone-entry', zone.id], {
      queryParams: { name: zone.name }
    });
  }

  resumeZone(): void {
    const id = this.zoneSession.activeZoneId();
    if (id) this.router.navigate(['/app/zone', id]);
  }

  dismissWarning(): void {
    this.warningBanner.set(null);
  }

  goNotifications() { this.router.navigate(['/app/notifications']); }

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
    const hash = zone.id.charCodeAt(0) % 9;
    return hash + 1;
  }

  getZoneTags(zone: Zone): string[] {
    const tagMap: Record<string, string[]> = {
      zone_001: ['CYBER TAG', 'QUEST'],
      zone_002: ['LOUNGE', 'CHILL'],
      zone_003: ['BATTLE', 'ARENA'],
      zone_004: ['SOCIAL', 'MEET'],
    };
    return tagMap[zone.id] ?? ['VIBE', 'CONNECT'];
  }
}