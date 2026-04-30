import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ZoneSessionService } from '../../core/services/zone-session.service';
import {
  VibeFeedMockService,
  VibeChannel,
  MyActiveVibe,
  Squad,
  StreamMsg,
  TrendingZone
} from '../../core/services/mock';

@Component({
  selector: 'app-vibe-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vibe-feed.component.html',
  styleUrls: ['./vibe-feed.component.scss']
})
export class VibeFeedComponent implements OnInit {
  activeMain = signal<'all' | 'mine' | 'trending'>('all');
  fromZoneId = signal<string | null>(null);

  showCompose = signal(false);
  composeType = signal('vibe');
  composeText = '';
  composeAnon = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zoneSession: ZoneSessionService,
    private vibeFeedMockService: VibeFeedMockService
  ) {}

  ngOnInit() {
    const fromZone = this.route.snapshot.queryParamMap.get('fromZone')
      ?? this.zoneSession.activeZoneId();
    if (fromZone) this.fromZoneId.set(fromZone);

    // Load mock data from services
    this.vibeFeedMockService.getVibeChannels().subscribe(channels => {
      this.allVibes.set(channels);
    });

    this.vibeFeedMockService.getStreamMessages().subscribe(messages => {
      this.streamMessages.set(messages);
    });

    this.vibeFeedMockService.getMyActiveVibes().subscribe(vibes => {
      this.myActiveVibes.set(vibes);
    });

    this.vibeFeedMockService.getSquads().subscribe(squads => {
      this.mySquads.set(squads);
    });

    this.vibeFeedMockService.getTrendingZones().subscribe(zones => {
      this.trendingZones.set(zones);
    });
  }

  onRefresh() { window.location.reload(); }

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

  allVibes = signal<VibeChannel[]>([]);

  streamMessages = signal<StreamMsg[]>([]);

  myActiveVibes = signal<MyActiveVibe[]>([]);

  mySquads = signal<Squad[]>([]);

  trendingZones = signal<TrendingZone[]>([]);

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

  goBackToZone() {
    this.router.navigate(['/app/zone', this.fromZoneId()]);
  }

  goNotifications() { this.router.navigate(['/app/notifications']); }
}
