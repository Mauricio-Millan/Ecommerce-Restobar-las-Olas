import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Categoria } from './categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Categoria[]>(`${environment.apiBaseUrl}/api/categorias`);
  }
}
