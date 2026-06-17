import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="coming-soon-shell">
      <div class="coming-soon-content">
        <mat-icon class="big-icon">shopping_cart</mat-icon>
        <p class="eyebrow">Carrito de compra</p>
        <h1 class="coming-title">Próximamente</h1>
        <p class="coming-sub">Usa el ícono del carrito en la barra superior para revisar y gestionar tu pedido antes de confirmar.</p>
        <a href="/" mat-flat-button color="primary" class="back-btn">Ir a la carta</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Inter', sans-serif; }
    .coming-soon-shell {
      min-height: calc(100vh - 72px);
      background: linear-gradient(160deg, var(--color-primary-dark, #003f5c) 0%, var(--color-primary, #005f87) 60%, var(--color-secondary, #00897b) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: #fff;
    }
    .coming-soon-content { max-width: 480px; }
    .big-icon { font-size: 72px; width: 72px; height: 72px; color: var(--color-secondary-light, #4db6ac); margin-bottom: 24px; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.72rem; font-weight: 600; color: var(--color-secondary-light, #4db6ac); margin: 0 0 12px; }
    .coming-title { font-family: 'Fraunces', serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin: 0 0 20px; }
    .coming-sub { font-size: 1.02rem; color: rgba(232,244,249,0.85); line-height: 1.6; margin: 0 0 32px; }
    .back-btn { border-radius: 999px !important; padding: 10px 28px !important; font-size: 1rem !important; font-weight: 600 !important; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartPageComponent {}
