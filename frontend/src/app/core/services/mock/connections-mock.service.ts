import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Connection } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ConnectionsMockService {

  private mockConnections: Connection[] = [
    {
      id: 'c1',
      userId: 'u3',
      username: 'sol_runner',
      displayName: 'Sol Runner',
      avatar: '🧑‍🚀',
      vibe: 'Social',
      connectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      mutualZones: 3
    },
    {
      id: 'c2',
      userId: 'u4',
      username: 'mochi_babe',
      displayName: 'Mochi Babe',
      avatar: '👧',
      vibe: 'Creative',
      connectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mutualZones: 1
    }
  ];

  private mockNearbyPeople: Connection[] = [
    {
      id: 'n1',
      userId: 'u5',
      username: 'nightowl',
      displayName: 'NightOwl',
      avatar: '🧔',
      vibe: 'Gamer',
      connectedAt: new Date(),
      mutualZones: 0
    },
    {
      id: 'n2',
      userId: 'u6',
      username: 'cafe_wanderer',
      displayName: 'Café Wanderer',
      avatar: '☕',
      vibe: 'Chill',
      connectedAt: new Date(),
      mutualZones: 0
    },
    {
      id: 'n3',
      userId: 'u7',
      username: 'pixel_ghost',
      displayName: 'Pixel Ghost',
      avatar: '👻',
      vibe: 'Mysterious',
      connectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      mutualZones: 2
    }
  ];

  getConnections(): Observable<Connection[]> {
    return of([...this.mockConnections]);
  }

  getNearbyPeople(): Observable<Connection[]> {
    return of([...this.mockNearbyPeople]);
  }

  sendConnectionRequest(person: Connection): Observable<Connection> {
    this.mockConnections.push(person);
    const index = this.mockNearbyPeople.findIndex(p => p.id === person.id);
    if (index !== -1) {
      this.mockNearbyPeople.splice(index, 1);
    }
    return of(person);
  }

  removeConnection(id: string): Observable<void> {
    const index = this.mockConnections.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockConnections.splice(index, 1);
    }
    return of(void 0);
  }
}
