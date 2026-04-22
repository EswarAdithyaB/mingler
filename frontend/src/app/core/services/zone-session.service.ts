import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

const SESSION_KEY  = 'mingler_zone_session';
const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes

export interface ZoneSession {
  zoneId: string;
  zoneName: string;
  enteredAt: number;   // timestamp
  lastActiveAt: number; // timestamp – updated on any user interaction
}

@Injectable({ providedIn: 'root' })
export class ZoneSessionService {

  /** Current active session (null = not in any zone) */
  private _session = signal<ZoneSession | null>(this._loadFromStorage());

  /** Public read-only computed */
  session   = computed(() => this._session());
  isInZone  = computed(() => this._session() !== null);
  activeZoneId   = computed(() => this._session()?.zoneId   ?? null);
  activeZoneName = computed(() => this._session()?.zoneName ?? null);

  private _inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {
    // If we already have a session, restart the inactivity clock
    if (this._session()) {
      this._resetInactivityTimer();
    }

    // Refresh the last-active timestamp on any touch/click/keypress
    this._bindActivityListeners();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Call this when user clicks "Enter Zone" and the entry animation finishes */
  enterZone(zoneId: string, zoneName: string): void {
    const session: ZoneSession = {
      zoneId,
      zoneName,
      enteredAt:    Date.now(),
      lastActiveAt: Date.now()
    };
    this._session.set(session);
    this._saveToStorage(session);
    this._resetInactivityTimer();
  }

  /** Explicitly leave the zone (e.g. user taps Leave) */
  leaveZone(): void {
    this._clearSession();
  }

  /** Touch the session to reset inactivity timer — called automatically on user activity */
  touchActivity(): void {
    const s = this._session();
    if (!s) return;
    const updated = { ...s, lastActiveAt: Date.now() };
    this._session.set(updated);
    this._saveToStorage(updated);
    this._resetInactivityTimer();
  }

  /** Check whether session is still valid (not expired) */
  isSessionValid(): boolean {
    const s = this._session();
    if (!s) return false;
    return Date.now() - s.lastActiveAt < INACTIVITY_MS;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _loadFromStorage(): ZoneSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s: ZoneSession = JSON.parse(raw);
      // Validate on load — if already expired, discard
      if (Date.now() - s.lastActiveAt >= INACTIVITY_MS) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }

  private _saveToStorage(session: ZoneSession): void {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch { /* quota exceeded — fail silently */ }
  }

  private _clearSession(): void {
    this._session.set(null);
    sessionStorage.removeItem(SESSION_KEY);
    if (this._inactivityTimer) {
      clearTimeout(this._inactivityTimer);
      this._inactivityTimer = null;
    }
  }

  private _resetInactivityTimer(): void {
    if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
    this._inactivityTimer = setTimeout(() => {
      this._onInactivityExpired();
    }, INACTIVITY_MS);
  }

  private _onInactivityExpired(): void {
    const s = this._session();
    if (!s) return;
    console.log('[ZoneSession] Inactivity timeout — leaving zone:', s.zoneId);
    this._clearSession();
    // Navigate to map with an expiry flag so the UI can show a toast
    this.router.navigate(['/app/map'], { queryParams: { sessionExpired: '1' } });
  }

  private _boundHandler: () => void = () => this.touchActivity();

  private _bindActivityListeners(): void {
    // Passive listeners — won't block scrolling
    ['touchstart', 'touchmove', 'click', 'keydown'].forEach(evt =>
      document.addEventListener(evt, this._boundHandler, { passive: true })
    );
  }

  /** Call if you need to fully destroy (e.g. in tests) */
  destroy(): void {
    ['touchstart', 'touchmove', 'click', 'keydown'].forEach(evt =>
      document.removeEventListener(evt, this._boundHandler)
    );
    if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
  }
}
