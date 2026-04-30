import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Game } from '../../core/models';
import { ZoneSessionService } from '../../core/services/zone-session.service';
import { GamesMockService } from '../../core/services/mock';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  activeGameType = signal('all');
  showCreateModal = signal(false);
  fromZoneId = signal<string | null>(null);
  showInvite = signal(true);
  selectedGameType = signal('ludo');
  playerCount = signal(4);

  gameTypes = this.gamesMockService.getGameTypes();
  activeGames = signal<Game[]>([]);

  adjustPlayers(delta: number) {
    const cur = this.playerCount();
    this.playerCount.set(Math.max(2, Math.min(8, cur + delta)));
  }

  createGame() {
    const newGame: Game = {
      id: 'g' + Date.now(),
      type: this.selectedGameType() as any,
      hostId: 'me',
      hostName: 'Nova_Stream',
      players: [{ userId: 'me', username: 'Nova_Stream' }],
      maxPlayers: this.playerCount(),
      status: 'waiting',
      zoneId: 'zone_001',
      createdAt: new Date()
    };
    this.activeGames.update(games => [newGame, ...games]);
    this.showCreateModal.set(false);
  }

  joinGame(game: Game) {
    this.activeGames.update(games => games.map(g =>
      g.id === game.id
        ? { ...g, players: [...g.players, { userId: 'me', username: 'Nova_Stream' }] }
        : g
    ));
  }

  acceptInvite() { this.showInvite.set(false); }

  refreshZone() {
    console.log('Refreshing zone...');
  }

  getGameIcon(type: string): string {
    const icons: Record<string, string> = {
      'ludo': '🎲', 'truth-or-dare': '🎭', 'quiz': '🧠', 'word-chain': '🔤'
    };
    return icons[type] || '🎮';
  }

  getGameName(type: string): string {
    const names: Record<string, string> = {
      'ludo': 'Ludo', 'truth-or-dare': 'Truth or Dare', 'quiz': 'Zone Quiz', 'word-chain': 'Word Chain'
    };
    return names[type] || type;
  }

  hasUserJoined(game: Game): boolean {
    return game.players.some(p => p.userId === 'me');
  }

  zoneName = this.zoneSession.activeZoneName;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zoneSession: ZoneSessionService,
    private gamesMockService: GamesMockService
  ) {}

  onRefresh() { window.location.reload(); }

  ngOnInit() {
    const fromZone = this.route.snapshot.queryParamMap.get('fromZone')
      ?? this.zoneSession.activeZoneId();
    if (fromZone) {
      this.fromZoneId.set(fromZone);
    }

    // Load mock games data
    this.gamesMockService.getActiveGames().subscribe(games => {
      this.activeGames.set(games);
    });
  }

  goBackToZone() {
    this.router.navigate(['/app/zone', this.fromZoneId()]);
  }

  goNotifications() { this.router.navigate(['/app/notifications']); }
}
