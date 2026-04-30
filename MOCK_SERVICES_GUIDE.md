# Mock Services Refactoring Guide

## Overview
All components have been refactored to use centralized mock data services instead of hard-coded data in templates or component classes. This architecture makes it easy to switch from mock data to real backend APIs without changing components.

## Services Created

### 1. **GamesMockService**
- Location: `/src/app/core/services/mock/games-mock.service.ts`
- Methods: `getGameTypes()`, `getActiveGames()`, `getGamesByType()`, `createGame()`, `joinGame()`
- **Status**: ✅ Integrated in GamesComponent

### 2. **ProfileMockService**
- Location: `/src/app/core/services/mock/profile-mock.service.ts`
- Methods: `getAchievements()`, `getActivities()`, `getUserProfile()`
- **Status**: ✅ Integrated in ProfileComponent

### 3. **NotificationsMockService**
- Location: `/src/app/core/services/mock/notifications-mock.service.ts`
- Methods: `getNotifications()`, `markAsRead()`, `markAllAsRead()`, `deleteNotification()`, `acceptGameInvite()`, `declineGameInvite()`
- **Status**: ✅ Integrated in NotificationsComponent

### 4. **ConnectionsMockService**
- Location: `/src/app/core/services/mock/connections-mock.service.ts`
- Methods: `getConnections()`, `getNearbyPeople()`, `sendConnectionRequest()`, `removeConnection()`
- **Status**: ✅ Integrated in ConnectionsComponent

### 5. **VibeFeedMockService**
- Location: `/src/app/core/services/mock/vibe-feed-mock.service.ts`
- Methods: `getVibeChannels()`, `getStreamMessages()`, `getMyActiveVibes()`, `getSquads()`, `getTrendingZones()`, `getHeatDots()`, `joinChannel()`, `postMessage()`, `likeMessage()`
- **Status**: ✅ Integrated in VibeFeedComponent

### 6. **SettingsMockService**
- Location: `/src/app/core/services/mock/settings-mock.service.ts`
- Methods: `getSettings()`, `updateVibeVisibility()`, `updateDetectionRadius()`, `updatePrivacyToggle()`, `updateNotificationToggle()`, `getVibeEmojis()`, `getVisibilityOptions()`, `getRadiusPresets()`
- **Status**: ⏳ Ready for integration (see template below)

### 7. **ZoneMockService**
- Location: `/src/app/core/services/mock/zone-mock.service.ts`
- Methods: `getZoneById()`, `getLoungeUsers()`, `getConfessions()`, `getBackgroundOptions()`, `addConfession()`, `peekUser()`, `leaveZone()`, `getMoods()`, `getVibeEmojiMap()`
- **Status**: ⏳ Ready for integration (see template below)

## Integration Pattern

### Before (Hard-coded data)
```typescript
export class GamesComponent {
  gameTypes = [
    { key: 'all', icon: '🎮', name: 'All', maxPlayers: 0 },
    { key: 'ludo', icon: '🎲', name: 'Ludo', maxPlayers: 4 },
    // ... more data
  ];

  activeGames = signal<Game[]>([
    { id: 'g1', type: 'ludo', ... },
    { id: 'g2', type: 'truth-or-dare', ... }
  ]);

  ngOnInit() { /* no data loading */ }
}
```

### After (Service-based)
```typescript
import { GamesMockService } from '../../core/services/mock';

export class GamesComponent implements OnInit {
  gameTypes = this.gamesMockService.getGameTypes();
  activeGames = signal<Game[]>([]);

  constructor(private gamesMockService: GamesMockService) {}

  ngOnInit() {
    this.gamesMockService.getActiveGames().subscribe(games => {
      this.activeGames.set(games);
    });
  }
}
```

## Remaining Components to Integrate

### Settings Component Integration Template
```typescript
// Add imports
import { SettingsMockService, UserSettings } from '../../core/services/mock';

// In component class
export class SettingsComponent implements OnInit {
  userSettings = signal<UserSettings | null>(null);

  constructor(
    // ... other dependencies
    private settingsMockService: SettingsMockService
  ) {}

  ngOnInit() {
    this.settingsMockService.getSettings().subscribe(settings => {
      this.userSettings.set(settings);
      // Update individual signals from settings
      this.vibeVisibility.set(settings.vibeVisibility);
      this.detectionRadius.set(settings.detectionRadius);
      this.privacyToggles = settings.privacyToggles;
      this.notifToggles = settings.notifToggles;
    });
  }

  // Update methods to use service
  updateVibeVisibility(visibility: string) {
    this.settingsMockService.updateVibeVisibility(visibility).subscribe(() => {
      this.vibeVisibility.set(visibility);
    });
  }
}
```

### Zone Component Integration Template
```typescript
// Add imports
import { ZoneMockService, LoungeUser, ConfessionPost } from '../../core/services/mock';

export class ZoneComponent implements OnInit, OnDestroy {
  zone = signal<Zone | null>(null);
  loungeUsers = signal<LoungeUser[]>([]);
  confessionFeed = signal<ConfessionPost[]>([]);
  moods = this.zoneMockService.getMoods();
  vibeEmojiMap = this.zoneMockService.getVibeEmojiMap();
  bgOptions = signal<BackgroundOption[]>([]);

  constructor(
    // ... other dependencies
    private zoneMockService: ZoneMockService
  ) {}

  ngOnInit() {
    const zoneId = this.route.snapshot.paramMap.get('id') || 'zone_001';

    // Load all zone data
    this.zoneMockService.getZoneById(zoneId).subscribe(zone => {
      this.zone.set(zone);
    });

    this.zoneMockService.getLoungeUsers().subscribe(users => {
      this.loungeUsers.set(users);
    });

    this.zoneMockService.getConfessions().subscribe(confessions => {
      this.confessionFeed.set(confessions);
    });

    this.zoneMockService.getBackgroundOptions().subscribe(options => {
      this.bgOptions.set(options);
    });
  }

  // Update methods
  addConfession() {
    const newConfession: ConfessionPost = {
      id: 'c' + Date.now(),
      avatarEmoji: '🧑',
      timeAgo: 'now',
      text: this.confessText,
      revealed: false,
      mood: this.selectedMood()
    };

    this.zoneMockService.addConfession(newConfession).subscribe(confession => {
      this.confessionFeed.update(list => [confession, ...list]);
      this.confessText = '';
    });
  }
}
```

## Switching to Real Backend APIs

When ready to use real APIs, simply replace the Observable returns with actual HTTP calls:

### Current Mock Service Method
```typescript
getGames(): Observable<Game[]> {
  return of([...this.mockGames]);  // Returns immediately
}
```

### Switch to Backend HTTP Call
```typescript
constructor(private http: HttpClient) {}

getGames(): Observable<Game[]> {
  return this.http.get<Game[]>('/api/games');  // Same interface!
}
```

**No component changes needed!** All components are already using RxJS Observables.

## Benefits of This Architecture

1. **Easy Testing** - Mock services can be replaced with test doubles
2. **Backend Ready** - Switch from mock to real APIs without touching components
3. **Single Source of Truth** - All data lives in services, not scattered in templates
4. **Consistent Data Flow** - All components use RxJS Observables
5. **Maintainable** - Changes to data structure only affect the service
6. **Type Safe** - Full TypeScript support with exported interfaces

## Files to Update (High Priority)

1. **SettingsComponent** - Follow the template above
2. **ZoneComponent** - Follow the template above
3. **Remaining components** (vibe-check, avatar-gen, zone-entry, shell, etc.) - Extract hard-coded data to services

## File Structure

```
/src/app/core/services/
├── mock/
│   ├── games-mock.service.ts          ✅
│   ├── profile-mock.service.ts        ✅
│   ├── notifications-mock.service.ts  ✅
│   ├── connections-mock.service.ts    ✅
│   ├── vibe-feed-mock.service.ts      ✅
│   ├── settings-mock.service.ts       ✅
│   ├── zone-mock.service.ts           ✅
│   └── index.ts                        ✅
└── [existing services...]
```

## Next Steps

1. Update Settings component using the provided template
2. Update Zone component using the provided template
3. Create mock services for remaining components
4. Test all components to ensure UI hasn't changed
5. When backend is ready, create service adapters to HTTP calls
6. Switch services in dependency injection without touching components
