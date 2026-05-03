import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type NotifType = 'zone' | 'game' | 'confession' | 'discovery' | 'mention';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  hasActions?: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {

  notifications = signal<Notification[]>([
    {
      id: 'n1',
      type: 'zone',
      title: 'Alex entered your Zone',
      description: "Ghost_Rider has entered 'The Neon District'. They're just 200m away from you.",
      timeAgo: '2M AGO',
      read: false
    },
    {
      id: 'n2',
      type: 'game',
      title: 'Game Invitation',
      description: "Symmetry_Zero challenged you to 'Binary Duel'.",
      timeAgo: '15M AGO',
      read: false,
      hasActions: true
    },
    {
      id: 'n3',
      type: 'confession',
      title: 'Anonymous Response',
      description: 'Someone resonated with your last confession: "I feel the same way..."',
      timeAgo: '1H AGO',
      read: false
    },
    {
      id: 'n4',
      type: 'discovery',
      title: 'New Zone Discovered',
      description: "'Cyber Garden' has appeared 1.2km from your current location.",
      timeAgo: '3H AGO',
      read: true
    },
    {
      id: 'n5',
      type: 'mention',
      title: 'You were mentioned',
      description: 'V_Nomad tagged you: "Who\'s ready for the weekend raid?"',
      timeAgo: 'YESTERDAY',
      read: true
    }
  ]);

  markRead(n: Notification) {
    this.notifications.update(list =>
      list.map(item => item.id === n.id ? { ...item, read: true } : item)
    );
  }

  markAllRead() {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  acceptInvite(n: Notification, e: Event) {
    e.stopPropagation();
    this.markRead(n);
    this.notifications.update(list =>
      list.map(item => item.id === n.id ? { ...item, hasActions: false } : item)
    );
  }

  declineInvite(n: Notification, e: Event) {
    e.stopPropagation();
    this.notifications.update(list => list.filter(item => item.id !== n.id));
  }

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/app/profile']); }
}