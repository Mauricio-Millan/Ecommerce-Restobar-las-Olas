import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Rol {
  id: number;
  rol: string;
}

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  celular: string;
  direccion: string;
  activo: boolean;
  email: string;
  rol: Rol | null;
}

export interface PlatoMasVendido {
  platoId: number;
  platoNombre: string;
  cantidad: number;
  ingresos: number;
}

const BASE = `${environment.apiBaseUrl}/api`;

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  buscarUsuarios(query?: string): Observable<UsuarioAdmin[]> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    return this.http.get<UsuarioAdmin[]>(`${BASE}/usuarios/buscar`, { params });
  }

  cambiarEstadoUsuario(id: string, activo: boolean): Observable<UsuarioAdmin> {
    const params = new HttpParams().set('activo', String(activo));
    return this.http.put<UsuarioAdmin>(`${BASE}/usuarios/${id}/estado`, {}, { params });
  }

  asignarRolUsuario(id: string, rolId: number | null): Observable<UsuarioAdmin> {
    let params = new HttpParams();
    if (rolId !== null) params = params.set('rolId', String(rolId));
    return this.http.put<UsuarioAdmin>(`${BASE}/usuarios/${id}/rol`, {}, { params });
  }

  getPlatosMasVendidos(limit = 10): Observable<PlatoMasVendido[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<PlatoMasVendido[]>(`${BASE}/ventas/reportes/platos-mas-vendidos`, { params });
  }

  exportarCsv(fecha?: string): Observable<Blob> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get(`${BASE}/ventas/exportar/csv`, { params, responseType: 'blob' });
  }

  exportarExcel(fecha?: string): Observable<Blob> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get(`${BASE}/ventas/exportar/excel`, { params, responseType: 'blob' });
  }
}
