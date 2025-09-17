import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdersComponent } from './orders.component';

describe('OrdersComponent', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersComponent, HttpClientTestingModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should calculate total value when fields change', () => {
    const fixture = TestBed.createComponent(OrdersComponent);
    fixture.detectChanges();
    httpTestingController.expectOne('http://localhost:3000/orders').flush([]);

    const component = fixture.componentInstance;
    component.orderForm.get('product.price')?.setValue(12.5);
    component.orderForm.get('quantity')?.setValue(3);

    expect(component.total()).toBeCloseTo(37.5, 2);
  });

  it('should validate required fields', () => {
    const fixture = TestBed.createComponent(OrdersComponent);
    fixture.detectChanges();
    httpTestingController.expectOne('http://localhost:3000/orders').flush([]);

    const component = fixture.componentInstance;
    component.orderForm.get('customer.name')?.setValue('');
    component.orderForm.get('customer.email')?.setValue('email-invalido');
    component.orderForm.get('product.name')?.setValue('');
    component.orderForm.get('product.price')?.setValue(0);
    component.orderForm.get('quantity')?.setValue(0);
    component.orderForm.markAllAsTouched();

    expect(component.orderForm.get('customer.name')?.hasError('required')).toBeTrue();
    expect(component.orderForm.get('customer.email')?.hasError('email')).toBeTrue();
    expect(component.orderForm.get('product.name')?.hasError('required')).toBeTrue();
    expect(component.orderForm.get('product.price')?.hasError('min')).toBeTrue();
    expect(component.orderForm.get('quantity')?.hasError('min')).toBeTrue();
  });
});