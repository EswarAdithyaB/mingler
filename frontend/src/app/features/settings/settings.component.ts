import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SettingsMockService } from '../../core/services/mock';

interface SettingsToggle {
  key: string;
  label: string;
  desc: string;
  value: boolean;
}

const VIBE_EMOJIS: Record<string, string> = {
  chill:      '😌',
  social:     '🎉',
  creative:   '🎨',
  gamer:      '🎮',
  mysterious: '🌙'
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  loggingOut       = signal(false);
  vibeVisibility   = signal('Everyone');
  detectionRadius  = signal(200);
  autoJoin         = false;

  private user = computed(() => this.authService.currentUser());

  displayName = computed(() => this.user()?.displayName  ?? 'Unknown');
  username    = computed(() => this.user()?.username     ?? '');
  email       = computed(() => this.user()?.email        ?? '');
  vibeKey     = computed(() => this.user()?.vibe         ?? 'chill');
  vibeEmoji   = computed(() => VIBE_EMOJIS[this.vibeKey()] ?? '🧑‍🎤');
  vibeLabel   = computed(() => {
    const map: Record<string, string> = {
      chill: 'Chill', social: 'Social', creative: 'Creative',
      gamer: 'Gamer', mysterious: 'Mysterious'
    };
    return map[this.vibeKey()] ?? this.vibeKey();
  });
  vibeBadge   = computed(() => `${this.vibeLabel()} Explorer`);
  memberSince = computed(() => {
    const d = this.user()?.createdAt;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  visibilityOptions = [
    { key: 'Everyone',  label: 'Everyone'  },
    { key: 'Zone-Only', label: 'Zone Only' },
    { key: 'Nobody',    label: 'Nobody'    }
  ];
  radiusPresets = [
    { label: 'Small',  val: 100 },
    { label: 'Medium', val: 200 },
    { label: 'Large',  val: 400 }
  ];
  privacyToggles: SettingsToggle[] = [
    { key: 'anonymous', label: 'Anonymous Mode',  desc: 'Hide your identity in zones', value: false },
    { key: 'location',  label: 'Location Sharing', desc: 'Let others see your zone',   value: true  }
  ];
  notifToggles: SettingsToggle[] = [
    { key: 'zone_alerts',  label: 'Zone Alerts',      desc: '', value: true  },
    { key: 'game_invites', label: 'Game Invites',      desc: '', value: true  },
    { key: 'new_conf',     label: 'New Confessions',   desc: '', value: false },
    { key: 'nearby',       label: 'Nearby Players',    desc: '', value: true  }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private settingsMockService: SettingsMockService
  ) {}

  goBack() { this.router.navigate(['/app/profile']); }

  goNotifications() { this.router.navigate(['/app/notifications']); }

  onRefresh() { window.location.reload(); }

  ngOnInit(): void {
    this.authService.refreshUser();

    // Load settings from mock service
    this.settingsMockService.getSettings().subscribe(settings => {
      this.vibeVisibility.set(settings.vibeVisibility);
      this.detectionRadius.set(settings.detectionRadius);
      this.privacyToggles = settings.privacyToggles;
      this.notifToggles = settings.notifToggles;
    });
  }

  async logout(): Promise<void> {
    this.loggingOut.set(true);
    await this.authService.logout();
    this.router.navigate(['/splash']);
  }

  updateVibeVisibility(visibility: string): void {
    this.settingsMockService.updateVibeVisibility(visibility).subscribe(() => {
      this.vibeVisibility.set(visibility);
    });
  }

  updateDetectionRadius(radius: number): void {
    this.settingsMockService.updateDetectionRadius(radius).subscribe(() => {
      this.detectionRadius.set(radius);
    });
  }
}
