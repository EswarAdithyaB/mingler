import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models';

const API = '/api';   // proxied to http://localhost:3000 by angular.json → proxy.conf.json
const TOKEN_KEY = 'minglr_token';
const USER_KEY  = 'minglr_user';

/* Raw shape returned by the backend (snake_case) */
interface ApiUser {
  id: string;
  username: string;
  display_name: string;
  email: string;
  vibe: string;
  is_anonymous: boolean;
  is_online: boolean;
  current_zone_id: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
}

interface AuthResponse {
  token: string;
  user: ApiUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  currentUser = signal<User | null>(null);
  isLoggedIn  = signal<boolean>(false);

  constructor() {
    this.restoreSession();
  }

  // ── Map backend snake_case → frontend camelCase ────────────────────────────
  private toUser(api: ApiUser): User {
    return {
      id:            api.id,
      username:      api.username,
      displayName:   api.display_name,
      email:         api.email,
      vibe:          api.vibe,
      isAnonymous:   api.is_anonymous,
      isOnline:      api.is_online,
      currentZoneId: api.current_zone_id ?? undefined,
      settings:      api.settings ?? {},
      createdAt:     api.created_at
    };
  }

  // ── Persist session ────────────────────────────────────────────────────────
  private saveSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  private restoreSession(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    if (token && raw) {
      try {
        this.currentUser.set(JSON.parse(raw) as User);
        this.isLoggedIn.set(true);
      } catch {
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  // ── Auth actions ───────────────────────────────────────────────────────────

  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${API}/auth/login`, { username, password })
    );
    this.saveSession(res.token, this.toUser(res.user));
  }

  async register(
    username: string,
    displayName: string,
    email: string,
    password: string,
    vibe: string
  ): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${API}/auth/register`, {
        username, displayName, email, password, vibe
      })
    );
    this.saveSession(res.token, this.toUser(res.user));
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${API}/auth/logout`, {})
      );
    } catch { /* ignore network errors on logout */ }
    this.clearSession();
  }

  /** Refresh user data from the server (e.g. after settings update) */
  async refreshUser(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ user: ApiUser }>(`${API}/auth/me`)
      );
      const user = this.toUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.currentUser.set(user);
    } catch { /* token expired — clear session */
      this.clearSession();
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
