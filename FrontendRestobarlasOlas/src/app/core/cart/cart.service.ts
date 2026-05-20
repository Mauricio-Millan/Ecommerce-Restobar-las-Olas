import { Injectable, computed, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem } from './cart.model';
import { Plato } from '../catalog/plato.model';
import { Agregado } from '../catalog/agregado.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'olas_cart';
  private itemsSignal = signal<CartItem[]>([]);

  readonly cartItems = this.itemsSignal.asReadonly();
  
  readonly cartTotal = computed(() => {
    return this.itemsSignal().reduce((total, item) => total + item.totalPrice, 0);
  });

  readonly cartItemCount = computed(() => {
    return this.itemsSignal().reduce((count, item) => count + item.quantity, 0);
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.CART_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.itemsSignal.set(parsed);
        } catch (e) {
          console.error('Error loading cart from storage', e);
        }
      }
    }
  }

  private saveToStorage(items: CartItem[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    }
  }

  private generateItemId(platoId: number, agregados: Agregado[]): string {
    const agregadosIds = agregados.map(a => a.id).sort().join('_');
    return `${platoId}-${agregadosIds}`;
  }

  addItem(plato: Plato, agregados: Agregado[], quantity: number) {
    if (!plato.id) return;
    
    const itemId = this.generateItemId(plato.id, agregados);
    const currentItems = [...this.itemsSignal()];
    const existingIndex = currentItems.findIndex(i => i.id === itemId);

    const agregadosTotal = agregados.reduce((sum, a) => sum + (a.precio || 0), 0);
    const unitPrice = plato.precio + agregadosTotal;

    if (existingIndex > -1) {
      const item = currentItems[existingIndex];
      item.quantity += quantity;
      item.totalPrice = item.quantity * item.unitPrice;
    } else {
      currentItems.push({
        id: itemId,
        plato,
        agregados,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity
      });
    }

    this.itemsSignal.set(currentItems);
    this.saveToStorage(currentItems);
  }

  updateQuantity(itemId: string, delta: number) {
    let currentItems = [...this.itemsSignal()];
    const index = currentItems.findIndex(i => i.id === itemId);
    
    if (index > -1) {
      const item = { ...currentItems[index] };
      item.quantity += delta;
      
      if (item.quantity <= 0) {
        currentItems.splice(index, 1);
      } else {
        item.totalPrice = item.quantity * item.unitPrice;
        currentItems[index] = item;
      }
      
      this.itemsSignal.set(currentItems);
      this.saveToStorage(currentItems);
    }
  }

  removeItem(itemId: string) {
    const currentItems = this.itemsSignal().filter(i => i.id !== itemId);
    this.itemsSignal.set(currentItems);
    this.saveToStorage(currentItems);
  }

  clearCart() {
    this.itemsSignal.set([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.CART_KEY);
    }
  }
}
