import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Agregado } from './agregado.model';

@Injectable({ providedIn: 'root' })
export class PlatoAgregadosService {
  private http = inject(HttpClient);

  getAgregadosDisponibles(platoId: number) {
    return this.http.get<Agregado[]>(`${environment.apiBaseUrl}/api/plato-agregados/plato/${platoId}/agregados`);
  }

  createAssociation(platoId: number, agregadoId: number) {
    const body = {
      id: { idPlato: Number(platoId), idAgregado: Number(agregadoId) },
      plato: { id: Number(platoId) },
      agregado: { id: Number(agregadoId) }
    };
    return this.http.post(`${environment.apiBaseUrl}/api/plato-agregados`, body);
  }

  deleteAssociation(platoId: number, agregadoId: number) {
    return this.http.delete(`${environment.apiBaseUrl}/api/plato-agregados/${platoId}/${agregadoId}`);
  }
}
