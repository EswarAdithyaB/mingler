import { Component, signal, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  templateUrl: './avatar-gen.component.html',
  styleUrls: ['./avatar-gen.component.scss']
})
export class AvatarGenComponent implements OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  stage        = signal<Stage>('idle');
  selfieDataUrl = signal<string | null>(null);
  resultUrl    = signal<string | null>(null);
  errorMsg     = signal<string>('');
  hasToken     = signal(true);

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

  private async _generateWithPollinations(prompt: string): Promise<string> {
    const selfie = this.selfieDataUrl();
    if (!selfie) throw new Error('No selfie found — please retake the photo.');

    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 150_000);

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

  saveAvatar() {
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
