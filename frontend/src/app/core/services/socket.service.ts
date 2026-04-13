import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SocketService {
  isConnected = signal<boolean>(false);
  private socket: any = null;

  connect(userId: string): void {
    // Lazy-load socket.io-client
    import('socket.io-client').then(({ io }) => {
      this.socket = io('http://localhost:3000', {
        query: { userId },
        transports: ['websocket'],
        reconnection: true
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected:', this.socket.id);
        this.isConnected.set(true);
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket] Disconnected');
        this.isConnected.set(false);
      });
    });
  }

  joinZone(zoneId: string): void {
    this.socket?.emit('zone:join', { zoneId });
  }

  leaveZone(zoneId: string): void {
    this.socket?.emit('zone:leave', { zoneId });
  }

  sendVibe(zoneId: string, content: string, type: string): void {
    this.socket?.emit('vibe:post', { zoneId, content, type });
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.isConnected.set(false);
  }
}
