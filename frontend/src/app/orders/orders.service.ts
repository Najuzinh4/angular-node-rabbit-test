import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ORDERS_API_URL } from './orders-api.token';

export interface CustomerInfo {
  name: string;
  email: string;
}

export interface ProductInfo {
  name: string;
  price: number;
}

export interface CreateOrderPayload {
  customer: CustomerInfo;
  product: ProductInfo;
  quantity: number;
}

export interface Order extends CreateOrderPayload {
  id: number;
  total: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(ORDERS_API_URL);
  private readonly ordersSignal = signal<Order[]>([]);

  readonly orders = this.ordersSignal.asReadonly();

  async refreshOrders(): Promise<void> {
    const orders = await firstValueFrom(this.http.get<Order[]>(this.apiUrl));
    this.ordersSignal.set(orders);
  }

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const createdOrder = await firstValueFrom(this.http.post<Order>(this.apiUrl, payload));
    this.ordersSignal.update((current) => [createdOrder, ...current]);
    return createdOrder;
  }
}