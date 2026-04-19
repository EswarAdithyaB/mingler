import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadComponent: () => import('./features/auth/splash/splash.component').then(m => m.SplashComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/auth/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'map', pathMatch: 'full' },
      {
        path: 'map',
        loadComponent: () => import('./features/map/map.component').then(m => m.MapComponent)
      },
      {
        path: 'zone/:id',
        loadComponent: () => import('./features/zone/zone.component').then(m => m.ZoneComponent)
      },
      {
        path: 'zone-entry/:id',
        loadComponent: () => import('./features/zone-entry/zone-entry.component').then(m => m.ZoneEntryComponent)
      },
      {
        path: 'vibe-check/:id',
        loadComponent: () => import('./features/vibe-check/vibe-check.component').then(m => m.VibeCheckComponent)
      },
      {
        path: 'vibes',
        loadComponent: () => import('./features/vibe-feed/vibe-feed.component').then(m => m.VibeFeedComponent)
      },
      {
        path: 'games',
        loadComponent: () => import('./features/games/games.component').then(m => m.GamesComponent)
      },
      {
        path: 'connections',
        loadComponent: () => import('./features/connections/connections.component').then(m => m.ConnectionsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'splash' }
];
