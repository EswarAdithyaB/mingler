import { Injectable, signal } from '@angular/core';
import { Zone } from '../models';

@Injectable({ providedIn: 'root' })
export class ZoneService {
  activeZone = signal<Zone | null>(null);
  nearbyZones = signal<Zone[]>([]);

  mockZones: Zone[] = [
    {
      id: 'zone_001',
      name: 'Neon Lounge',
      description: 'The hottest spot in town',
      location: { lat: 17.3850, lng: 78.4867 },
      radius: 100,
      activeUsers: 12,
      createdAt: new Date(),
      type: 'cafe',
      coverEmoji: '🌈'
    },
    {
      id: 'zone_002',
      name: 'Chill Corner',
      description: 'Relax and vibe',
      location: { lat: 17.3860, lng: 78.4877 },
      radius: 80,
      activeUsers: 5,
      createdAt: new Date(),
      type: 'cafe',
      coverEmoji: '☕'
    },
    {
      id: 'zone_003',
      name: 'Game Den',
      description: 'For the players',
      location: { lat: 17.3840, lng: 78.4857 },
      radius: 120,
      activeUsers: 8,
      createdAt: new Date(),
      type: 'custom',
      coverEmoji: '🎮'
    }
  ];

  loadNearbyZones(): void {
    // Simulate geolocation-based zone discovery
    setTimeout(() => {
      this.nearbyZones.set(this.mockZones);
    }, 600);
  }

  joinZone(zone: Zone): void {
    this.activeZone.set(zone);
  }

  leaveZone(): void {
    this.activeZone.set(null);
  }

  getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
  }
}
