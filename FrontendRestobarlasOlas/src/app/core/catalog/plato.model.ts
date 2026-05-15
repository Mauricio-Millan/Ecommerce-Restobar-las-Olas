import { Categoria } from './categoria.model';

export interface Plato {
  id?: number;
  categoria?: Categoria;
  nombre: string;
  descripcion?: string;
  precio: number;
  urlImagen?: string;
  activo?: boolean;
}
