import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    const socketUrl = environment.socketUrl || environment.apiUrl || 'https://pintu-api.democompany.in.net';
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('🟢 [OneApp Customer Socket] Connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 [OneApp Customer Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('⚠️ [OneApp Customer Socket] Connection Error:', err.message);
    });
  }

  // --- Socket ID & Status ---
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }

  // --- Ride Events ---
  rideUpdate(callback: (msg: any) => void) {
    this.socket.off('rideUpdate');
    this.socket.on('rideUpdate', callback);
  }

  onRideUpdate(callback: (msg: any) => void) {
    this.socket.off('rideUpdate');
    this.socket.on('rideUpdate', callback);
  }

  offRideUpdate() {
    this.socket.off('rideUpdate');
  }

  // --- Live Driver Location Tracking ---
  onRiderLocation(callback: (data: any) => void) {
    this.socket.off('rider:location_update');
    this.socket.off('riderUpdate');
    this.socket.off('ride:location');

    this.socket.on('rider:location_update', callback);
    this.socket.on('riderUpdate', callback);
    this.socket.on('ride:location', callback);
  }

  offRiderLocation() {
    this.socket.off('rider:location_update');
    this.socket.off('riderUpdate');
    this.socket.off('ride:location');
  }

  // --- General Messaging ---
  onMessage(callback: (msg: any) => void) {
    this.socket.on('welcome', callback);
  }

  sendMessage(msg: string) {
    this.socket.emit('clientMessage', msg);
  }

  createRide(msg: any) {
    this.socket.emit('createRide', msg);
  }

  cancelRide(data: any) {
    this.socket.emit('cancelRide', typeof data === 'object' ? data : { rideId: data });
  }
}
