import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VentaPayload } from './venta.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private http = inject(HttpClient);

  crearVenta(payload: VentaPayload) {
    return this.http.post(`${environment.apiBaseUrl}/api/ventas`, payload);
  }

  getVentasCocina(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/ventas/cocina`);
  }

  updateEstadoVenta(id: number, estadoVenta: string): Observable<any> {
    return this.http.patch(`${environment.apiBaseUrl}/api/ventas/${id}/estado`, { estadoVenta });
  }

  entregarVenta(id: number): Observable<any> {
    return this.http.patch(`${environment.apiBaseUrl}/api/ventas/${id}/entregar`, {});
  }

  cancelarVenta(id: number): Observable<any> {
    return this.http.patch(`${environment.apiBaseUrl}/api/ventas/${id}/cancelar`, {});
  }
}
