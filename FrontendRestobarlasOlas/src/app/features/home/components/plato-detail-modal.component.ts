import { Component, Inject, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Plato } from '../../../core/catalog/plato.model';
import { Agregado } from '../../../core/catalog/agregado.model';
import { CartService } from '../../../core/cart/cart.service';

export interface PlatoDetailData {
  plato: Plato;
  agregados: Agregado[];
}

@Component({
  selector: 'app-plato-detail-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatIconModule, MatDividerModule],
  template: `
    <div class="modal-container">
      <button mat-icon-button class="close-btn" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="image-header" [style.backgroundImage]="data.plato.urlImagen ? 'url(' + data.plato.urlImagen + ')' : 'linear-gradient(135deg, #1f6f8b, #8b5e3c)'">
        <div class="no-image-text" *ngIf="!data.plato.urlImagen">Sin Imagen</div>
      </div>

      <div class="content-body">
        <h2 class="plato-name">{{ data.plato.nombre }}</h2>
        <p class="plato-desc">{{ data.plato.descripcion || 'Plato del día' }}</p>

        <mat-divider></mat-divider>

        <div class="price-section">
          <span class="base-price-label">Precio base:</span>
          <span class="base-price-value">S/ {{ data.plato.precio | number:'1.2-2' }}</span>
        </div>

        <mat-divider></mat-divider>

        <div class="agregados-section" *ngIf="data.agregados.length">
          <h3>Personaliza tu plato</h3>
          <p class="section-desc">Selecciona los extras que desees añadir:</p>
          
          <div class="agregados-list">
            <mat-checkbox *ngFor="let agregado of data.agregados" 
                          [checked]="selectedAgregadoIds().includes(agregado.id ?? 0)" 
                          (change)="toggleAgregado(agregado)">
              {{ agregado.nombre }} <span class="addon-price">(+ S/ {{ agregado.precio | number:'1.2-2' }})</span>
            </mat-checkbox>
          </div>
        </div>

        <mat-divider *ngIf="data.agregados.length"></mat-divider>

        <div class="quantity-section">
          <h3>Cantidad</h3>
          <div class="quantity-controls">
            <button mat-icon-button (click)="changeQuantity(-1)" [disabled]="quantity() <= 1">
              <mat-icon>remove</mat-icon>
            </button>
            <span class="quantity-display">{{ quantity() }}</span>
            <button mat-icon-button (click)="changeQuantity(1)">
              <mat-icon>add</mat-icon>
            </button>
          </div>
        </div>

      </div>

      <div class="action-footer">
        <div class="total-price">
          <span class="total-label">Total:</span>
          <span class="total-value">S/ {{ finalPrice() | number:'1.2-2' }}</span>
        </div>
        <button mat-flat-button color="primary" class="add-cart-btn" (click)="addToCart()">
          Añadir al carrito
        </button>
      </div>
    </div>
  `,
  styles: [`
    .modal-container {
      display: flex;
      flex-direction: column;
      position: relative;
      background: #fff;
      max-height: 90vh;
      font-family: 'Source Sans 3', sans-serif;
    }
    .close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.8);
      z-index: 10;
    }
    .image-header {
      height: 240px;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .no-image-text {
      color: #fff;
      font-weight: 700;
      font-size: 1.2rem;
    }
    .content-body {
      padding: 24px;
      overflow-y: auto;
    }
    .plato-name {
      font-family: 'Fraunces', serif;
      font-size: 1.8rem;
      margin: 0 0 8px;
      color: #1f6f8b;
    }
    .plato-desc {
      color: #555;
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    mat-divider {
      margin: 16px 0;
    }
    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.1rem;
    }
    .base-price-label {
      font-weight: 600;
      color: #333;
    }
    .base-price-value {
      font-weight: 800;
      color: #1f6f8b;
    }
    .agregados-section h3, .quantity-section h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.2rem;
      margin: 0 0 4px;
      color: #1f6f8b;
    }
    .section-desc {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 12px;
    }
    .agregados-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .addon-price {
      font-weight: 600;
      color: #8b5e3c;
    }
    .quantity-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f4f7f9;
      border-radius: 24px;
      padding: 4px;
    }
    .quantity-display {
      font-weight: 700;
      font-size: 1.1rem;
      min-width: 20px;
      text-align: center;
    }
    .action-footer {
      padding: 16px 24px;
      background: #f4f7f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(31,111,139,.1);
    }
    .total-price {
      display: flex;
      flex-direction: column;
    }
    .total-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #666;
    }
    .total-value {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1f6f8b;
    }
    .add-cart-btn {
      padding: 0 24px;
      border-radius: 24px;
      font-weight: 600;
    }
  `]
})
export class PlatoDetailModalComponent {
  private dialogRef = inject(MatDialogRef<PlatoDetailModalComponent>);
  private cartService = inject(CartService);

  selectedAgregadoIds = signal<number[]>([]);
  quantity = signal<number>(1);

  constructor(@Inject(MAT_DIALOG_DATA) public data: PlatoDetailData) {}

  selectedAgregados = computed(() => {
    return this.data.agregados.filter(a => this.selectedAgregadoIds().includes(a.id ?? 0));
  });

  basePrice = computed(() => this.data.plato.precio);
  
  addonsTotal = computed(() => {
    return this.selectedAgregados().reduce((sum, a) => sum + (a.precio ?? 0), 0);
  });

  unitPrice = computed(() => this.basePrice() + this.addonsTotal());
  finalPrice = computed(() => this.unitPrice() * this.quantity());

  toggleAgregado(agregado: Agregado) {
    const id = agregado.id ?? 0;
    const current = this.selectedAgregadoIds();
    if (current.includes(id)) {
      this.selectedAgregadoIds.set(current.filter(val => val !== id));
    } else {
      this.selectedAgregadoIds.set([...current, id]);
    }
  }

  changeQuantity(delta: number) {
    const newVal = this.quantity() + delta;
    if (newVal >= 1) {
      this.quantity.set(newVal);
    }
  }

  addToCart() {
    this.cartService.addItem(this.data.plato, this.selectedAgregados(), this.quantity());
    this.close();
  }

  close() {
    this.dialogRef.close();
  }
}
