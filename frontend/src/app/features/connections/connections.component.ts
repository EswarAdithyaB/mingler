import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Connection } from '../../core/models';
import { ConnectionsMockService } from '../../core/services/mock';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionsComponent implements OnInit {
  activeTab = signal('connections');
  showNearby = signal(false);

  connections = signal<Connection[]>([]);
  nearbyPeople = signal<Connection[]>([]);

  constructor(
    private router: Router,
    private connectionsMockService: ConnectionsMockService
  ) {}

  ngOnInit() {
    // Load connections and nearby people from mock service
    this.connectionsMockService.getConnections().subscribe(connections => {
      this.connections.set(connections);
    });

    this.connectionsMockService.getNearbyPeople().subscribe(nearby => {
      this.nearbyPeople.set(nearby);
    });
  }

  onRefresh() { window.location.reload(); }

  goNotifications() { this.router.navigate(['/app/notifications']); }

  sendConnect(person: Connection) {
    this.connectionsMockService.sendConnectionRequest(person).subscribe(() => {
      this.connections.update(c => [...c, person]);
      this.nearbyPeople.update(p => p.filter(x => x.id !== person.id));
    });
  }
}
