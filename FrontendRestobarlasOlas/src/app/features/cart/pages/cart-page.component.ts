import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Tu Carrito</h1>
      <p>Próximamente: Resumen de tu pedido y checkout.</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 40px 20px;
      text-align: center;
      font-family: 'Source Sans 3', sans-serif;
      color: #1f6f8b;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartPageComponent {}
