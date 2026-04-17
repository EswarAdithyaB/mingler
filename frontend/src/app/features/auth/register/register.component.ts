import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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

      <!-- Scrollable body — critical for 5-field form on small screens -->
      <div class="auth-scroll-body">
        <div class="auth-body animate-slide-up">

          <div class="auth-title">
            <h2>Join the zone</h2>
            <p>Create your Minglr identity</p>
          </div>

          <!-- Error banner -->
          @if (error()) {
            <div class="error-banner">
              <span>⚠️</span> {{ error() }}
            </div>
          }

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
              <span class="field-hint">Lowercase letters, numbers, underscores only</span>
            </div>

            <div class="input-group">
              <label>EMAIL</label>
              <input class="input" type="email" [(ngModel)]="email" name="email"
                placeholder="your@email.com" autocomplete="email" />
            </div>

            <div class="input-group">
              <label>PASSWORD</label>
              <div class="pw-wrap">
                <input class="input" [type]="showPwd() ? 'text' : 'password'"
                  [(ngModel)]="password" name="password"
                  placeholder="Min. 8 characters" autocomplete="new-password" />
                <button type="button" class="pw-toggle" (click)="showPwd.set(!showPwd())">
                  {{ showPwd() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (password && password.length < 8) {
                <span class="field-hint warn">At least 8 characters required</span>
              }
            </div>

            <!-- Vibe picker -->
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

            <button class="btn btn-primary btn-full btn-lg" type="submit"
              [disabled]="loading() || !canSubmit()">
              @if (loading()) {
                <span class="spinner"></span> Creating your zone...
              } @else {
                Create Account →
              }
            </button>

          </form>

          <p class="auth-switch">
            Already have an account? <span (click)="goToLogin()">Sign in</span>
          </p>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-screen {
      width: 100%; max-width: 430px; height: 100dvh;
      margin: 0 auto; display: flex; flex-direction: column; overflow: hidden;
    }
    .auth-header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: max(env(safe-area-inset-top, 0px), 16px) 28px 4px;
    }
    .auth-scroll-body {
      flex: 1; min-height: 0;
      overflow-y: auto; overflow-x: hidden;
      padding: 16px 28px 48px;
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
    .auth-body { display: flex; flex-direction: column; }
    .auth-title { margin-bottom: 24px; }
    .auth-title h2 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    .auth-title p  { color: var(--text-secondary); font-size: 14px; }

    /* Error banner */
    .error-banner {
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.35);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      font-size: 13px; color: #FCA5A5;
      margin-bottom: 16px;
      display: flex; align-items: center; gap: 8px;
      animation: shake 0.35s ease;
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25%      { transform: translateX(-6px); }
      75%      { transform: translateX(6px); }
    }

    .auth-form { display: flex; flex-direction: column; gap: 16px; }

    .field-hint { font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block; }
    .field-hint.warn { color: #FCA5A5; }

    /* Password with toggle */
    .pw-wrap { position: relative; }
    .pw-wrap .input { padding-right: 44px; }
    .pw-toggle {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;
    }

    /* Vibe picker */
    .vibe-picker { display: flex; flex-direction: column; gap: 10px; }
    .vibe-label {
      font-size: 12px; font-weight: 500; color: var(--text-secondary);
      letter-spacing: 0.5px; text-transform: uppercase;
    }
    .vibe-options { display: flex; flex-wrap: wrap; gap: 8px; }
    .vibe-chip {
      padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer;
      background: var(--bg-card); border: 1.5px solid var(--border-subtle); color: var(--text-secondary);
      transition: all 0.2s;
      &.active {
        background: rgba(124,58,237,0.2);
        border-color: var(--purple-medium);
        color: var(--purple-light);
      }
    }

    .auth-switch {
      text-align: center; font-size: 14px; color: var(--text-secondary);
      padding-top: 20px; padding-bottom: 8px;
    }
    .auth-switch span { color: var(--purple-light); cursor: pointer; font-weight: 600; margin-left: 4px; }

    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.6s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  displayName   = '';
  username      = '';
  email         = '';
  password      = '';
  loading       = signal(false);
  error         = signal('');
  showPwd       = signal(false);
  selectedVibe  = signal('chill');

  vibes = [
    { key: 'chill',       emoji: '😌', label: 'Chill'       },
    { key: 'social',      emoji: '🎉', label: 'Social'      },
    { key: 'creative',    emoji: '🎨', label: 'Creative'    },
    { key: 'gamer',       emoji: '🎮', label: 'Gamer'       },
    { key: 'mysterious',  emoji: '🌙', label: 'Mysterious'  }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  canSubmit(): boolean {
    return !!(
      this.displayName.trim() &&
      this.username.trim() &&
      this.email.trim() &&
      this.password.length >= 8
    );
  }

  async onRegister() {
    if (!this.canSubmit()) return;
    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.register(
        this.username.trim().toLowerCase(),
        this.displayName.trim(),
        this.email.trim().toLowerCase(),
        this.password,
        this.selectedVibe()
      );
      this.router.navigate(['/onboarding']);
    } catch (err: unknown) {
      const httpErr = err as HttpErrorResponse;
      this.error.set(
        httpErr?.error?.error ?? 'Registration failed. Please try again.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  goBack()    { this.router.navigate(['/splash']); }
  goToLogin() { this.router.navigate(['/login']); }
}
