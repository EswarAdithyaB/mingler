import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="mobile-shell">
      <router-outlet />

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
    </div>
  `
})
export class ShellComponent {
  navItems: NavItem[] = [
    { path: '/app/map',         icon: '🗺️',  label: 'Map' },
    { path: '/app/vibes',       icon: '💬',  label: 'Vibes' },
    { path: '/app/games',       icon: '🎮',  label: 'Games' },
    { path: '/app/connections', icon: '👥',  label: 'Connect' },
    { path: '/app/settings',    icon: '⚙️',  label: 'Settings' }
  ];
}
