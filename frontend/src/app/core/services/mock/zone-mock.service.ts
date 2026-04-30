import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Zone } from '../../models';

export interface LoungeUser {
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

export interface ConfessionPost {
  id: string;
  avatarEmoji: string;
  timeAgo: string;
  text: string;
  revealed: boolean;
  mood: string;
}

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'map' | 'color' | 'gradient';
  value: string;
  preview: string;
}

@Injectable({
  providedIn: 'root'
})
export class ZoneMockService {

  private mockZones: Zone[] = [
    {
      id: 'zone_001',
      name: 'Neon District',
      description: 'A vibrant urban lounge zone',
      location: { lat: 40.7128, lng: -74.0060 },
      radius: 500,
      activeUsers: 42,
      createdAt: new Date(),
      type: 'custom',
      coverEmoji: '🌆'
    }
  ];

  private mockLoungeUsers: LoungeUser[] = [
    { id: 'me', name: 'NOVA_STREAM', avatarEmoji: '', gender: 'f', ringColor: '#c084fc', activityEmoji: '', nameStyle: 'pill', nameColor: 'white', wx: 50, wy: 50, size: 'lg', isMe: true, ring: 1 },
    { id: 'u1', name: 'ZANDER_9X', avatarEmoji: '', gender: 'm', ringColor: '#7c3aed', activityEmoji: '🎮', nameStyle: 'text', nameColor: '#a78bfa', wx: 40, wy: 41, size: 'md', isMe: false, ring: 1 },
    { id: 'u2', name: 'KAI_GHOST', avatarEmoji: '', gender: 'f', ringColor: '#10b981', activityEmoji: '🔥', nameStyle: 'text', nameColor: '#34d399', wx: 61, wy: 40, size: 'sm', isMe: false, ring: 1 },
    { id: 'u3', name: 'SOL_RUNNER', avatarEmoji: '', gender: 'm', ringColor: '#06b6d4', activityEmoji: '🎵', nameStyle: 'text', nameColor: '#67e8f9', wx: 30, wy: 60, size: 'sm', isMe: false, ring: 2 },
    { id: 'u4', name: 'MOCHI_BABE', avatarEmoji: '', gender: 'f', ringColor: '#ec4899', activityEmoji: '✨', nameStyle: 'text', nameColor: '#f9a8d4', wx: 68, wy: 57, size: 'sm', isMe: false, ring: 2 },
    { id: 'u5', name: 'DRIFT_X', avatarEmoji: '', gender: 'm', ringColor: '#f59e0b', activityEmoji: '🎯', nameStyle: 'text', nameColor: '#fcd34d', wx: 47, wy: 68, size: 'sm', isMe: false, ring: 2 },
    { id: 'u6', name: 'NIGHT_OWL', avatarEmoji: '', gender: 'f', ringColor: '#8b5cf6', activityEmoji: '🌙', nameStyle: 'text', nameColor: '#c4b5fd', wx: 19, wy: 37, size: 'sm', isMe: false, ring: 3 },
    { id: 'u7', name: 'PIXEL_WAVE', avatarEmoji: '', gender: 'm', ringColor: '#22d3ee', activityEmoji: '🎶', nameStyle: 'text', nameColor: '#67e8f9', wx: 73, wy: 28, size: 'sm', isMe: false, ring: 3 },
    { id: 'u8', name: 'GHOST_RUN', avatarEmoji: '', gender: 'f', ringColor: '#a3e635', activityEmoji: '💨', nameStyle: 'text', nameColor: '#bef264', wx: 42, wy: 76, size: 'sm', isMe: false, ring: 3 }
  ];

  private mockConfessions: ConfessionPost[] = [
    {
      id: 'c1',
      avatarEmoji: '🦊',
      timeAgo: '2m ago',
      revealed: false,
      mood: 'frustrated',
      text: "I can't stop thinking about someone I met here last week. We talked for hours but I didn't get their contact. Came back every day hoping to see them again."
    },
    {
      id: 'c2',
      avatarEmoji: '🙏',
      timeAgo: '12m ago',
      revealed: false,
      mood: 'heartbroken',
      text: "Actually the reason I'm always here working late is because going home feels empty. I keep smiling because I don't want to be a burden."
    },
    {
      id: 'c3',
      avatarEmoji: '🌻',
      timeAgo: '31m ago',
      revealed: false,
      mood: 'overwhelmed',
      text: "I quit my job today without a backup plan. Terrified but also weirdly free? Told no one. You're the first to know."
    }
  ];

  private bgOptions: BackgroundOption[] = [
    { id: 'map', name: 'City Map', type: 'map', value: '', preview: '#1a1a2e' },
    { id: 'none', name: 'Dark', type: 'color', value: '#090912', preview: '#090912' },
    { id: 'midnight', name: 'Midnight', type: 'gradient', value: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', preview: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
    { id: 'aurora', name: 'Aurora', type: 'gradient', value: 'linear-gradient(135deg,#0a0a14 0%,#1a0a2e 40%,#0a1a2e 100%)', preview: 'linear-gradient(135deg,#0a0a14,#1a0a2e,#0a1a2e)' },
    { id: 'neon', name: 'Neon City', type: 'gradient', value: 'linear-gradient(160deg,#0d0221 0%,#1b1033 50%,#0d1b2a 100%)', preview: 'linear-gradient(160deg,#0d0221,#1b1033,#0d1b2a)' },
    { id: 'forest', name: 'Forest', type: 'gradient', value: 'linear-gradient(135deg,#0a1a0a 0%,#0d2b1a 50%,#0a0d14 100%)', preview: 'linear-gradient(135deg,#0a1a0a,#0d2b1a,#0a0d14)' }
  ];

  getMoods() {
    return [
      { key: 'frustrated', emoji: '😤', label: 'Frustrated' },
      { key: 'heartbroken', emoji: '💔', label: 'Heartbroken' },
      { key: 'overwhelmed', emoji: '😮‍💨', label: 'Overwhelm' },
      { key: 'lonely', emoji: '🌙', label: 'Lonely' },
      { key: 'anxious', emoji: '😰', label: 'Anxious' }
    ];
  }

  getVibeEmojiMap() {
    return {
      'hyped': '🔥',
      'chill': '😌',
      'lonely': '💜',
      'lets-play': '🎮',
      'need-to-talk': '🗣️',
      'just-vibing': '👻'
    };
  }

  getZoneById(zoneId: string): Observable<Zone | null> {
    const zone = this.mockZones.find(z => z.id === zoneId);
    return of(zone || null);
  }

  getLoungeUsers(): Observable<LoungeUser[]> {
    return of([...this.mockLoungeUsers]);
  }

  getConfessions(): Observable<ConfessionPost[]> {
    return of([...this.mockConfessions]);
  }

  getBackgroundOptions(): Observable<BackgroundOption[]> {
    return of([...this.bgOptions]);
  }

  addConfession(confession: ConfessionPost): Observable<ConfessionPost> {
    this.mockConfessions.unshift(confession);
    return of(confession);
  }

  peekUser(user: LoungeUser): Observable<LoungeUser> {
    return of(user);
  }

  leaveZone(zoneId: string): Observable<void> {
    return of(void 0);
  }
}
