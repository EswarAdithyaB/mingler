import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  loading  = signal(false);
  error    = signal('');
  showPwd  = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    // Client-side validation — show errors in the banner
    if (!this.username.trim()) {
      this.error.set('Please enter your username.');
      return;
    }
    if (!this.password) {
      this.error.set('Please enter your password.');
      return;
    }

    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.login(this.username.trim(), this.password);
      this.router.navigate(['/onboarding']);
    } catch (err: unknown) {
      const httpErr = err as HttpErrorResponse;
      this.error.set(
        httpErr?.error?.error ?? 'Sign in failed. Please try again.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  goBack()       { this.router.navigate(['/splash']); }
  goToRegister() { this.router.navigate(['/register']); }
}
