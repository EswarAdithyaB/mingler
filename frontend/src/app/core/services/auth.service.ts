import { Injectable, signal } from '@angular/core';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('minglr_user');
    if (stored) {
      this.currentUser.set(JSON.parse(stored));
      this.isLoggedIn.set(true);
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    // Simulate API call
    await this.delay(800);
    const user: User = {
      id: 'usr_' + Math.random().toString(36).slice(2, 9),
      username,
      displayName: username,
      isAnonymous: false,
      isOnline: true,
      vibe: 'chill'
    };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    localStorage.setItem('minglr_user', JSON.stringify(user));
    return true;
  }

  async register(username: string, email: string, password: string): Promise<boolean> {
    await this.delay(800);
    const user: User = {
      id: 'usr_' + Math.random().toString(36).slice(2, 9),
      username,
      displayName: username,
      isAnonymous: false,
      isOnline: true,
      vibe: 'chill'
    };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    localStorage.setItem('minglr_user', JSON.stringify(user));
    return true;
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem('minglr_user');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
