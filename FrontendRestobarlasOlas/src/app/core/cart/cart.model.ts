import { Plato } from '../catalog/plato.model';
import { Agregado } from '../catalog/agregado.model';

export interface CartItem {
  id: string; // unique identifier for the combination of plato + agregados
  plato: Plato;
  agregados: Agregado[];
  quantity: number;
  unitPrice: number; // base price + agregados price
  totalPrice: number; // unitPrice * quantity
}
