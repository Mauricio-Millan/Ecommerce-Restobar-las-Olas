export interface VentaDetallePayload {
  platoId: number;
  cantidad: number;
  agregadosIds: number[];
}

export interface VentaPayload {
  usuario: { id: string };
  direccionEntrega?: string;
  esDelivery: boolean;
  metodoPago: string;
  tipoComprobante: string;
  numeroComprobante: string;
  voucherUrl?: string;
  detalles: VentaDetallePayload[];
}

export interface VentaResponse {
  id: number;
  estadoVenta: string;
  fechaCreacion?: string;
  numeroComprobante?: string;
  detalles: {
    cantidad: number;
    platoNombre?: string;
    plato?: { nombre: string };
    agregados?: {
      agregadoNombre: string;
      precioExtraHistorico?: number;
    }[];
    detalleVentaAgregados?: { agregado: { nombre: string } }[];
  }[];
}
