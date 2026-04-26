import { Component, signal, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 PASTE YOUR HUGGING FACE TOKEN HERE
//    Get one free at https://huggingface.co/settings/tokens  (Read access)
// ─────────────────────────────────────────────────────────────────────────────
// Backend proxy — calls Qwen Image Edit (HF) server-side with the selfie
const AVATAR_API = 'http://localhost:3000/api/avatar/generate';
const DEFAULT_PROMPT =
  'Transform this person into an animated cartoon avatar, ' +
  'cool neon background, studio lighting, vibrant colors, ' +
  'digital art style, high resolution, sharp focus, no text, no watermark';

type Stage = 'idle' | 'camera' | 'preview' | 'generating' | 'result' | 'error';

@Component({
  selector: 'app-avatar-gen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="root">

      <!-- ── HEADER ── -->
      <div class="header">
        <button class="back-btn" (click)="goBack()">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="header-center">
          <h2 class="header-title">Avatar Generator</h2>
          <span class="header-sub">AI-powered animated portrait</span>
        </div>
        <div style="width:36px"></div>
      </div>

      <!-- ── BODY ── -->
      <div class="body">

        <!-- ════ IDLE — intro card ════ -->
        @if (stage() === 'idle') {
          <div class="intro-card animate-up">
            <div class="ai-orb">
              <div class="orb-ring r1"></div>
              <div class="orb-ring r2"></div>
              <span class="orb-emoji">✨</span>
            </div>
            <h3 class="intro-title">Create Your Animated Avatar</h3>
            <p class="intro-desc">
              Take a selfie and our AI will generate a stunning animated portrait
              that closely matches your facial features.
            </p>
            <div class="steps-row">
              <div class="step"><span class="step-num">1</span><span class="step-label">Selfie</span></div>
              <div class="step-arrow">›</div>
              <div class="step"><span class="step-num">2</span><span class="step-label">AI Magic</span></div>
              <div class="step-arrow">›</div>
              <div class="step"><span class="step-num">3</span><span class="step-label">Avatar</span></div>
            </div>
            <button class="primary-btn" (click)="startCamera()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="white" stroke-width="2"/>
              </svg>
              Open Camera
            </button>
          </div>
        }

        <!-- ════ CAMERA — live feed ════ -->
        @if (stage() === 'camera') {
          <div class="camera-wrap animate-up">
            <div class="camera-frame">
              <video #videoEl class="video-feed" autoplay playsinline muted></video>
              <!-- face guide overlay -->
              <div class="face-guide">
                <div class="guide-oval"></div>
                <span class="guide-hint">Align your face inside the oval</span>
              </div>
              <!-- corner accents -->
              <div class="corner tl"></div>
              <div class="corner tr"></div>
              <div class="corner bl"></div>
              <div class="corner br"></div>
            </div>
            <div class="camera-actions">
              <button class="ghost-btn" (click)="stopCamera()">Cancel</button>
              <button class="shutter-btn" (click)="takeSnapshot()">
                <div class="shutter-inner"></div>
              </button>
              <button class="ghost-btn" (click)="flipCamera()">Flip</button>
            </div>
          </div>
        }

        <!-- ════ PREVIEW — review selfie ════ -->
        @if (stage() === 'preview') {
          <div class="preview-wrap animate-up">
            <div class="preview-frame">
              <img [src]="selfieDataUrl()" class="preview-img" alt="Selfie preview"/>
              <div class="preview-badge">Your Selfie</div>
            </div>
            <p class="preview-hint">Looking good! Generate your animated avatar now.</p>
            <div class="prompt-box">
              <span class="prompt-label">AI PROMPT</span>
              <p class="prompt-text">{{ prompt }}</p>
            </div>
            <div class="preview-actions">
              <button class="ghost-btn" (click)="retake()">Retake</button>
              <button class="primary-btn" (click)="generate()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
                </svg>
                Generate Avatar
              </button>
            </div>
          </div>
        }

        <!-- ════ GENERATING — loading ════ -->
        @if (stage() === 'generating') {
          <div class="generating-wrap animate-up">
            <div class="gen-orb">
              <div class="gen-ring gr1"></div>
              <div class="gen-ring gr2"></div>
              <div class="gen-ring gr3"></div>
              <span class="gen-icon">🎨</span>
            </div>
            <h3 class="gen-title">Generating Your Avatar</h3>
            <p class="gen-sub">Transforming your selfie into an avatar…</p>
            <div class="progress-track">
              <div class="progress-fill"></div>
            </div>
            <div class="gen-steps">
              @for (s of genSteps; track s.label) {
                <div class="gen-step" [class.active]="s.active" [class.done]="s.done">
                  <span class="gs-dot"></span>
                  <span class="gs-label">{{ s.label }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- ════ RESULT — show avatar ════ -->
        @if (stage() === 'result') {
          <div class="result-wrap animate-up">
            <div class="result-header-row">
              <span class="result-badge">✨ Avatar Ready</span>
            </div>
            <div class="compare-row">
              <!-- Selfie thumb -->
              <div class="compare-card">
                <img [src]="selfieDataUrl()" class="compare-img" alt="Selfie"/>
                <span class="compare-label">You</span>
              </div>
              <div class="compare-arrow">→</div>
              <!-- Generated avatar -->
              <div class="compare-card result-card">
                <img [src]="resultUrl()" class="compare-img" alt="Generated avatar"/>
                <span class="compare-label">Avatar</span>
              </div>
            </div>
            <!-- Full result -->
            <div class="result-full-wrap">
              <img [src]="resultUrl()" class="result-full-img" alt="Your avatar"/>
              <div class="result-glow"></div>
            </div>
            <div class="result-actions">
              <button class="ghost-btn" (click)="retake()">New Selfie</button>
              <button class="primary-btn" (click)="saveAvatar()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Use as Avatar
              </button>
            </div>
          </div>
        }

        <!-- ════ ERROR ════ -->
        @if (stage() === 'error') {
          <div class="error-wrap animate-up">
            <div class="error-icon">⚠️</div>
            <h3 class="error-title">Generation Failed</h3>
            <p class="error-msg">{{ errorMsg() }}</p>
            @if (!hasToken()) {
              <div class="token-guide">
                <p class="token-title">🔑 Setup required:</p>
                <ol class="token-steps">
                  <li>Go to <strong>huggingface.co/settings/tokens</strong></li>
                  <li>Click <strong>"New token"</strong> → Read access</li>
                  <li>Copy and paste it into <strong>avatar-gen.component.ts</strong> → <code>HF_TOKEN</code></li>
                </ol>
              </div>
            }
            <button class="primary-btn" (click)="retake()">Try Again</button>
          </div>
        }

      </div>

      <!-- hidden canvas for snapshot -->
      <canvas #canvasEl style="display:none"></canvas>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    .root {
      display: flex; flex-direction: column; flex: 1; min-height: 0;
      background: #08080F; overflow: hidden;
    }

    /* ── HEADER ── */
    .header {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 14px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
      background: rgba(8,8,15,0.95); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .back-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.10);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      &:active { background: rgba(255,255,255,0.12); }
    }
    .header-center { text-align: center; }
    .header-title { font-size: 17px; font-weight: 800; color: #fff; margin: 0; }
    .header-sub { font-size: 11px; color: rgba(255,255,255,0.4); }

    /* ── BODY ── */
    .body {
      flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;
      padding: 24px 20px calc(var(--nav-height, 70px) + 24px);
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-up { animation: slide-up 0.35s ease both; }

    /* ── SHARED BUTTONS ── */
    .primary-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 16px; border-radius: 9999px; border: none;
      background: linear-gradient(135deg, #AFA2FF, #7B61FF);
      color: #fff; font-size: 15px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 20px rgba(123,97,255,0.4);
      transition: all 0.15s;
      &:active { transform: scale(0.97); }
    }
    .ghost-btn {
      flex: 1; padding: 14px; border-radius: 9999px;
      background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600; cursor: pointer;
      &:active { background: rgba(255,255,255,0.12); }
    }

    /* ── IDLE INTRO ── */
    .intro-card {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; gap: 16px;
    }
    .ai-orb {
      position: relative; width: 120px; height: 120px;
      display: flex; align-items: center; justify-content: center;
      margin: 8px 0;
    }
    .orb-ring {
      position: absolute; border-radius: 50%; border: 1.5px solid rgba(123,97,255,0.35);
      animation: pulse-r 2.5s ease-in-out infinite;
    }
    .r1 { inset: 0; animation-delay: 0s; }
    .r2 { inset: -14px; border-color: rgba(123,97,255,0.15); animation-delay: 0.6s; }
    @keyframes pulse-r {
      0%,100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    .orb-emoji { font-size: 52px; filter: drop-shadow(0 0 16px rgba(175,162,255,0.8)); }
    .intro-title { font-size: 22px; font-weight: 800; color: #fff; margin: 0; }
    .intro-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; margin: 0; }
    .steps-row {
      display: flex; align-items: center; gap: 8px; margin: 4px 0 8px;
    }
    .step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .step-num {
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(123,97,255,0.2); border: 1px solid rgba(123,97,255,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #AFA2FF;
    }
    .step-label { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 600; }
    .step-arrow { font-size: 20px; color: rgba(255,255,255,0.2); margin-bottom: 12px; }

    /* ── CAMERA ── */
    .camera-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .camera-frame {
      position: relative; width: 100%; max-width: 360px;
      border-radius: 24px; overflow: hidden;
      border: 2px solid rgba(123,97,255,0.3);
      box-shadow: 0 0 40px rgba(123,97,255,0.25);
      background: #000; aspect-ratio: 3/4;
    }
    .video-feed { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
    .face-guide {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; pointer-events: none;
    }
    .guide-oval {
      width: 55%; aspect-ratio: 3/4; border-radius: 50%;
      border: 2px dashed rgba(175,162,255,0.5);
    }
    .guide-hint {
      position: absolute; bottom: 16px;
      font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 600;
      background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 9999px;
    }
    .corner {
      position: absolute; width: 20px; height: 20px;
      border-color: #7B61FF; border-style: solid;
    }
    .tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
    .tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
    .bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
    .br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }
    .camera-actions {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; max-width: 360px; gap: 16px;
    }
    .shutter-btn {
      width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
      background: rgba(255,255,255,0.15); border: 3px solid white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
      &:active { transform: scale(0.92); background: rgba(255,255,255,0.3); }
    }
    .shutter-inner {
      width: 52px; height: 52px; border-radius: 50%;
      background: white;
    }

    /* ── PREVIEW ── */
    .preview-wrap { display: flex; flex-direction: column; gap: 16px; }
    .preview-frame {
      position: relative; border-radius: 20px; overflow: hidden;
      border: 2px solid rgba(123,97,255,0.3);
      box-shadow: 0 0 30px rgba(123,97,255,0.2);
    }
    .preview-img { width: 100%; display: block; max-height: 360px; object-fit: cover; transform: scaleX(-1); }
    .preview-badge {
      position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 9999px;
      padding: 4px 14px; font-size: 11px; font-weight: 700; color: #fff;
    }
    .preview-hint { font-size: 13px; color: rgba(255,255,255,0.5); text-align: center; margin: 0; }
    .prompt-box {
      background: rgba(123,97,255,0.08); border: 1px solid rgba(123,97,255,0.2);
      border-radius: 14px; padding: 12px 16px;
    }
    .prompt-label {
      font-size: 9px; font-weight: 800; letter-spacing: 1.5px; color: #7B61FF; display: block; margin-bottom: 6px;
    }
    .prompt-text { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.5; margin: 0; }
    .preview-actions { display: flex; gap: 12px; }

    /* ── GENERATING ── */
    .generating-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center; }
    .gen-orb {
      position: relative; width: 140px; height: 140px;
      display: flex; align-items: center; justify-content: center;
    }
    .gen-ring {
      position: absolute; border-radius: 50%; border: 1.5px solid;
      animation: spin-glow 3s linear infinite;
    }
    .gr1 { inset: 0; border-color: rgba(123,97,255,0.5); animation-duration: 2s; }
    .gr2 { inset: -16px; border-color: rgba(123,97,255,0.25); animation-duration: 3s; animation-direction: reverse; }
    .gr3 { inset: -32px; border-color: rgba(123,97,255,0.1); animation-duration: 4s; }
    @keyframes spin-glow {
      0%   { transform: rotate(0deg)   scale(1);    opacity: 0.6; }
      50%  { transform: rotate(180deg) scale(1.04); opacity: 1; }
      100% { transform: rotate(360deg) scale(1);    opacity: 0.6; }
    }
    .gen-icon { font-size: 58px; filter: drop-shadow(0 0 20px rgba(175,162,255,0.9)); }
    .gen-title { font-size: 22px; font-weight: 800; color: #fff; margin: 0; }
    .gen-sub { font-size: 13px; color: rgba(255,255,255,0.45); margin: 0; }
    .progress-track {
      width: 100%; height: 4px; border-radius: 99px;
      background: rgba(123,97,255,0.2); overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, #7B61FF, #AFA2FF);
      animation: progress-anim 25s linear forwards;
    }
    @keyframes progress-anim { from { width: 0%; } to { width: 95%; } }
    .gen-steps { display: flex; flex-direction: column; gap: 8px; width: 100%; text-align: left; }
    .gen-step {
      display: flex; align-items: center; gap: 10px;
      opacity: 0.3; transition: opacity 0.4s;
      &.active { opacity: 1; }
      &.done { opacity: 0.6; }
    }
    .gs-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      background: rgba(123,97,255,0.4);
      .active & { background: #AFA2FF; box-shadow: 0 0 8px rgba(175,162,255,0.8); }
      .done & { background: #10b981; }
    }
    .gs-label { font-size: 13px; color: rgba(255,255,255,0.7); }

    /* ── RESULT ── */
    .result-wrap { display: flex; flex-direction: column; gap: 16px; }
    .result-header-row { display: flex; justify-content: center; }
    .result-badge {
      background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
      border-radius: 9999px; padding: 5px 16px;
      font-size: 12px; font-weight: 700; color: #10b981;
    }
    .compare-row {
      display: flex; align-items: center; justify-content: center; gap: 12px;
    }
    .compare-card { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
    .compare-img {
      width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 16px;
      border: 2px solid rgba(255,255,255,0.1);
    }
    .result-card .compare-img { border-color: rgba(123,97,255,0.4); box-shadow: 0 0 20px rgba(123,97,255,0.3); }
    .compare-label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; }
    .compare-arrow { font-size: 24px; color: #7B61FF; flex-shrink: 0; }
    .result-full-wrap {
      position: relative; border-radius: 24px; overflow: hidden;
      border: 2px solid rgba(123,97,255,0.35);
    }
    .result-full-img { width: 100%; display: block; }
    .result-glow {
      position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(to top, rgba(123,97,255,0.15), transparent 50%);
    }
    .result-actions { display: flex; gap: 12px; }

    /* ── ERROR ── */
    .error-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
    .error-icon { font-size: 52px; }
    .error-title { font-size: 20px; font-weight: 800; color: #fff; margin: 0; }
    .error-msg { font-size: 13px; color: rgba(255,100,100,0.8); margin: 0; line-height: 1.5; }
    .token-guide {
      background: rgba(255,180,0,0.08); border: 1px solid rgba(255,180,0,0.2);
      border-radius: 16px; padding: 16px; text-align: left; width: 100%;
    }
    .token-title { font-size: 13px; font-weight: 700; color: #fbbf24; margin: 0 0 10px; }
    .token-steps {
      margin: 0; padding-left: 18px;
      li { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px; line-height: 1.5; }
      strong { color: rgba(255,255,255,0.85); }
      code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    }
  `]
})
export class AvatarGenComponent implements OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  stage        = signal<Stage>('idle');
  selfieDataUrl = signal<string | null>(null);
  resultUrl    = signal<string | null>(null);
  errorMsg     = signal<string>('');
  hasToken     = signal(true); // Pollinations.ai — no token required

  prompt = DEFAULT_PROMPT;
  private stream: MediaStream | null = null;
  private facingMode: 'user' | 'environment' = 'user';

  genSteps = [
    { label: 'Connecting to AI model…',    active: false, done: false },
    { label: 'Building composition…',      active: false, done: false },
    { label: 'Applying animation style…',  active: false, done: false },
    { label: 'Adding studio lighting…',    active: false, done: false },
    { label: 'Final render…',              active: false, done: false },
  ];
  private stepTimer?: ReturnType<typeof setInterval>;

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/app/profile']); }

  // ── Camera ────────────────────────────────────────────────────────────────

  async startCamera() {
    this.stage.set('camera');
    await this._openStream();
  }

  private async _openStream() {
    try {
      if (this.stream) this._stopStream();
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      // small delay so ViewChild is rendered
      setTimeout(() => {
        if (this.videoEl?.nativeElement) {
          this.videoEl.nativeElement.srcObject = this.stream;
        }
      }, 100);
    } catch (e: any) {
      this.errorMsg.set('Camera access denied. Please allow camera permission and try again.');
      this.stage.set('error');
    }
  }

  async flipCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    await this._openStream();
  }

  stopCamera() {
    this._stopStream();
    this.stage.set('idle');
  }

  private _stopStream() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  takeSnapshot() {
    const video  = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    // mirror to match preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    this.selfieDataUrl.set(canvas.toDataURL('image/jpeg', 0.92));
    this._stopStream();
    this.stage.set('preview');
  }

  retake() {
    this.selfieDataUrl.set(null);
    this.resultUrl.set(null);
    this.errorMsg.set('');
    this.genSteps.forEach(s => { s.active = false; s.done = false; });
    clearInterval(this.stepTimer);
    this.startCamera();
  }

  // ── Generation ────────────────────────────────────────────────────────────

  async generate() {
    this.stage.set('generating');
    this._startStepAnimation();

    try {
      const resultUrl = await this._generateWithPollinations(this.prompt);
      clearInterval(this.stepTimer);
      this.genSteps.forEach(s => { s.active = false; s.done = true; });
      this.resultUrl.set(resultUrl);
      this.stage.set('result');
    } catch (e: any) {
      clearInterval(this.stepTimer);
      this.errorMsg.set((e as Error).message || 'Something went wrong. Please try again.');
      this.stage.set('error');
    }
  }

  /**
   * POSTs selfie + prompt to backend. Backend handles all queue polling
   * server-side and returns the final image binary directly.
   */
  private async _generateWithPollinations(prompt: string): Promise<string> {
    const selfie = this.selfieDataUrl();
    if (!selfie) throw new Error('No selfie found — please retake the photo.');

    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 150_000); // 2.5 min

    try {
      const response = await fetch(AVATAR_API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageBase64: selfie, prompt }),
        signal:  controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        let msg = `Generation failed (${response.status})`;
        try { const j = await response.json(); msg = j.error ?? msg; } catch {}
        throw new Error(msg);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (e: any) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') throw new Error('Timed out. Please try again.');
      throw e;
    }
  }

  private _startStepAnimation() {
    let idx = 0;
    this.genSteps.forEach(s => { s.active = false; s.done = false; });
    this.genSteps[0].active = true;
    this.stepTimer = setInterval(() => {
      this.genSteps[idx].active = false;
      this.genSteps[idx].done   = true;
      idx++;
      if (idx < this.genSteps.length) {
        this.genSteps[idx].active = true;
      } else {
        clearInterval(this.stepTimer);
      }
    }, 4500);
  }

  private _dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)![1];
    const bytes = atob(data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  saveAvatar() {
    // In a real app this would update the user's profile avatar
    // For now download the image
    const a = document.createElement('a');
    a.href = this.resultUrl()!;
    a.download = 'my-avatar.png';
    a.click();
  }

  ngOnDestroy() {
    this._stopStream();
    clearInterval(this.stepTimer);
    const url = this.resultUrl();
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }
}
