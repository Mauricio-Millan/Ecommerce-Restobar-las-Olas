import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Agregado } from './agregado.model';

@Injectable({ providedIn: 'root' })
export class AgregadosService {
  private http = inject(HttpClient);

  getActivos() {
    return this.http.get<Agregado[]>(`${environment.apiBaseUrl}/api/agregados/activos`);
  }

  getAll() {
    return this.http.get<Agregado[]>(`${environment.apiBaseUrl}/api/agregados`);
  }

  create(agregado: Agregado) {
    return this.http.post<Agregado>(`${environment.apiBaseUrl}/api/agregados`, agregado);
  }

  update(id: number, agregado: Agregado) {
    return this.http.put<Agregado>(`${environment.apiBaseUrl}/api/agregados/${id}`, agregado);
  }

  delete(id: number) {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/agregados/${id}`);
  }
}
