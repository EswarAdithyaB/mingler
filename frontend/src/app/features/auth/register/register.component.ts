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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
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
