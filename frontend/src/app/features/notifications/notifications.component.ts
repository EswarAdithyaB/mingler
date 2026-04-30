import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationsMockService, Notification } from '../../core/services/mock';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  notifications = signal<Notification[]>([]);

  constructor(
    private router: Router,
    private notificationsMockService: NotificationsMockService
  ) {}

  ngOnInit() {
    // Load notifications from mock service
    this.notificationsMockService.getNotifications().subscribe(notifications => {
      this.notifications.set(notifications);
    });
  }

  markRead(n: Notification) {
    this.notificationsMockService.markAsRead(n.id).subscribe(() => {
      this.notifications.update(list =>
        list.map(item => item.id === n.id ? { ...item, read: true } : item)
      );
    });
  }

  markAllRead() {
    this.notificationsMockService.markAllAsRead().subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    });
  }

  acceptInvite(n: Notification, e: Event) {
    e.stopPropagation();
    this.notificationsMockService.acceptGameInvite(n.id).subscribe(() => {
      this.notifications.update(list =>
        list.map(item => item.id === n.id ? { ...item, read: true, hasActions: false } : item)
      );
    });
  }

  declineInvite(n: Notification, e: Event) {
    e.stopPropagation();
    this.notificationsMockService.declineGameInvite(n.id).subscribe(() => {
      this.notifications.update(list => list.filter(item => item.id !== n.id));
    });
  }

  goBack() { this.router.navigate(['/app/profile']); }
}
