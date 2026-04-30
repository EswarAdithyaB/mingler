import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  step = signal(1);

  constructor(private router: Router) {}

  nextStep()   { this.step.set(2); }
  prevStep()   { this.step.set(1); }
  goBack()     { this.router.navigate(['/splash']); }
  getStarted() { this.router.navigate(['/app/map']); }
}
