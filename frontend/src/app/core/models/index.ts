export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  vibe?: string; // e.g. "chill", "social", "creative"
  isAnonymous: boolean;
  isOnline?: boolean;
  currentZoneId?: string;
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  location: { lat: number; lng: number };
  radius: number; // meters
  activeUsers: number;
  createdAt: Date;
  type: 'cafe' | 'bar' | 'park' | 'custom';
  coverEmoji?: string;
}

export interface Vibe {
  id: string;
  userId: string;
  username: string;
  isAnonymous: boolean;
  content: string;
  type: 'confession' | 'shoutout' | 'question' | 'vibe';
  reactions: Record<string, number>;
  myReaction?: string;
  createdAt: Date;
  zoneId: string;
}

export interface Game {
  id: string;
  type: 'ludo' | 'truth-or-dare' | 'quiz' | 'word-chain';
  hostId: string;
  hostName: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  zoneId: string;
  createdAt: Date;
}

export interface Player {
  userId: string;
  username: string;
  avatar?: string;
  score?: number;
  isReady?: boolean;
}

export interface Connection {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  vibe?: string;
  connectedAt: Date;
  lastSeen?: Date;
  mutualZones?: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'vibe' | 'game-invite';
}
