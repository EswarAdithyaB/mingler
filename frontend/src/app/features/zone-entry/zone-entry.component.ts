import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ZoneSessionService } from '../../core/services/zone-session.service';

const STEPS = [
  'Syncing your avatar...',
  'Scanning zone frequencies...',
  'Connecting to nearby strangers...',
  'Almost there...'
];

@Component({
  selector: 'app-zone-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zone-entry.component.html',
  styleUrls: ['./zone-entry.component.scss']
})
export class ZoneEntryComponent implements OnInit, OnDestroy {
  zoneName = 'Neon Arena';
  avatarEmoji = '🧑‍🎤';

  progress  = signal(0);
  currentStep = signal(STEPS[0]);

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zoneSession: ZoneSessionService
  ) {}

  ngOnInit() {
    // Read zone name from route params or query
    const name = this.route.snapshot.queryParamMap.get('name');
    if (name) this.zoneName = decodeURIComponent(name);

    this.runSequence();
  }

  ngOnDestroy() { this.timers.forEach(t => clearTimeout(t)); }

  private runSequence() {
    const schedule = (fn: () => void, ms: number) => {
      this.timers.push(setTimeout(fn, ms));
    };

    // Step through progress & labels
    schedule(() => { this.progress.set(20); this.currentStep.set(STEPS[0]); },  300);
    schedule(() => { this.progress.set(45); this.currentStep.set(STEPS[1]); }, 1100);
    schedule(() => { this.progress.set(70); this.currentStep.set(STEPS[2]); }, 1900);
    schedule(() => { this.progress.set(90); this.currentStep.set(STEPS[3]); }, 2600);
    schedule(() => { this.progress.set(100); },                                3100);

    // Navigate away once 100% is reached — also save zone session
    schedule(() => {
      const zoneId   = this.route.snapshot.paramMap.get('id') || 'zone_001';
      const zoneName = this.route.snapshot.queryParamMap.get('name') || this.zoneName;
      // Persist the session so guards and map can detect it
      this.zoneSession.enterZone(zoneId, decodeURIComponent(zoneName));
      this.router.navigate(['/app/zone', zoneId]);
    }, 3600);
  }
}
