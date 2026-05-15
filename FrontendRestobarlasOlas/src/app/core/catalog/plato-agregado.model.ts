import { Agregado } from './agregado.model';

export interface PlatoAgregadoId {
  idPlato: number;
  idAgregado: number;
}

export interface PlatoAgregado {
  id?: PlatoAgregadoId;
  plato?: { id: number };
  agregado?: Agregado;
}
