import { Component } from '@angular/core';
import { OrdersComponent } from './orders/orders.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrdersComponent],  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
export class App {}
