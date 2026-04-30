import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type NotifType = 'zone' | 'game' | 'confession' | 'discovery' | 'mention';

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  hasActions?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsMockService {

  private mockNotifications: Notification[] = [
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
  ];

  getNotifications(): Observable<Notification[]> {
    return of([...this.mockNotifications]);
  }

  markAsRead(id: string): Observable<Notification | null> {
    const notif = this.mockNotifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
    }
    return of(notif || null);
  }

  markAllAsRead(): Observable<void> {
    this.mockNotifications.forEach(n => n.read = true);
    return of(void 0);
  }

  deleteNotification(id: string): Observable<void> {
    const index = this.mockNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.mockNotifications.splice(index, 1);
    }
    return of(void 0);
  }

  acceptGameInvite(id: string): Observable<void> {
    const notif = this.mockNotifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      notif.hasActions = false;
    }
    return of(void 0);
  }

  declineGameInvite(id: string): Observable<void> {
    return this.deleteNotification(id);
  }
}
