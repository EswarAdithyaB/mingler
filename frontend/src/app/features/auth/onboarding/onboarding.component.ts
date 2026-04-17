import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="onboarding-shell">

      <!-- ─── SLIDE 1 ─── -->
      @if (step() === 1) {
        <div class="slide slide-1 animate-fade-in">

          <!-- Top bar -->
          <div class="top-bar">
            <button class="back-btn" (click)="goBack()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div class="step-dots">
              <span class="dot"></span>
              <span class="dot active"></span>
              <span class="dot"></span>
            </div>
          </div>

          <!-- Illustration area -->
          <div class="illustration-wrap">
            <!-- Floating icons -->
            <div class="float-icon fi-chat">💬</div>
            <div class="float-icon fi-game">🎮</div>
            <div class="float-icon fi-heart">💜</div>

            <!-- Circle with characters -->
            <div class="avatar-circle">
              <div class="circle-glow"></div>
              <div class="characters">
                <span class="char char-left">🧑‍🦱</span>
                <span class="char char-center">👩‍🦰</span>
                <span class="char char-right">👩‍🦳</span>
              </div>
            </div>
          </div>

          <!-- Text content -->
          <div class="text-block">
            <h1 class="slide-title">Play. Connect.<br>Vibe.</h1>
            <p class="slide-desc">
              Join games, share your vibe, and make real connections
              with people around you right now.
            </p>
          </div>

          <!-- CTA -->
          <div class="cta-block">
            <button class="btn-next" (click)="nextStep()">
              NEXT &nbsp;→
            </button>
          </div>

          <!-- Bottom handle -->
          <div class="bottom-handle"></div>
        </div>
      }

      <!-- ─── SLIDE 2 ─── -->
      @if (step() === 2) {
        <div class="slide slide-2 animate-fade-in">

          <!-- Top bar -->
          <div class="top-bar">
            <button class="back-btn" (click)="prevStep()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div class="step-dots">
              <span class="dot"></span>
              <span class="dot active"></span>
            </div>
          </div>

          <!-- Illustration area -->
          <div class="illustration-wrap-2">
            <!-- Floating icons -->
            <div class="float-icon fi2-chat">💬</div>
            <div class="float-icon fi2-shield">🛡️</div>

            <!-- Lock card -->
            <div class="lock-card">
              <div class="lock-card-inner">
                <span class="lock-emoji">🔒</span>
              </div>
            </div>
          </div>

          <!-- Text content -->
          <div class="text-block text-block-2">
            <h1 class="slide-title">Say What You Feel <span class="think-emoji">🤔</span></h1>
            <p class="slide-desc">
              Confess anonymously. Vent freely.<br>
              Talk to someone nearby. This stays in the zone.
            </p>
          </div>

          <!-- CTA -->
          <div class="cta-block">
            <button class="btn-get-started" (click)="getStarted()">
              Get Started 🚀
            </button>
            <p class="privacy-note">TERMS OF PRIVACY APPLY</p>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .onboarding-shell {
      width: 100%;
      height: 100dvh;
      max-width: 430px;
      margin: 0 auto;
      background: #08080F;
      overflow: hidden;
      position: relative;
    }

    /* ── Slide base ─────────────────────────────── */
    .slide {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0 28px;
      background: radial-gradient(ellipse at 50% 10%, rgba(80,40,160,0.28) 0%, transparent 65%),
                  radial-gradient(ellipse at 80% 90%, rgba(140,40,200,0.12) 0%, transparent 50%),
                  #08080F;
    }

    /* ── Top bar ─────────────────────────────────── */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: max(env(safe-area-inset-top, 0px), 20px);
      padding-top: calc(env(safe-area-inset-top, 0px) + 20px);
      margin-bottom: 8px;
      flex-shrink: 0;
    }

    .back-btn {
      width: 36px; height: 36px;
      background: none; border: none;
      color: #A78BFA; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
      &:active { background: rgba(124,58,237,0.12); }
    }

    .step-dots {
      display: flex; gap: 8px; align-items: center;
    }
    .dot {
      width: 8px; height: 8px; border-radius: 4px;
      background: rgba(255,255,255,0.18);
      transition: all 0.3s;
    }
    .dot.active {
      width: 24px;
      background: #8B5CF6;
      box-shadow: 0 0 8px rgba(139,92,246,0.7);
    }

    /* ── Slide 1 illustration ─────────────────── */
    .illustration-wrap {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    .avatar-circle {
      width: min(280px, 75vw);
      height: min(280px, 75vw);
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, #1a1230, #0d0d1a);
      border: 1.5px solid rgba(124,58,237,0.25);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 60px rgba(80,40,160,0.35), inset 0 0 40px rgba(0,0,0,0.5);
    }

    .circle-glow {
      position: absolute;
      inset: 0; border-radius: 50%;
      background: radial-gradient(circle at 50% 30%, rgba(124,58,237,0.15) 0%, transparent 70%);
    }

    .characters {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 4px;
      padding-bottom: 10px;
      z-index: 1;
    }
    .char { line-height: 1; }
    .char-left  { font-size: 72px; transform: translateY(4px); }
    .char-center{ font-size: 88px; }
    .char-right { font-size: 72px; transform: translateY(4px); }

    /* Floating icons – slide 1 */
    .float-icon {
      position: absolute;
      font-size: 22px;
      animation: float-gentle 3s ease-in-out infinite;
    }
    .fi-chat  { top: 12%; right: 8%;  animation-delay: 0s;    background: #22C55E; border-radius: 8px; padding: 7px; font-size: 18px; }
    .fi-game  { left: 2%; top: 45%;  animation-delay: 0.7s; background: rgba(30,20,60,0.8); border: 1px solid rgba(124,58,237,0.4); border-radius: 8px; padding: 7px; font-size: 16px; }
    .fi-heart { bottom: 15%; right: 5%; animation-delay: 1.4s; font-size: 26px; }

    /* ── Slide 2 illustration ─────────────────── */
    .illustration-wrap-2 {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    .lock-card {
      width: min(160px, 42vw);
      height: min(160px, 42vw);
      border-radius: 32px;
      background: linear-gradient(135deg, #F59E0B, #F97316, #A855F7);
      padding: 4px;
      box-shadow: 0 0 60px rgba(168,85,247,0.5), 0 0 30px rgba(245,158,11,0.3);
      animation: lock-pulse 3s ease-in-out infinite;
    }
    .lock-card-inner {
      width: 100%; height: 100%;
      border-radius: 28px;
      background: #111128;
      display: flex; align-items: center; justify-content: center;
    }
    .lock-emoji { font-size: 64px; }

    /* Floating icons – slide 2 */
    .fi2-chat {
      position: absolute;
      top: 10%; right: 10%;
      font-size: 20px;
      animation: float-gentle 3s ease-in-out infinite;
      color: rgba(167,139,250,0.7);
    }
    .fi2-shield {
      position: absolute;
      bottom: 22%; left: 12%;
      font-size: 20px;
      animation: float-gentle 3s ease-in-out infinite 1s;
    }

    @keyframes float-gentle {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes lock-pulse {
      0%, 100% { box-shadow: 0 0 60px rgba(168,85,247,0.5), 0 0 30px rgba(245,158,11,0.3); }
      50%       { box-shadow: 0 0 80px rgba(168,85,247,0.7), 0 0 50px rgba(245,158,11,0.5); }
    }

    /* ── Text block ──────────────────────────── */
    .text-block {
      flex-shrink: 0;
      text-align: center;
      padding: 0 4px 24px;
    }
    .text-block-2 { padding-bottom: 20px; }

    .slide-title {
      font-size: 34px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.15;
      letter-spacing: -0.5px;
      margin-bottom: 16px;
    }
    .think-emoji { font-size: 28px; vertical-align: middle; }

    .slide-desc {
      font-size: 15px;
      color: rgba(200,190,230,0.75);
      line-height: 1.65;
      max-width: 300px;
      margin: 0 auto;
    }

    /* ── CTA block ───────────────────────────── */
    .cta-block {
      flex-shrink: 0;
      padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 32px);
    }

    .btn-next {
      width: 100%;
      padding: 18px 24px;
      border-radius: 50px;
      border: none;
      background: rgba(139,92,246,0.55);
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1.5px;
      cursor: pointer;
      transition: all 0.2s;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 24px rgba(139,92,246,0.3);
      &:active { transform: scale(0.97); }
      &:hover  { background: rgba(139,92,246,0.7); box-shadow: 0 6px 32px rgba(139,92,246,0.5); }
    }

    .btn-get-started {
      width: 100%;
      padding: 18px 24px;
      border-radius: 50px;
      border: none;
      background: linear-gradient(135deg, #8B5CF6, #EC4899);
      color: #FFFFFF;
      font-size: 17px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 6px 32px rgba(139,92,246,0.45);
      margin-bottom: 16px;
      &:active { transform: scale(0.97); }
      &:hover  { box-shadow: 0 8px 40px rgba(139,92,246,0.65); }
    }

    .privacy-note {
      text-align: center;
      font-size: 11px;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.25);
      font-weight: 500;
    }

    /* ── Bottom handle (slide 1) ─────────────── */
    .bottom-handle {
      flex-shrink: 0;
      width: 120px; height: 4px;
      background: rgba(255,255,255,0.12);
      border-radius: 2px;
      margin: 0 auto;
      margin-bottom: max(env(safe-area-inset-bottom, 0px), 12px);
    }

    /* ── Slide-level fade ────────────────────── */
    .animate-fade-in { animation: fade-in 0.35s ease forwards; }
    @keyframes fade-in { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class OnboardingComponent {
  step = signal(1);

  constructor(private router: Router) {}

  nextStep()   { this.step.set(2); }
  prevStep()   { this.step.set(1); }
  goBack()     { this.router.navigate(['/splash']); }
  getStarted() { this.router.navigate(['/app/map']); }
}
