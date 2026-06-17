import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
  imports: [DecimalPipe, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="cart-container">
      <div class="cart-header">
        <h2>Tu Pedido</h2>
        <div class="header-actions">
          @if (cartService.cartItems().length > 0) {
            <button mat-button class="clear-btn" (click)="cartService.clearCart()">
              <mat-icon>delete_sweep</mat-icon>
              Vaciar
            </button>
          }
          <button mat-icon-button class="close-btn" (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="cart-body">
        @if (cartService.cartItems().length === 0) {
          <div class="empty-cart">
            <mat-icon class="empty-icon">shopping_cart</mat-icon>
            <p>Tu carrito está vacío</p>
            <button mat-stroked-button color="primary" (click)="close()">Ver menú</button>
          </div>
        } @else {
          <div class="cart-items">
            @for (item of cartService.cartItems(); track item.id) {
              <div class="cart-item">
                <div class="item-info">
                  <div class="item-name">{{ item.plato.nombre }}</div>
                  @if (item.agregados.length) {
                    <div class="item-agregados">
                      @for (a of item.agregados; track a.id; let last = $last) {
                        <span>{{ a.nombre }}{{ !last ? ', ' : '' }}</span>
                      }
                    </div>
                  }
                  <div class="item-price">S/ {{ item.unitPrice | number:'1.2-2' }} c/u</div>
                </div>

                <div class="item-actions">
                  <div class="quantity-controls">
                    <button mat-icon-button class="qty-btn" (click)="cartService.updateQuantity(item.id, -1)">
                      @if (item.quantity > 1) {
                        <mat-icon>remove</mat-icon>
                      } @else {
                        <mat-icon class="delete-icon">delete</mat-icon>
                      }
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button mat-icon-button class="qty-btn" (click)="cartService.updateQuantity(item.id, 1)">
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                  <div class="item-total">S/ {{ item.totalPrice | number:'1.2-2' }}</div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (cartService.cartItems().length > 0) {
        <mat-divider></mat-divider>
        <div class="cart-footer">
          <div class="cart-summary">
            <span>Subtotal</span>
            <span class="summary-total">S/ {{ cartService.cartTotal() | number:'1.2-2' }}</span>
          </div>
          <button mat-flat-button color="primary" class="checkout-btn" (click)="goToCheckout()">
            Realizar pedido
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: var(--color-surface, #fff);
      font-family: 'Inter', sans-serif;
    }
    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .clear-btn {
      font-weight: 600;
      font-size: 0.85rem !important;
      color: var(--color-error, #c62828) !important;
      border-radius: var(--radius-pill, 999px) !important;
    }
    .clear-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .cart-header h2 {
      font-family: 'Fraunces', serif;
      margin: 0;
      color: var(--color-primary-dark, #003f5c);
      font-size: 1.45rem;
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
      color: var(--color-text-medium, #4a6572);
    }
    .empty-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: var(--color-border, #d0e3ed);
      margin-bottom: 16px;
    }
    .cart-item {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px 0;
      border-bottom: 1px solid var(--color-border-light, #e8f1f7);
    }
    .cart-item:last-child { border-bottom: none; }
    .item-name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--color-text-high, #0d2633);
    }
    .item-agregados {
      font-size: 0.82rem;
      color: var(--color-secondary, #00897b);
      margin-top: 3px;
    }
    .item-price {
      font-size: 0.82rem;
      color: var(--color-text-medium, #4a6572);
      margin-top: 3px;
    }
    .item-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .quantity-controls {
      display: flex;
      align-items: center;
      background: var(--color-surface-raised, #f0f6fa);
      border-radius: var(--radius-pill, 999px);
      padding: 2px;
    }
    .qty-btn {
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      color: var(--color-primary, #005f87) !important;
    }
    .qty-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .delete-icon { color: var(--color-error, #c62828) !important; }
    .quantity {
      min-width: 22px;
      text-align: center;
      font-weight: 700;
      color: var(--color-text-high, #0d2633);
    }
    .item-total {
      font-weight: 700;
      color: var(--color-primary, #005f87);
      font-size: 1.05rem;
    }
    .cart-footer {
      padding: 18px 20px 20px;
      background: var(--color-surface-raised, #f0f6fa);
      border-top: 1px solid var(--color-border-light, #e8f1f7);
    }
    .cart-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      font-size: 1rem;
      color: var(--color-text-medium, #4a6572);
      font-weight: 500;
    }
    .summary-total {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--color-primary, #005f87);
    }
    .checkout-btn {
      width: 100%;
      padding: 8px 0;
      font-size: 1rem;
      font-weight: 600;
      border-radius: var(--radius-pill, 999px) !important;
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
