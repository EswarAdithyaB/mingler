import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../core/services/zone.service';
import { ZoneSessionService } from '../../core/services/zone-session.service';
import { Zone } from '../../core/models';
import { ZoneMockService } from '../../core/services/mock';

type ActionTab = 'lounge' | 'games' | 'vibe' | 'confess';

interface LoungeUser {
  id: string;
  name: string;
  avatarEmoji: string;
  gender: 'f' | 'm';
  ringColor: string;
  activityEmoji: string;
  nameStyle: 'pill' | 'text';
  nameColor: string;
  wx: number;
  wy: number;
  size: 'lg' | 'md' | 'sm';
  isMe: boolean;
  ring: 1 | 2 | 3;
}

interface ConfessionPost {
  id: string; avatarEmoji: string; timeAgo: string;
  text: string; revealed: boolean; mood: string;
}

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss']
})
export class ZoneComponent implements OnInit, OnDestroy {
  readonly MIN_ZOOM = 0.35;
  readonly MAX_ZOOM = 1.05;

  zone         = signal<Zone | null>(null);
  peekedUser   = signal<LoungeUser | null>(null);
  activeAction = signal<ActionTab>('lounge');
  playerCount  = signal(42);
  zoomLevel    = signal(0.65);

  zoomPercent = computed(() => {
    const range = this.MAX_ZOOM - this.MIN_ZOOM;
    return Math.round(((this.zoomLevel() - this.MIN_ZOOM) / range) * 100);
  });

  /* ── Pan state ─────────────────────────────────────── */
  panX = signal(0);
  panY = signal(0);
  private mapPanning = false;
  private mapPanStartX = 0;
  private mapPanStartY = 0;
  private mapPanOriginX = 0;
  private mapPanOriginY = 0;

  private viewportEl: HTMLElement | null = null;

  private get maxPan(): { x: number; y: number } {
    const el = this.viewportEl ?? document.querySelector('.lounge-viewport') as HTMLElement;
    if (el) this.viewportEl = el;
    const vw = el ? el.clientWidth  : window.innerWidth;
    const vh = el ? el.clientHeight : window.innerHeight;
    const z  = this.zoomLevel();
    const mx = Math.max(0, (1.5 * z - 0.5) * vw);
    const my = Math.max(0, (1.5 * z - 0.5) * vh);
    return { x: mx, y: my };
  }

  private clampPan(x: number, y: number): { x: number; y: number } {
    const { x: mx, y: my } = this.maxPan;
    return {
      x: Math.max(-mx, Math.min(mx, x)),
      y: Math.max(-my, Math.min(my, y)),
    };
  }

  worldTransform = computed(() => {
    const scale = this.zoomLevel();
    const tx = this.panX();
    const ty = this.panY();
    return `scale(${scale}) translate(${tx / scale}px, ${ty / scale}px)`;
  });

  /* ── Pinch-to-zoom state ───────────────────────────── */
  private pinching = false;
  private pinchStartDist = 0;
  private pinchStartZoom = 0;

  private getTouchDist(e: TouchEvent): number {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  onMapTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      this.pinching = true;
      this.mapPanning = false;
      this.pinchStartDist = this.getTouchDist(e);
      this.pinchStartZoom = this.zoomLevel();
      return;
    }
    if ((e.target as HTMLElement).closest('.avatar-node')) return;
    if (e.touches.length !== 1) return;
    this.pinching = false;
    this.mapPanning = true;
    this.mapPanStartX = e.touches[0].clientX;
    this.mapPanStartY = e.touches[0].clientY;
    this.mapPanOriginX = this.panX();
    this.mapPanOriginY = this.panY();
  }

  onMapTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && this.pinching) {
      e.preventDefault();
      const dist = this.getTouchDist(e);
      const ratio = dist / this.pinchStartDist;
      const next = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM,
        Math.round(this.pinchStartZoom * ratio * 100) / 100));
      this.zoomLevel.set(next);
      const clamped = this.clampPan(this.panX(), this.panY());
      this.panX.set(clamped.x);
      this.panY.set(clamped.y);
      return;
    }
    if (!this.mapPanning || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - this.mapPanStartX;
    const dy = e.touches[0].clientY - this.mapPanStartY;
    const clamped = this.clampPan(this.mapPanOriginX + dx, this.mapPanOriginY + dy);
    this.panX.set(clamped.x);
    this.panY.set(clamped.y);
  }

  onMapTouchEnd(e: TouchEvent) {
    if (e.touches.length < 2) this.pinching = false;
    if (e.touches.length === 0) this.mapPanning = false;
  }

  recenterMap() {
    this.panX.set(0);
    this.panY.set(0);
  }

  /* ── Layer picker ──────────────────────────────────── */
  showLayerPicker = signal(false);

  bgOptions = signal<any[]>([]);
  selectedBg = signal<any>(null);

  selectBg(bg: any) {
    this.selectedBg.set(bg);
    this.showLayerPicker.set(false);
  }

  /* ── Event alert swipe state ─────────────────────────── */
  showEventAlert = signal(true);
  eventSwipeX    = signal(0);
  eventCardOpacity = computed(() => {
    const x = this.eventSwipeX();
    if (x >= 0) return 1;
    return Math.max(0, 1 + x / 120);
  });

  private swipeTouchStartX = 0;
  private swipeTouchCurrentX = 0;

  /* ── Profile sheet swipe-down-to-close ──────────────── */
  sheetDragY    = signal(0);
  sheetDragging = false;
  private sheetTouchStartY = 0;

  onSheetTouchStart(e: TouchEvent) {
    this.sheetTouchStartY = e.touches[0].clientY;
    this.sheetDragging = true;
  }

  onSheetTouchMove(e: TouchEvent) {
    const delta = e.touches[0].clientY - this.sheetTouchStartY;
    if (delta > 0) {
      e.stopPropagation();
      this.sheetDragY.set(delta);
    }
  }

  onSheetTouchEnd(_e: TouchEvent) {
    this.sheetDragging = false;
    if (this.sheetDragY() > 80) {
      this.peekedUser.set(null);
    }
    this.sheetDragY.set(0);
  }

  onEventTouchStart(e: TouchEvent) {
    this.swipeTouchStartX = e.touches[0].clientX;
  }

  onEventTouchMove(e: TouchEvent) {
    const delta = e.touches[0].clientX - this.swipeTouchStartX;
    if (delta < 0) this.eventSwipeX.set(delta);
  }

  onEventTouchEnd(_e: TouchEvent) {
    if (this.eventSwipeX() < -80) {
      this.showEventAlert.set(false);
      this.eventSwipeX.set(0);
    } else {
      this.eventSwipeX.set(0);
    }
  }

  /* ── Event timer ─────────────────────────────────────── */
  eventTimer = '04:22';
  private timerInterval?: ReturnType<typeof setInterval>;
  private timerSeconds = 4 * 60 + 22;

  /* ── Vibe from route ─────────────────────────────────── */
  currentVibe = 'CHILL';
  currentVibeEmoji = '😌';
  private vibeEmojiMap: Record<string, string> = this.zoneMockService.getVibeEmojiMap();

  /* ── Confess state ─────────────────────────────────────── */
  confessText  = '';
  confessAnon  = signal(true);
  selectedMood = signal('heartbroken');
  moods = this.zoneMockService.getMoods();
  confessionFeed = signal<ConfessionPost[]>([]);

  /* ── Lounge users ──────────────────────────────────────── */
  loungeUsers = signal<LoungeUser[]>([]);

  private countTimer?: ReturnType<typeof setInterval>;

  showLeaveConfirm = signal(false);

  constructor(
    private zoneService: ZoneService,
    private zoneSession: ZoneSessionService,
    private router: Router,
    private route: ActivatedRoute,
    private zoneMockService: ZoneMockService
  ) {}

  ngOnInit() {
    this.viewportEl = document.querySelector('.lounge-viewport') as HTMLElement;
    const zoneId = this.route.snapshot.params['id'] || 'zone_001';

    // Load all zone data from service
    this.zoneMockService.getZoneById(zoneId).subscribe(zone => {
      this.zone.set(zone);
    });

    this.zoneMockService.getLoungeUsers().subscribe(users => {
      this.loungeUsers.set(users);
    });

    this.zoneMockService.getConfessions().subscribe(confessions => {
      this.confessionFeed.set(confessions);
    });

    this.zoneMockService.getBackgroundOptions().subscribe(options => {
      this.bgOptions.set(options);
      if (options.length > 0) {
        this.selectedBg.set(options[0]);
      }
    });

    const vibe = this.route.snapshot.queryParamMap.get('vibe');
    if (vibe) {
      this.currentVibe = vibe.toUpperCase().replace('-', ' ');
      this.currentVibeEmoji = this.vibeEmojiMap[vibe] || '✨';
    }

    this.countTimer = setInterval(() =>
      this.playerCount.set(38 + Math.floor(Math.random() * 10)), 7000);

    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        const m = Math.floor(this.timerSeconds / 60);
        const s = this.timerSeconds % 60;
        this.eventTimer = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countTimer) clearInterval(this.countTimer);
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  adjustZoom(delta: number) {
    const next = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, this.zoomLevel() + delta));
    this.zoomLevel.set(Math.round(next * 100) / 100);
    const clamped = this.clampPan(this.panX(), this.panY());
    this.panX.set(clamped.x);
    this.panY.set(clamped.y);
  }

  openProfile(u: LoungeUser) {
    if (!u.isMe) this.peekedUser.set(u);
  }

  setAction(tab: ActionTab) {
    this.activeAction.set(tab);
    const zoneId = this.route.snapshot.params['id'] || 'zone_001';
    if (tab === 'games') this.router.navigate(['/app/games'],  { queryParams: { fromZone: zoneId } });
    if (tab === 'vibe')  this.router.navigate(['/app/vibes'],  { queryParams: { fromZone: zoneId } });
  }

  leaveZone() {
    this.showLeaveConfirm.set(true);
  }

  confirmLeaveZone() {
    this.showLeaveConfirm.set(false);
    this.zoneService.leaveZone();
    this.zoneSession.leaveZone();
    this.router.navigate(['/app/map']);
  }

  releaseConfession() {
    if (!this.confessText.trim()) return;
    const newConfession: ConfessionPost = {
      id: 'c' + Date.now(),
      avatarEmoji: '🎭',
      timeAgo: 'just now',
      mood: this.selectedMood(),
      text: this.confessText,
      revealed: false
    };

    this.zoneMockService.addConfession(newConfession).subscribe(confession => {
      this.confessionFeed.update(f => [confession, ...f]);
      this.confessText = '';
    });
  }

  revealPost(post: ConfessionPost) {
    this.confessionFeed.update(f => f.map(p => p.id === post.id ? {...p, revealed:true} : p));
  }
}
