import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-screen gradient-bg">
      <!-- Fixed header -->
      <div class="auth-header">
        <button class="back-btn" (click)="goBack()">←</button>
        <div class="auth-logo"><span>✦</span></div>
        <div class="spacer"></div>
      </div>

      <!-- Scrollable body — critical for 5-field form + vibe picker -->
      <div class="auth-scroll-body">
      <div class="auth-body animate-slide-up">
        <div class="auth-title">
          <h2>Join the zone</h2>
          <p>Create your Minglr identity</p>
        </div>

        <form class="auth-form" (ngSubmit)="onRegister()">
          <div class="input-group">
            <label>DISPLAY NAME</label>
            <input class="input" type="text" [(ngModel)]="displayName" name="displayName"
              placeholder="How should people call you?" />
          </div>
          <div class="input-group">
            <label>USERNAME</label>
            <input class="input" type="text" [(ngModel)]="username" name="username"
              placeholder="unique_username" autocomplete="username" />
          </div>
          <div class="input-group">
            <label>EMAIL</label>
            <input class="input" type="email" [(ngModel)]="email" name="email"
              placeholder="your@email.com" autocomplete="email" />
          </div>
          <div class="input-group">
            <label>PASSWORD</label>
            <input class="input" type="password" [(ngModel)]="password" name="password"
              placeholder="Min. 8 characters" autocomplete="new-password" />
          </div>

          <div class="vibe-picker">
            <label class="vibe-label">YOUR VIBE</label>
            <div class="vibe-options">
              @for (v of vibes; track v.key) {
                <div class="vibe-chip" [class.active]="selectedVibe() === v.key"
                  (click)="selectedVibe.set(v.key)">
                  {{ v.emoji }} {{ v.label }}
                </div>
              }
            </div>
          </div>

          <button class="btn btn-primary btn-full btn-lg" type="submit" [disabled]="loading()">
            @if (loading()) { Creating your zone... }
            @else { Create Account → }
          </button>
        </form>

        <p class="auth-switch">
          Already have an account? <span (click)="goToLogin()">Sign in</span>
        </p>
      </div>
      </div><!-- /auth-scroll-body -->
    </div>
  `,
  styles: [`
    .auth-screen {
      width: 100%; max-width: 430px; height: 100dvh; margin: 0 auto;
      display: flex; flex-direction: column; overflow: hidden;
    }
    /* Fixed header */
    .auth-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: max(env(safe-area-inset-top, 0px), 16px) 28px 4px;
    }
    /* Scrollable form body */
    .auth-scroll-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 28px 48px;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .back-btn {
      width: 40px; height: 40px; border-radius: 50%; background: var(--bg-card);
      border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 18px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .auth-logo {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--purple-primary), #5B21B6);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: white; box-shadow: 0 0 20px var(--purple-glow);
    }
    .spacer { width: 40px; }
    .auth-body { display: flex; flex-direction: column; }
    .auth-title { margin-bottom: 24px; }
    .auth-title h2 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    .auth-title p { color: var(--text-secondary); font-size: 14px; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .vibe-picker { display: flex; flex-direction: column; gap: 10px; }
    .vibe-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); letter-spacing: 0.5px; text-transform: uppercase; }
    .vibe-options { display: flex; flex-wrap: wrap; gap: 8px; }
    .vibe-chip {
      padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle); color: var(--text-secondary);
      transition: all 0.2s;
      &.active { background: rgba(124, 58, 237, 0.2); border-color: var(--purple-medium); color: var(--purple-light); }
    }
    .auth-switch { text-align: center; font-size: 14px; color: var(--text-secondary); padding-top: 20px; }
    .auth-switch span { color: var(--purple-light); cursor: pointer; font-weight: 600; margin-left: 4px; }
  `]
})
export class RegisterComponent {
  displayName = '';
  username = '';
  email = '';
  password = '';
  loading = signal(false);
  selectedVibe = signal('chill');

  vibes = [
    { key: 'chill', emoji: '😌', label: 'Chill' },
    { key: 'social', emoji: '🎉', label: 'Social' },
    { key: 'creative', emoji: '🎨', label: 'Creative' },
    { key: 'gamer', emoji: '🎮', label: 'Gamer' },
    { key: 'mysterious', emoji: '🌙', label: 'Mysterious' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    if (!this.username || !this.email || !this.password) return;
    this.loading.set(true);
    try {
      await this.authService.register(this.username, this.email, this.password);
      this.router.navigate(['/app/map']);
    } finally {
      this.loading.set(false);
    }
  }

  goBack()    { this.router.navigate(['/splash']); }
  goToLogin() { this.router.navigate(['/login']); }
}
