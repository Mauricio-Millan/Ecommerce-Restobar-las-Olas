import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Plato } from './plato.model';

@Injectable({ providedIn: 'root' })
export class PlatosService {
  private http = inject(HttpClient);

  getActivos() {
    return this.http.get<Plato[]>(`${environment.apiBaseUrl}/api/platos/activos`);
  }

  getAll() {
    return this.http.get<Plato[]>(`${environment.apiBaseUrl}/api/platos`);
  }

  create(plato: Plato) {
    return this.http.post<Plato>(`${environment.apiBaseUrl}/api/platos`, plato);
  }

  update(id: number, plato: Plato) {
    return this.http.put<Plato>(`${environment.apiBaseUrl}/api/platos/${id}`, plato);
  }

  delete(id: number) {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/platos/${id}`);
  }
}
