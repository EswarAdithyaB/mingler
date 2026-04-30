import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Game, Player } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class GamesMockService {

  private mockGames: Game[] = [
    {
      id: 'g1',
      type: 'ludo',
      hostId: 'u2',
      hostName: 'CryptoFeliz',
      players: [
        { userId: 'u2', username: 'CryptoFeliz' },
        { userId: 'u3', username: 'Sol_Runner' }
      ],
      maxPlayers: 4,
      status: 'waiting',
      zoneId: 'zone_001',
      createdAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 'g2',
      type: 'truth-or-dare',
      hostId: 'u4',
      hostName: 'Mochi_Babe',
      players: [
        { userId: 'u4', username: 'Mochi_Babe' },
        { userId: 'u5', username: 'NightOwl' }
      ],
      maxPlayers: 6,
      status: 'playing',
      zoneId: 'zone_001',
      createdAt: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: 'g3',
      type: 'quiz',
      hostId: 'u6',
      hostName: 'BrainMaster',
      players: [
        { userId: 'u6', username: 'BrainMaster' },
        { userId: 'u7', username: 'QuizKing' },
        { userId: 'u8', username: 'Smartie' }
      ],
      maxPlayers: 8,
      status: 'waiting',
      zoneId: 'zone_001',
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'g4',
      type: 'word-chain',
      hostId: 'u9',
      hostName: 'WordNerd',
      players: [
        { userId: 'u9', username: 'WordNerd' }
      ],
      maxPlayers: 6,
      status: 'waiting',
      zoneId: 'zone_001',
      createdAt: new Date(Date.now() - 5 * 60 * 1000)
    }
  ];

  getGameTypes() {
    return [
      { key: 'all', icon: '🎮', name: 'All', maxPlayers: 0 },
      { key: 'ludo', icon: '🎲', name: 'Ludo', maxPlayers: 4 },
      { key: 'truth-or-dare', icon: '🎭', name: 'Truth/Dare', maxPlayers: 6 },
      { key: 'quiz', icon: '🧠', name: 'Quiz', maxPlayers: 8 },
      { key: 'word-chain', icon: '🔤', name: 'Word Chain', maxPlayers: 6 }
    ];
  }

  getActiveGames(): Observable<Game[]> {
    return of([...this.mockGames]);
  }

  getGamesByType(type: string): Observable<Game[]> {
    if (type === 'all') {
      return of([...this.mockGames]);
    }
    return of(this.mockGames.filter(g => g.type === type));
  }

  createGame(game: Game): Observable<Game> {
    return of(game);
  }

  joinGame(gameId: string, player: Player): Observable<Game> {
    const game = this.mockGames.find(g => g.id === gameId);
    if (game) {
      game.players.push(player);
    }
    return of(game!);
  }
}
