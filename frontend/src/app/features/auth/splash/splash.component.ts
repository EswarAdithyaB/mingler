import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-screen gradient-bg">
      <div class="splash-top">
        <span class="skip-btn" (click)="goToLogin()">Skip</span>
      </div>

      <div class="splash-center animate-slide-up">
        <div class="logo-ring animate-pulse-glow">
          <div class="logo-inner">
            <span class="logo-icon">✦</span>
          </div>
        </div>
        <h1 class="app-name">Minglr</h1>
        <p class="app-tagline">Your zone. Your vibe. Your world.</p>
      </div>

      <div class="splash-bottom animate-slide-up">
        <button class="btn btn-primary btn-full btn-lg" (click)="goToRegister()">
          Create Account →
        </button>
        <button class="btn btn-secondary btn-full" (click)="goToLogin()">
          Log In
        </button>
        <p class="terms-text">
          By continuing, you agree to our <span>Terms</span> &amp; <span>Privacy Policy</span>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .splash-screen {
      position: relative;
      width: 100%;
      height: 100dvh;
      max-width: 430px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px 40px;
      overflow: hidden;
    }

    .splash-top {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      padding-top: env(safe-area-inset-top, 20px);
    }

    .skip-btn {
      font-size: 14px;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      &:hover { color: var(--text-primary); }
    }

    .splash-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }

    .logo-ring {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(236, 72, 153, 0.2));
      border: 2px solid rgba(167, 139, 250, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .logo-inner {
      width: 74px;
      height: 74px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7C3AED, #5B21B6);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon {
      font-size: 32px;
      color: white;
    }

    .app-name {
      font-size: 42px;
      font-weight: 800;
      background: linear-gradient(135deg, #FFFFFF 30%, var(--purple-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -1px;
    }

    .app-tagline {
      font-size: 16px;
      color: var(--text-secondary);
      letter-spacing: 0.3px;
    }

    .splash-bottom {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation-delay: 0.15s;
    }

    .terms-text {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      line-height: 1.5;
      span { color: var(--purple-light); cursor: pointer; }
    }
  `]
})
export class SplashComponent {
  constructor(private router: Router) {}
  goToLogin()    { this.router.navigate(['/login']); }
  goToRegister() { this.router.navigate(['/register']); }
}
