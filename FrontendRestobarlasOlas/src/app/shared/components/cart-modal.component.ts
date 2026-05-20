import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../core/cart/cart.service';
import { SessionService } from '../../core/auth/session.service';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="cart-container">
      <div class="cart-header">
        <h2>Tu Pedido</h2>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="cart-body">
        <div class="empty-cart" *ngIf="cartService.cartItems().length === 0">
          <mat-icon class="empty-icon">shopping_cart</mat-icon>
          <p>Tu carrito está vacío</p>
          <button mat-stroked-button color="primary" (click)="close()">Ver menú</button>
        </div>

        <div class="cart-items" *ngIf="cartService.cartItems().length > 0">
          <div class="cart-item" *ngFor="let item of cartService.cartItems()">
            <div class="item-info">
              <div class="item-name">{{ item.plato.nombre }}</div>
              <div class="item-agregados" *ngIf="item.agregados.length">
                <span *ngFor="let a of item.agregados; let last=last">{{ a.nombre }}{{ !last ? ', ' : '' }}</span>
              </div>
              <div class="item-price">S/ {{ item.unitPrice | number:'1.2-2' }} c/u</div>
            </div>
            
            <div class="item-actions">
              <div class="quantity-controls">
                <button mat-icon-button color="primary" class="qty-btn" (click)="cartService.updateQuantity(item.id, -1)">
                  <mat-icon *ngIf="item.quantity > 1">remove</mat-icon>
                  <mat-icon *ngIf="item.quantity === 1" color="warn">delete</mat-icon>
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button mat-icon-button color="primary" class="qty-btn" (click)="cartService.updateQuantity(item.id, 1)">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              <div class="item-total">S/ {{ item.totalPrice | number:'1.2-2' }}</div>
            </div>
          </div>
        </div>
      </div>

      <mat-divider *ngIf="cartService.cartItems().length > 0"></mat-divider>

      <div class="cart-footer" *ngIf="cartService.cartItems().length > 0">
        <div class="cart-summary">
          <span>Subtotal</span>
          <span class="summary-total">S/ {{ cartService.cartTotal() | number:'1.2-2' }}</span>
        </div>
        <button mat-flat-button color="primary" class="checkout-btn" (click)="goToCheckout()">
          Realizar pedido
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: #fff;
      font-family: 'Source Sans 3', sans-serif;
    }
    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
    }
    .cart-header h2 {
      font-family: 'Fraunces', serif;
      margin: 0;
      color: #1f6f8b;
      font-size: 1.5rem;
    }
    .cart-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
    }
    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      color: #666;
    }
    .empty-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }
    .cart-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px dashed rgba(31,111,139,.2);
    }
    .cart-item:last-child {
      border-bottom: none;
    }
    .item-name {
      font-weight: 700;
      font-size: 1.1rem;
      color: #333;
    }
    .item-agregados {
      font-size: 0.85rem;
      color: #8b5e3c;
      margin-top: 4px;
    }
    .item-price {
      font-size: 0.85rem;
      color: #666;
      margin-top: 4px;
    }
    .item-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .quantity-controls {
      display: flex;
      align-items: center;
      background: #f4f7f9;
      border-radius: 20px;
      padding: 2px;
    }
    .qty-btn {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }
    .qty-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      line-height: 20px;
    }
    .quantity {
      min-width: 20px;
      text-align: center;
      font-weight: 700;
    }
    .item-total {
      font-weight: 800;
      color: #1f6f8b;
      font-size: 1.1rem;
    }
    .cart-footer {
      padding: 20px;
      background: #f4f7f9;
    }
    .cart-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 1.1rem;
      color: #333;
    }
    .summary-total {
      font-weight: 800;
      font-size: 1.3rem;
      color: #1f6f8b;
    }
    .checkout-btn {
      width: 100%;
      padding: 8px 0;
      font-size: 1.1rem;
      border-radius: 24px;
    }
  `]
})
export class CartModalComponent {
  private dialogRef = inject(MatDialogRef<CartModalComponent>);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  cartService = inject(CartService);

  close() {
    this.dialogRef.close();
  }

  goToCheckout() {
    this.close();
    if (this.sessionService.isAuthenticated()) {
      this.router.navigate(['/checkout']);
    } else {
      alert('Debes iniciar sesión para realizar un pedido. Serás redirigido al login.');
      this.router.navigate(['/login']);
    }
  }
}
