import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SettingsToggle {
  key: string;
  label: string;
  desc: string;
  value: boolean;
}

export interface UserSettings {
  vibeVisibility: string;
  detectionRadius: number;
  autoJoin: boolean;
  privacyToggles: SettingsToggle[];
  notifToggles: SettingsToggle[];
}

@Injectable({
  providedIn: 'root'
})
export class SettingsMockService {

  private mockSettings: UserSettings = {
    vibeVisibility: 'Everyone',
    detectionRadius: 200,
    autoJoin: false,
    privacyToggles: [
      { key: 'anonymous', label: 'Anonymous Mode', desc: 'Hide your identity in zones', value: false },
      { key: 'location', label: 'Location Sharing', desc: 'Let others see your zone', value: true }
    ],
    notifToggles: [
      { key: 'zone_alerts', label: 'Zone Alerts', desc: '', value: true },
      { key: 'game_invites', label: 'Game Invites', desc: '', value: true },
      { key: 'new_conf', label: 'New Confessions', desc: '', value: false },
      { key: 'nearby', label: 'Nearby Players', desc: '', value: true }
    ]
  };

  getSettings(): Observable<UserSettings> {
    return of({ ...this.mockSettings });
  }

  updateVibeVisibility(visibility: string): Observable<void> {
    this.mockSettings.vibeVisibility = visibility;
    return of(void 0);
  }

  updateDetectionRadius(radius: number): Observable<void> {
    this.mockSettings.detectionRadius = radius;
    return of(void 0);
  }

  updatePrivacyToggle(key: string, value: boolean): Observable<void> {
    const toggle = this.mockSettings.privacyToggles.find(t => t.key === key);
    if (toggle) {
      toggle.value = value;
    }
    return of(void 0);
  }

  updateNotificationToggle(key: string, value: boolean): Observable<void> {
    const toggle = this.mockSettings.notifToggles.find(t => t.key === key);
    if (toggle) {
      toggle.value = value;
    }
    return of(void 0);
  }

  getVibeEmojis() {
    return {
      chill: '😌',
      social: '🎉',
      creative: '🎨',
      gamer: '🎮',
      mysterious: '🌙'
    };
  }

  getVisibilityOptions() {
    return [
      { key: 'Everyone', label: 'Everyone' },
      { key: 'Zone-Only', label: 'Zone Only' },
      { key: 'Nobody', label: 'Nobody' }
    ];
  }

  getRadiusPresets() {
    return [
      { label: 'Small', val: 100 },
      { label: 'Medium', val: 200 },
      { label: 'Large', val: 400 }
    ];
  }
}
