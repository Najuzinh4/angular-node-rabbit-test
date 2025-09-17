import { InjectionToken } from '@angular/core';

export const ORDERS_API_URL = new InjectionToken<string>('ORDERS_API_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3000/orders'
});