import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-screen gradient-bg">
      <!-- Fixed header — never scrolls -->
      <div class="auth-header">
        <button class="back-btn" (click)="goBack()">←</button>
        <div class="auth-logo">
          <span>✦</span>
        </div>
        <div class="spacer"></div>
      </div>

      <!-- Scrollable body -->
      <div class="auth-scroll-body">

      <div class="auth-body animate-slide-up">
        <div class="auth-title">
          <h2>Welcome back</h2>
          <p>Sign in to continue your vibe</p>
        </div>

        <form class="auth-form" (ngSubmit)="onLogin()">
          <div class="input-group">
            <label>USERNAME</label>
            <input class="input" type="text" [(ngModel)]="username" name="username"
              placeholder="Enter your username" autocomplete="username" />
          </div>

          <div class="input-group">
            <label>PASSWORD</label>
            <input class="input" [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="password"
              name="password" placeholder="Enter your password" autocomplete="current-password" />
          </div>

          <div class="forgot">
            <span>Forgot password?</span>
          </div>

          <button class="btn btn-primary btn-full btn-lg" type="submit" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> Signing in... }
            @else { Sign In }
          </button>
        </form>

        <p class="auth-switch">
          Don't have an account?
          <span (click)="goToRegister()">Create one</span>
        </p>
      </div>
      </div><!-- /auth-scroll-body -->
    </div>
  `,
  styles: [`
    .auth-screen {
      width: 100%; max-width: 430px; height: 100dvh;
      margin: 0 auto; display: flex; flex-direction: column; overflow: hidden;
    }
    /* Fixed top header — never scrolls */
    .auth-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: env(safe-area-inset-top, 16px) 28px 0;
      padding-top: max(env(safe-area-inset-top, 0px), 16px);
      padding-bottom: 4px;
    }
    /* Scrollable content below the header */
    .auth-scroll-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 20px 28px 40px;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .back-btn {
      width: 40px; height: 40px; border-radius: 50%; background: var(--bg-card);
      border: 1px solid var(--border-subtle); color: var(--text-primary);
      font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .auth-logo {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--purple-primary), #5B21B6);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: white; box-shadow: 0 0 20px var(--purple-glow);
    }
    .spacer { width: 40px; }
    .auth-body { display: flex; flex-direction: column; min-height: 100%; }
    .auth-title { margin-bottom: 32px; }
    .auth-title h2 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    .auth-title p { color: var(--text-secondary); font-size: 14px; }
    .auth-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; }
    .forgot { text-align: right; font-size: 13px; color: var(--purple-light); cursor: pointer; margin-top: -8px; }
    .auth-switch { text-align: center; font-size: 14px; color: var(--text-secondary); padding-top: 20px; padding-bottom: 8px; }
    .auth-switch span { color: var(--purple-light); cursor: pointer; font-weight: 600; margin-left: 4px; }
    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    try {
      await this.authService.login(this.username, this.password);
      this.router.navigate(['/app/map']);
    } finally {
      this.loading.set(false);
    }
  }

  goBack()       { this.router.navigate(['/splash']); }
  goToRegister() { this.router.navigate(['/register']); }
  showPwd        = signal(false);
}
