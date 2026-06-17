import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VentaResponse } from './venta.model';

@Injectable({ providedIn: 'root' })
export class VentasSseService {
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  public ventas$ = new BehaviorSubject<VentaResponse[]>([]);
  private es: EventSource | null = null;
  private isConnecting = false;

  connect() {
    if (!this.isBrowser) return;
    if (this.es || this.isConnecting) return;

    this.isConnecting = true;

    this.ngZone.runOutsideAngular(() => {
      const url = `${environment.apiBaseUrl}/api/ventas/stream`;
      console.log('[VentasSseService] Conectando a SSE stream:', url);
      
      this.es = new EventSource(url);

      this.es.addEventListener('initial', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data) as VentaResponse[];
          console.log('[VentasSseService] Snapshot inicial recibido:', data);
          this.ngZone.run(() => {
            this.ventas$.next(data);
            this.isConnecting = false;
          });
        } catch (e) {
          console.error('[VentasSseService] Error parseando data inicial:', e);
        }
      });

      this.es.addEventListener('venta-update', (ev: MessageEvent) => {
        try {
          const venta = JSON.parse(ev.data) as VentaResponse;
          console.log('[VentasSseService] Update de venta recibido:', venta);
          this.ngZone.run(() => {
            this.applyUpdate(venta);
          });
        } catch (e) {
          console.error('[VentasSseService] Error parseando venta-update:', e);
        }
      });

      this.es.onopen = () => {
        console.log('[VentasSseService] Conexión SSE establecida con éxito.');
        this.ngZone.run(() => {
          this.isConnecting = false;
        });
      };

      this.es.onerror = (err) => {
        console.error('[VentasSseService] Error en stream SSE:', err);
        // EventSource intenta reconectar automáticamente en el navegador,
        // pero podemos resetear el estado de conexión si es necesario.
        this.ngZone.run(() => {
          this.isConnecting = false;
        });
      };
    });
  }

  disconnect() {
    if (this.es) {
      console.log('[VentasSseService] Cerrando conexión SSE.');
      this.es.close();
      this.es = null;
    }
    this.isConnecting = false;
  }

  private applyUpdate(venta: VentaResponse) {
    const current = this.ventas$.getValue();
    const i = current.findIndex(v => v.id === venta.id);
    
    let updatedList: VentaResponse[];
    if (i >= 0) {
      // Si la venta está cancelada o entregada, la quitamos del tablero activo
      const esEstadoFinal = ['entregado', 'entregada', 'cancelado', 'cancelada'].includes(venta.estadoVenta?.toLowerCase());
      if (esEstadoFinal) {
        updatedList = current.filter(v => v.id !== venta.id);
      } else {
        const copy = [...current];
        copy[i] = venta;
        updatedList = copy;
      }
    } else {
      // Si es una venta nueva, la agregamos
      const esEstadoFinal = ['entregado', 'entregada', 'cancelado', 'cancelada'].includes(venta.estadoVenta?.toLowerCase());
      if (!esEstadoFinal) {
        updatedList = [venta, ...current];
      } else {
        updatedList = current;
      }
    }

    this.ventas$.next(updatedList);
  }
}
