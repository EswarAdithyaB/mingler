import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Vibe {
  id: string;
  emoji: string;
  label: string;
}

const VIBES: Vibe[] = [
  { id: 'hyped',        emoji: '🔥', label: 'Hyped'         },
  { id: 'chill',        emoji: '😌', label: 'Chill'         },
  { id: 'lonely',       emoji: '💜', label: 'Lonely'        },
  { id: 'lets-play',    emoji: '🎮', label: "Let's Play"    },
  { id: 'need-to-talk', emoji: '🗣️', label: 'Need to Talk'  },
  { id: 'just-vibing',  emoji: '👻', label: 'Just Vibing'   },
];

@Component({
  selector: 'app-vibe-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vibe-check.component.html',
  styleUrls: ['./vibe-check.component.scss']
})
export class VibeCheckComponent {
  vibes = VIBES;
  selected = signal<string | null>(null);
  showAlert = signal(false);
  zoneName = 'SHIBUYA DISTRICT';

  private alertTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    const name = this.route.snapshot.queryParamMap.get('name');
    if (name) this.zoneName = decodeURIComponent(name).toUpperCase();
  }

  goBack() { this.router.navigate(['/app/map']); }

  select(id: string) {
    this.selected.set(id);
    this.showAlert.set(false);
  }

  proceed() {
    if (!this.selected()) {
      this.showAlert.set(true);
      if (this.alertTimer) clearTimeout(this.alertTimer);
      this.alertTimer = setTimeout(() => this.showAlert.set(false), 3000);
      return;
    }
    const zoneId = this.route.snapshot.paramMap.get('id') || 'zone_001';
    const name   = this.route.snapshot.queryParamMap.get('name') || '';
    this.router.navigate(['/app/zone-entry', zoneId], {
      queryParams: { name, vibe: this.selected() }
    });
  }
}
