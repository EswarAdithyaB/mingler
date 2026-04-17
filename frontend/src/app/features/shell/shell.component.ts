import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

interface NavItem { path: string; icon: string; label: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="mobile-shell">
      <router-outlet />
      @if (!hideNav) {
        <nav class="bottom-nav">
          <div class="nav-items">
            @for (item of navItems; track item.path) {
              <button class="nav-item" routerLink="{{ item.path }}" routerLinkActive="active">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
              </button>
            }
          </div>
        </nav>
      }
    </div>
  `
})
export class ShellComponent implements OnInit {
  hideNav = false;

  navItems: NavItem[] = [
    { path: '/app/map',         icon: '🗺️',  label: 'Map' },
    { path: '/app/vibes',       icon: '💬',  label: 'Vibes' },
    { path: '/app/games',       icon: '🎮',  label: 'Games' },
    { path: '/app/connections', icon: '👥',  label: 'Connect' },
    { path: '/app/settings',    icon: '👤',  label: 'Profile' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Hide shell nav on zone and zone-entry pages (they have their own bars)
    const HIDE_ROUTES = ['/zone/', '/zone-entry/'];
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url: string = e.urlAfterRedirects;
        this.hideNav = HIDE_ROUTES.some(r => url.includes(r));
      });
    // Check initial route
    const url = this.router.url;
    this.hideNav = HIDE_ROUTES.some(r => url.includes(r));
  }
}
