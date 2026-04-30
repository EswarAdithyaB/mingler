import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Achievement {
  id: string;
  icon: string;
  label: string;
  earned: boolean;
  description?: string;
  earnedDate?: string;
}

export interface Activity {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  timeAgo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileMockService {

  private mockAchievements: Achievement[] = [
    {
      id: 'a1',
      icon: 'medal',
      label: 'Zone Master',
      earned: true,
      description: 'Visited 10 unique zones',
      earnedDate: 'Earned 2 months ago'
    },
    {
      id: 'a2',
      icon: 'bolt',
      label: 'Speed Connect',
      earned: true,
      description: 'Made 5 quick connections',
      earnedDate: 'Earned 1 month ago'
    },
    {
      id: 'a3',
      icon: 'lightning',
      label: 'First Flight',
      earned: true,
      description: 'Won your first game',
      earnedDate: 'Earned 3 weeks ago'
    },
  ];

  private mockActivities: Activity[] = [
    {
      id: 'act1',
      icon: 'arcade',
      iconBg: 'rgba(123,97,255,0.15)',
      title: 'Won at Cyber Arcade',
      subtitle: '+250 XP  •  2 hours ago',
      timeAgo: '2h',
    },
    {
      id: 'act2',
      icon: 'location',
      iconBg: 'rgba(16,185,129,0.12)',
      title: 'Visited Neon District',
      subtitle: 'Zone Unlocked  •  Yesterday',
      timeAgo: '1d',
    },
    {
      id: 'act3',
      icon: 'connect',
      iconBg: 'rgba(236,72,153,0.12)',
      title: 'Connected with @ZeroOne',
      subtitle: 'Mutual Match  •  2 days ago',
      timeAgo: '2d',
    },
  ];

  getAchievements(): Observable<Achievement[]> {
    return of([...this.mockAchievements]);
  }

  getActivities(): Observable<Activity[]> {
    return of([...this.mockActivities]);
  }

  getUserProfile() {
    return of({
      id: 'me',
      username: 'Nova_Stream',
      displayName: 'Nova Stream',
      avatar: 'avatar-url',
      vibe: 'social',
      level: 5,
      bio: 'Exploring zones and making connections'
    });
  }
}
