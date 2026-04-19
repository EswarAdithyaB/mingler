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
    <div class="register-screen">

      <!-- Scrollable body -->
      <div class="scroll-body">

        <!-- Avatar + Branding -->
        <div class="brand-block animate-slide-up">
          <div class="avatar-wrap">
            <svg class="brand-svg" width="182" height="182" viewBox="0 0 182 182" fill="none" xmlns="http://www.w3.org/2000/svg">
               <g filter="url(#filter0_dd_199_49)">
                   <rect x="54.0122" y="34.0527" width="96" height="96" rx="32" transform="rotate(12 54.0122 34.0527)" fill="url(#paint0_linear_199_49)" shape-rendering="crispEdges"/>
                   <path d="M74.4639 110.986C72.8336 110.64 71.5692 109.774 70.6706 108.391C69.772 107.007 69.4959 105.5 69.8424 103.87C70.189 102.239 71.0541 100.975 72.4378 100.076C73.8216 99.1778 75.3286 98.9017 76.9588 99.2483C77.4153 99.3453 77.8287 99.4843 78.1992 99.6653C78.5697 99.8462 78.9169 100.056 79.2409 100.296L82.7667 97.4157C82.0686 96.2109 81.6754 94.9346 81.587 93.5868C81.4987 92.239 81.6874 90.9501 82.1534 89.72L78.4725 87.5575C77.745 88.2548 76.9054 88.7579 75.9537 89.0668C75.002 89.3757 74.0045 89.4192 72.9611 89.1974C71.3309 88.8509 70.0665 87.9858 69.1678 86.6021C68.2692 85.2183 67.9932 83.7113 68.3397 82.0811C68.6862 80.4508 69.5514 79.1864 70.9351 78.2878C72.3188 77.3892 73.8258 77.1132 75.4561 77.4597C77.0863 77.8062 78.3507 78.6713 79.2494 80.0551C80.148 81.4388 80.424 82.9458 80.0775 84.576C80.0636 84.6412 80.0498 84.7065 80.0359 84.7717C80.022 84.8369 80.0082 84.9021 79.9943 84.9673L83.6647 87.1787C84.5663 86.1436 85.6499 85.3345 86.9154 84.7516C88.1809 84.1686 89.5227 83.9085 90.9406 83.9714L91.845 79.7164C90.6496 79.0875 89.7454 78.1711 89.1323 76.9674C88.5192 75.7636 88.3582 74.477 88.6492 73.1076C88.9958 71.4773 89.8609 70.2129 91.2446 69.3143C92.6284 68.4157 94.1353 68.1396 95.7656 68.4862C97.3958 68.8327 98.6603 69.6978 99.5589 71.0815C100.457 72.4653 100.734 73.9723 100.387 75.6025C100.096 76.9719 99.4174 78.0801 98.3513 78.9269C97.2853 79.7738 96.0947 80.2449 94.7795 80.3402L93.875 84.5951C95.1959 85.1144 96.3159 85.8977 97.2349 86.945C98.1539 87.9923 98.8147 89.1722 99.2173 90.4845L103.47 89.9572C103.484 89.892 103.498 89.8268 103.511 89.7616C103.525 89.6963 103.539 89.6311 103.553 89.5659C103.9 87.9357 104.765 86.6712 106.148 85.7726C107.532 84.874 109.039 84.598 110.669 84.9445C112.3 85.291 113.564 86.1562 114.463 87.5399C115.361 88.9236 115.637 90.4306 115.291 92.0609C114.944 93.6911 114.079 94.9555 112.695 95.8541C111.312 96.7528 109.805 97.0288 108.174 96.6823C107.131 96.4605 106.229 96.0133 105.469 95.3405C104.709 94.6678 104.155 93.8684 103.807 92.9424L99.5644 93.4209C99.4897 94.734 99.1397 95.9802 98.5142 97.1592C97.8887 98.3383 97.0086 99.3525 95.8739 100.202L97.9339 104.218C98.3272 104.131 98.7282 104.088 99.1368 104.09C99.5454 104.092 99.9779 104.141 100.434 104.238C102.065 104.585 103.329 105.45 104.228 106.834C105.126 108.217 105.402 109.724 105.056 111.355C104.709 112.985 103.844 114.249 102.46 115.148C101.077 116.046 99.5697 116.322 97.9394 115.976C96.3092 115.629 95.0447 114.764 94.1461 113.381C93.2475 111.997 92.9715 110.49 93.318 108.86C93.4566 108.207 93.696 107.602 94.0361 107.044C94.3763 106.486 94.7776 106.001 95.2403 105.588L93.1906 101.523C91.6944 101.989 90.1883 102.06 88.6721 101.738C87.156 101.416 85.8092 100.738 84.6318 99.7035L81.1549 102.594C81.4096 103.159 81.5788 103.766 81.6626 104.414C81.7463 105.062 81.7188 105.713 81.5802 106.365C81.2337 107.995 80.3686 109.259 78.9848 110.158C77.6011 111.057 76.0941 111.333 74.4639 110.986Z" fill="black"/>
               </g>
               <defs>
                   <filter id="filter0_dd_199_49" x="-5.94727" y="-5.94727" width="193.862" height="193.862" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                       <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                       <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                       <feOffset/>
                       <feGaussianBlur stdDeviation="20"/>
                       <feComposite in2="hardAlpha" operator="out"/>
                       <feColorMatrix type="matrix" values="0 0 0 0 0.686275 0 0 0 0 0.635294 0 0 0 0 1 0 0 0 0.3 0"/>
                       <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_199_49"/>
                       <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                       <feOffset/>
                       <feGaussianBlur stdDeviation="7.5"/>
                       <feComposite in2="hardAlpha" operator="out"/>
                       <feColorMatrix type="matrix" values="0 0 0 0 0.482353 0 0 0 0 0.380392 0 0 0 0 1 0 0 0 0.4 0"/>
                       <feBlend mode="normal" in2="effect1_dropShadow_199_49" result="effect2_dropShadow_199_49"/>
                       <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_199_49" result="shape"/>
                   </filter>
                   <linearGradient id="paint0_linear_199_49" x1="54.0122" y1="34.0527" x2="150.012" y2="130.053" gradientUnits="userSpaceOnUse">
                       <stop stop-color="#AFA2FF"/>
                       <stop offset="1" stop-color="#C57EFF"/>
                   </linearGradient>
               </defs>
           </svg>

          </div>
          <h1 class="brand-name">Minglr</h1>
          <p class="brand-sub">Enter the digital nocturne</p>
        </div>

        <!-- Error banner -->
        @if (error()) {
          <div class="error-banner animate-slide-up">
            <span>⚠️</span> {{ error() }}
          </div>
        }

        <!-- Card wrapping form + social -->
        <div class="form-card animate-slide-up">

        <!-- Form -->
        <form class="reg-form" (ngSubmit)="onRegister()">

          <!-- Full Name -->
          <div class="field-group">
            <label class="field-label">FULL NAME</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input class="field-input" type="text" [(ngModel)]="displayName" name="displayName"
                placeholder="John Doe" autocomplete="name" />
            </div>
          </div>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label">EMAIL ADDRESS</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                </svg>
              </span>
              <input class="field-input" type="email" [(ngModel)]="email" name="email"
                placeholder="john@zone.app" autocomplete="email" />
            </div>
          </div>

          <!-- Password -->
          <div class="field-group">
            <div class="field-label-row">
              <label class="field-label">PASSWORD</label>
              <span class="forgot-link" (click)="goToLogin()">FORGOT?</span>
            </div>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input class="field-input" [type]="showPwd() ? 'text' : 'password'"
                [(ngModel)]="password" name="password"
                placeholder="••••••••" autocomplete="new-password" />
              <button type="button" class="pwd-toggle" (click)="showPwd.set(!showPwd())">
                {{ showPwd() ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button class="btn-create" type="submit" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span> Creating your zone...
            } @else {
              Create Account →
            }
          </button>

        </form>

        <!-- Divider -->
        <div class="divider-row">
          <span class="divider-line"></span>
          <span class="divider-text">OR SECURE CONNECT</span>
          <span class="divider-line"></span>
        </div>

        <!-- Social buttons -->
        <div class="social-row">
          <button class="social-btn" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            GOOGLE
          </button>
          <button class="social-btn" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            APPLE ID
          </button>
        </div>

        </div><!-- /form-card -->

        <!-- Footer -->
        <p class="footer-text">
          Already have an account? <span (click)="goToLogin()">Log In</span>
        </p>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .register-screen {
      width: 100%; max-width: 430px; height: 100dvh;
      margin: 0 auto; overflow: hidden;
      background: radial-gradient(ellipse at 50% 0%, rgba(100,60,200,0.22) 0%, transparent 60%),
                  radial-gradient(ellipse at 80% 100%, rgba(140,40,200,0.1) 0%, transparent 50%),
                  #08080F;
      display: flex; flex-direction: column;
    }

    .scroll-body {
      flex: 1; min-height: 0;
      overflow-y: auto; overflow-x: hidden;
      padding: calc(env(safe-area-inset-top, 0px) + 32px) 28px
               calc(env(safe-area-inset-bottom, 0px) + 32px);
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    /* ── Brand block ─────────────────────────── */
    .brand-block {
      display: flex; flex-direction: column;
      align-items: center; text-align: center;
      margin-bottom: 32px;
    }

    .avatar-wrap { margin-bottom: 4px; }

    .brand-svg {
      animation: svg-pulse-glow 2s ease-in-out infinite;
    }

    @keyframes svg-pulse-glow {
      0%, 100% { filter: drop-shadow(0 0 10px rgba(124,58,237,0.5)) drop-shadow(0 0 20px rgba(124,58,237,0.3)); }
      50%       { filter: drop-shadow(0 0 20px rgba(124,58,237,0.9)) drop-shadow(0 0 40px rgba(124,58,237,0.6)); }
    }

    .brand-name {
      font-size: 48px; font-weight: 700;
      font-family: 'Space Grotesk', sans-serif;
      background: linear-gradient(to bottom, #FFFFFF, #AFA2FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: -50px;
      background-clip: text;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
      filter: drop-shadow(0 0 24px rgba(116, 89, 247, 0.20));
    }

    .brand-sub {
      font-size: 16px;
      font-family: 'inter', sans-serif;
      color: #AAA8C3;
    }

    /* ── Error banner ────────────────────────── */
    .error-banner {
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.35);
      border-radius: 12px;
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

    /* ── Form ────────────────────────────────── */
    .form-card {
      background: #17172F;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 40px;
      padding: 32px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5),
                  0 0 0 1px rgba(255,255,255,0.05),
                  0 0 80px 20px rgba(116, 89, 247, 0.20);
      margin-bottom: 20px;

    }

    .reg-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; }

    .field-group { display: flex; flex-direction: column; gap: 7px; }

    .field-label-row {
      display: flex; align-items: center; justify-content: space-between;
    }

    .field-label {
      font-size: 10px; font-weight: 800;
      color: #AFA2FF;
      letter-spacing: 2.5px; text-transform: uppercase;
    }

    .forgot-link {
      font-size: 10px; font-weight: 900;
      color: #C57EFF;
      letter-spacing: 1px; cursor: pointer;
      &:hover { color: #AFA2FF; }
    }

    .field-wrap {
      position: relative;
      display: flex; align-items: center;
      background: #0F0F1E;
      border: 1px solid rgba(124,58,237,0.2);
      border-radius: 9999px;
      overflow: hidden;
      transition: border-color 0.2s;
      &:focus-within {
        border-color: rgba(167,139,250,0.55);
        box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
      }
    }

    .field-icon {
      flex-shrink: 0;
      width: 44px; display: flex; align-items: center; justify-content: center;
      color: rgba(167,139,250,0.5);
    }

    .field-input {
      flex: 1;
      background: none; border: none; outline: none;
      color: #FFFFFF;
      font-size: 15px; font-family: inherit;
      padding: 15px 14px 15px 0;
      &::placeholder { color: rgba(255,255,255,0.2); }
      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus,
      &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #0F0F1E inset !important;
        -webkit-text-fill-color: #FFFFFF !important;
        caret-color: #FFFFFF;
        transition: background-color 9999s ease-in-out 0s;
      }
    }

    .pwd-toggle {
      background: none; border: none; cursor: pointer;
      font-size: 15px; padding: 0 14px; color: rgba(255,255,255,0.4);
    }

    /* ── Create Account button ───────────────── */
    .btn-create {
      width: 100%; padding: 17px;
      border-radius: 50px; border: none; cursor: pointer;
      background: linear-gradient(to right, #AFA2FF, #7459F7);
      color: #000000;
      font-size: 16px; font-weight: 700; font-family: inherit;
      letter-spacing: 0.3px;
      box-shadow: 0 10px 30px rgba(175,162,255,0.4);
      transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      &:hover:not(:disabled) { box-shadow: 0 8px 36px rgba(116,89,247,0.6); transform: translateY(-1px); }
      &:active:not(:disabled) { transform: scale(0.97); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Divider ─────────────────────────────── */
    .divider-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 20px;
    }
    .divider-line {
      flex: 1; height: 1px;
      background: rgba(124,58,237,0.2);
    }
    .divider-text {
      font-size: 10px; font-weight: 600;
      color: rgba(167,139,250,0.4);
      letter-spacing: 1px; white-space: nowrap;
    }

    /* ── Social buttons ──────────────────────── */
    .social-row {
      display: flex; gap: 12px;
      margin-bottom: 32px;
    }
    .social-btn {
      flex: 1; padding: 13px 12px;
      border-radius: 9999px; cursor: pointer;
      background: #0F0F1E;
      border: 1px solid rgba(124,58,237,0.2);
      color: rgba(255,255,255,0.7);
      font-size: 13px; font-weight: 600; font-family: inherit;
      letter-spacing: 0.5px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s;
      &:hover { border-color: rgba(167,139,250,0.4); color: #fff; }
    }

    /* ── Footer ──────────────────────────────── */
    .footer-text {
      text-align: center;
      font-size: 14px; color: rgba(255,255,255,0.35);
      span {
        color: #AFA2FF; font-weight: 600; cursor: pointer;
        margin-left: 4px;
        &:hover { text-decoration: underline; }
      }
    }
  `]
})
export class RegisterComponent {
  displayName  = '';
  email        = '';
  password     = '';
  loading      = signal(false);
  error        = signal('');
  showPwd      = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  canSubmit(): boolean {
    return !!(this.displayName.trim() && this.email.trim() && this.password.length > 0);
  }

  // Auto-generate a username from the display name
  private toUsername(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  async onRegister() {
    // Client-side validation — show errors in the banner
    if (!this.displayName.trim()) {
      this.error.set('Please enter your full name.');
      return;
    }
    if (!this.email.trim()) {
      this.error.set('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    if (!this.password) {
      this.error.set('Please enter a password.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }

    this.error.set('');
    this.loading.set(true);
    try {
      const username = this.toUsername(this.displayName) || 'user_' + Date.now();
      await this.authService.register(
        username,
        this.displayName.trim(),
        this.email.trim().toLowerCase(),
        this.password,
        'chill'
      );
      this.router.navigate(['/onboarding']);
    } catch (err: unknown) {
      const httpErr = err as HttpErrorResponse;
      this.error.set(httpErr?.error?.error ?? 'Registration failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  goBack()    { this.router.navigate(['/splash']); }
  goToLogin() { this.router.navigate(['/login']); }
}
