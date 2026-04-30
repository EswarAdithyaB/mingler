import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface VibeChannel {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  liveCount: number;
  members: string[];
  memberCount: number;
  tags: string[];
  recentMessages: { user: string; text: string }[];
  joined: boolean;
}

export interface MyActiveVibe {
  id: string;
  title: string;
  subtitle: string;
  liveCount: number;
  memberCount: number;
  timestamp: string;
  isLive: boolean;
  avatarEmoji: string;
}

export interface Squad {
  id: string;
  name: string;
  memberCount: number;
  emoji: string;
  color: string;
}

export interface StreamMsg {
  id: string;
  user: string;
  avatarEmoji: string;
  text: string;
  timeAgo: string;
  likes: number;
  replies: number;
  isMe: boolean;
}

export interface TrendingZone {
  id: string;
  name: string;
  subtitle: string;
  type: 'hero' | 'match' | 'live';
  matchPct?: number;
  liveLabel?: string;
  activeCount?: number;
  tags: string[];
  bgGradient: string;
  distance?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VibeFeedMockService {

  private mockVibeChannels: VibeChannel[] = [
    {
      id: 'vc1',
      title: 'Post-Digital Philosophy & Chill',
      category: 'Global Nexus',
      categoryIcon: '💬',
      liveCount: 128,
      description: 'Discussing the intersection of AI, consciousness, and the future of social architecture.',
      tags: ['#philosophy', '#AI'],
      members: ['🧑', '👩', '🧔', '👸'],
      memberCount: 175,
      joined: false,
      recentMessages: [
        { user: 'Ghost_99', text: 'The neural net is just a mirror...' },
        { user: 'Echo_User', text: 'Vibe check on the new protocol?' },
        { user: 'Nex_5', text: 'Anyone seen the latest drop?' }
      ]
    },
    {
      id: 'vc2',
      title: 'Vaporwave Aesthetics',
      category: 'Visual',
      categoryIcon: '🎞️',
      liveCount: 42,
      description: '90s nostalgia meets futuristic dystopia. Share your best visual finds.',
      tags: ['#visuals', '#retro'],
      members: ['🧑', '👩'],
      memberCount: 58,
      joined: true,
      recentMessages: []
    },
    {
      id: 'vc3',
      title: 'Techno Underground',
      category: 'Audio',
      categoryIcon: '🎵',
      liveCount: 99,
      description: 'Berlin scene updates, hardware talk, and set recommendations.',
      tags: ['#audio', '#modular'],
      members: ['🧑', '👩', '🧔'],
      memberCount: 130,
      joined: false,
      recentMessages: []
    },
    {
      id: 'vc4',
      title: 'The Syntax Void',
      category: 'Dev',
      categoryIcon: '< />',
      liveCount: 13,
      description: 'Deep dives into obscure languages and the philosophy of code.',
      tags: ['#dev', '#logic'],
      members: ['🧑'],
      memberCount: 22,
      joined: false,
      recentMessages: []
    }
  ];

  private mockStreamMessages: StreamMsg[] = [
    {
      id: 's1',
      user: 'Anon_4012',
      avatarEmoji: '🧑',
      timeAgo: '1M AGO',
      text: "Just uploaded a new track to the 'Vaporwave' vibe. Let me know what you think of the synth layering!",
      likes: 12,
      replies: 4,
      isMe: false
    },
    {
      id: 's2',
      user: 'Me',
      avatarEmoji: '🧑‍🎤',
      timeAgo: 'JUST NOW',
      text: "The layering is insane. Especially around 0:45. Gives me heavy Blade Runner 2049 vibes.",
      likes: 0,
      replies: 0,
      isMe: true
    },
    {
      id: 's3',
      user: 'Circuit_Breaker',
      avatarEmoji: '🤖',
      timeAgo: '5M AGO',
      text: "Agreed. The low-pass filter sweep was buttery smooth.",
      likes: 24,
      replies: 0,
      isMe: false
    }
  ];

  private mockMyActiveVibes: MyActiveVibe[] = [
    {
      id: 'mv1',
      title: 'Midnight Lo-Fi',
      subtitle: 'This drop is actually insane, wh...',
      liveCount: 9,
      memberCount: 15,
      timestamp: '',
      isLive: true,
      avatarEmoji: '🎧'
    },
    {
      id: 'mv2',
      title: 'Retro Raiders',
      subtitle: 'Alex: "Anyone up for a speedrun..."',
      liveCount: 0,
      memberCount: 3,
      timestamp: '15m ago',
      isLive: false,
      avatarEmoji: '🕹️'
    },
    {
      id: 'mv3',
      title: 'After Hours',
      subtitle: '"The vibe in Tokyo right now is..."',
      liveCount: 43,
      memberCount: 148,
      timestamp: '',
      isLive: true,
      avatarEmoji: '🌙'
    }
  ];

  private mockSquads: Squad[] = [
    { id: 'sq1', name: 'Alpha Team', memberCount: 129, emoji: '⚡', color: '#7c3aed' },
    { id: 'sq2', name: 'Glitch Runners', memberCount: 52, emoji: '◎', color: '#06b6d4' }
  ];

  private mockTrendingZones: TrendingZone[] = [
    {
      id: 'tz1',
      name: 'Neon Cathedral',
      type: 'hero',
      subtitle: 'Downtown • 0.3 miles away',
      liveLabel: 'IS HOT RIGHT NOW',
      activeCount: 0,
      tags: ['#ELECTONIGHT', '#TECHNWAVE'],
      bgGradient: 'linear-gradient(145deg, rgba(60,20,120,0.9), rgba(120,20,80,0.8), rgba(8,8,15,0.95))'
    },
    {
      id: 'tz2',
      name: 'The Blue Note Loft',
      type: 'match',
      subtitle: 'Lounge • Downtown • 2.4 miles away',
      matchPct: 94,
      activeCount: 192,
      tags: ['#JazzLounge', '#Chill'],
      bgGradient: '🎷'
    },
    {
      id: 'tz3',
      name: 'Echo Chambers',
      type: 'live',
      subtitle: 'Creative • Arts District • 0.8 miles away',
      liveLabel: 'Live Jam',
      activeCount: 42,
      tags: ['#Beats', '#StudioFlow'],
      bgGradient: '🎙️'
    }
  ];

  private heatDots = [
    { id: 1, x: 28, y: 35, size: 60, color: '#ec4899', opacity: 0.6 },
    { id: 2, x: 55, y: 55, size: 80, color: '#7c3aed', opacity: 0.5 },
    { id: 3, x: 72, y: 30, size: 45, color: '#06b6d4', opacity: 0.4 },
    { id: 4, x: 40, y: 70, size: 35, color: '#f59e0b', opacity: 0.35 },
    { id: 5, x: 82, y: 65, size: 50, color: '#10b981', opacity: 0.4 }
  ];

  getVibeChannels(): Observable<VibeChannel[]> {
    return of([...this.mockVibeChannels]);
  }

  getStreamMessages(): Observable<StreamMsg[]> {
    return of([...this.mockStreamMessages]);
  }

  getMyActiveVibes(): Observable<MyActiveVibe[]> {
    return of([...this.mockMyActiveVibes]);
  }

  getSquads(): Observable<Squad[]> {
    return of([...this.mockSquads]);
  }

  getTrendingZones(): Observable<TrendingZone[]> {
    return of([...this.mockTrendingZones]);
  }

  getHeatDots() {
    return of([...this.heatDots]);
  }

  joinChannel(channelId: string): Observable<VibeChannel | null> {
    const channel = this.mockVibeChannels.find(c => c.id === channelId);
    if (channel) {
      channel.joined = !channel.joined;
    }
    return of(channel || null);
  }

  postMessage(message: StreamMsg): Observable<StreamMsg> {
    return of(message);
  }

  likeMessage(messageId: string): Observable<void> {
    const msg = this.mockStreamMessages.find(m => m.id === messageId);
    if (msg) {
      msg.likes++;
    }
    return of(void 0);
  }
}
