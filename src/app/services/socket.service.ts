import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(`${environment.apiUrl}`); // Your backend URL

    this.socket.on('connect', () => {
      console.log('🟢 Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Disconnected from Socket.IO server');
    });
  }

  // Example: listen for a message from the server
  onMessage(callback: (msg: string) => void) {
    this.socket.on('welcome', callback);
  }

  rideUpdate(callback: (msg: string) => void) {
    return this.socket.on('rideUpdate', callback);
  }

  // Example: send a message to the server
  sendMessage(msg: string) {
    this.socket.emit('clientMessage', msg);
  }

  createRide(msg: string) {
    this.socket.emit('createRide', msg);
  }

  cancelRide(msg: string) {
    this.socket.emit('cancelRide', msg);
  }
}
