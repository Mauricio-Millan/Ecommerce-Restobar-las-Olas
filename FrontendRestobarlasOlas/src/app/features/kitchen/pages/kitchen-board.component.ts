import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { VentasService } from '../../../core/ventas/ventas.service';
import { VentasSseService } from '../../../core/ventas/ventas-sse.service';
import { VentaResponse } from '../../../core/ventas/venta.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kitchen-board',
  standalone: true,
  imports: [DatePipe, DragDropModule],
  template: `
    <div class="board-container">
      <header class="board-header">
        <div>
          <h2>Tablero de Cocina</h2>
          <p>Arrastra los pedidos para actualizar su estado.</p>
        </div>
        <button class="refresh-btn" (click)="loadVentas()">
          <span class="icon">↻</span> Recargar
        </button>
      </header>

      <div class="board">
        <!-- Columna: Nuevos -->
        <div class="column col-nuevos">
          <h3 class="column-title nuevos">Nuevos</h3>
          <div cdkDropList #nuevosList="cdkDropList" id="Nuevos"
               [cdkDropListData]="nuevos"
               [cdkDropListConnectedTo]="[preparacionList, listosList]"
               class="card-list" (cdkDropListDropped)="drop($event)">
            @for (item of nuevos; track item.id) {
              <div class="card" cdkDrag>
                <div class="card-header">
                  <span class="order-id">#{{ item.id }}</span>
                  <span class="time">{{ item.fechaCreacion | date:'shortTime' }}</span>
                </div>
                <div class="card-body">
                  <ul>
                    @for (det of item.detalles; track $index) {
                      <li>
                        <strong>{{ det.cantidad }}x</strong> {{ getPlatoNombre(det) }}
                        @if (getAgregados(det).length) {
                          <div class="agregados">
                            + @for (a of getAgregados(det); track a; let last = $last) {<span>{{ a }}{{ last ? '' : ', ' }}</span>}
                          </div>
                        }
                      </li>
                    }
                  </ul>
                </div>
              </div>
            }
            @if (!nuevos.length) { <div class="empty-msg">Sin pedidos nuevos</div> }
          </div>
        </div>

        <!-- Columna: En Preparación -->
        <div class="column col-preparacion">
          <h3 class="column-title preparacion">En Preparación</h3>
          <div cdkDropList #preparacionList="cdkDropList" id="En Preparacion"
               [cdkDropListData]="enPreparacion"
               [cdkDropListConnectedTo]="[nuevosList, listosList]"
               class="card-list" (cdkDropListDropped)="drop($event)">
            @for (item of enPreparacion; track item.id) {
              <div class="card" cdkDrag>
                <div class="card-header">
                  <span class="order-id">#{{ item.id }}</span>
                  <span class="time">{{ item.fechaCreacion | date:'shortTime' }}</span>
                </div>
                <div class="card-body">
                  <ul>
                    @for (det of item.detalles; track $index) {
                      <li>
                        <strong>{{ det.cantidad }}x</strong> {{ getPlatoNombre(det) }}
                        @if (getAgregados(det).length) {
                          <div class="agregados">
                            + @for (a of getAgregados(det); track a; let last = $last) {<span>{{ a }}{{ last ? '' : ', ' }}</span>}
                          </div>
                        }
                      </li>
                    }
                  </ul>
                </div>
              </div>
            }
            @if (!enPreparacion.length) { <div class="empty-msg">Sin pedidos en cocina</div> }
          </div>
        </div>

        <!-- Columna: Listos -->
        <div class="column col-listos">
          <h3 class="column-title listos">Listos</h3>
          <div cdkDropList #listosList="cdkDropList" id="Listos"
               [cdkDropListData]="listos"
               [cdkDropListConnectedTo]="[nuevosList, preparacionList]"
               class="card-list" (cdkDropListDropped)="drop($event)">
            @for (item of listos; track item.id) {
              <div class="card" cdkDrag>
                <div class="card-header">
                  <span class="order-id">#{{ item.id }}</span>
                  <span class="time">{{ item.fechaCreacion | date:'shortTime' }}</span>
                </div>
                <div class="card-body">
                  <ul>
                    @for (det of item.detalles; track $index) {
                      <li><strong>{{ det.cantidad }}x</strong> {{ getPlatoNombre(det) }}</li>
                    }
                  </ul>
                </div>
                <div class="card-actions">
                  <button class="action-btn deliver" (click)="marcarEntregado(item)" [disabled]="pendingActions.has(item.id)">Entregado</button>
                  <button class="action-btn cancel" (click)="marcarCancelado(item)" [disabled]="pendingActions.has(item.id)">Cancelar</button>
                </div>
              </div>
            }
            @if (!listos.length) { <div class="empty-msg">Sin pedidos listos</div> }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; }
    .board-container {
      padding: 20px 24px;
      height: calc(100vh - 72px);
      background-color: var(--color-bg, #f7f9fc);
      display: flex;
      flex-direction: column;
    }
    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .board-header h2 {
      margin: 0;
      color: var(--color-primary-dark, #003f5c);
      font-family: 'Fraunces', serif;
      font-size: 1.5rem;
    }
    .board-header p { margin: 4px 0 0; color: var(--color-text-medium, #4a6572); font-size: 0.9rem; }
    .refresh-btn {
      padding: 8px 16px;
      background: var(--color-surface, #fff);
      border: 1px solid var(--color-border, #d0e3ed);
      border-radius: var(--radius-md, 12px);
      cursor: pointer;
      font-weight: 600;
      color: var(--color-primary, #005f87);
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
      transition: background var(--transition-fast), box-shadow var(--transition-fast);
    }
    .refresh-btn:hover { background: var(--color-surface-raised, #f0f6fa); box-shadow: var(--shadow-sm); }

    .board { display: flex; gap: 20px; flex: 1; overflow-x: auto; overflow-y: hidden; }
    .column {
      flex: 1;
      min-width: 260px;
      background: var(--color-surface-raised, #f0f6fa);
      border-radius: var(--radius-md, 12px);
      border: 1px solid var(--color-border-light, #e8f1f7);
      display: flex;
      flex-direction: column;
      max-height: 100%;
    }
    .col-nuevos { border-top: 3px solid var(--color-warning, #c97a10); }
    .col-preparacion { border-top: 3px solid var(--color-info, #0277bd); }
    .col-listos { border-top: 3px solid var(--color-success, #1a7f5c); }

    .column-title { padding: 14px 16px; margin: 0; font-size: 1rem; font-weight: 700; border-bottom: 1px solid var(--color-border-light, #e8f1f7); }
    .column-title.nuevos { color: var(--color-warning, #c97a10); }
    .column-title.preparacion { color: var(--color-info, #0277bd); }
    .column-title.listos { color: var(--color-success, #1a7f5c); }

    .card-list { padding: 10px; flex: 1; overflow-y: auto; min-height: 160px; }
    .card {
      background: var(--color-surface, #fff);
      border-radius: var(--radius-sm, 6px);
      padding: 12px;
      margin-bottom: 10px;
      box-shadow: var(--shadow-sm);
      cursor: grab;
      border-left: 4px solid var(--color-primary, #005f87);
    }
    .card:active { cursor: grabbing; }
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: var(--radius-md, 12px);
      box-shadow: var(--shadow-xl, 0 20px 48px rgba(0,63,92,0.14));
      background: var(--color-surface, #fff);
    }
    .cdk-drag-placeholder { opacity: 0.25; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0,0,0.2,1); }
    .card-list.cdk-drop-list-dragging .card:not(.cdk-drag-placeholder) { transition: transform 250ms cubic-bezier(0,0,0.2,1); }

    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-weight: 700;
      font-size: 1rem;
      border-bottom: 1px solid var(--color-border-light, #e8f1f7);
      padding-bottom: 6px;
    }
    .order-id { color: var(--color-primary, #005f87); }
    .time { font-size: 0.82rem; color: var(--color-text-medium, #4a6572); font-weight: normal; }
    .card-body ul { margin: 0; padding-left: 18px; font-size: 0.9rem; color: var(--color-text-high, #0d2633); }
    .card-body li { margin-bottom: 4px; }
    .agregados { font-size: 0.78rem; color: var(--color-secondary, #00897b); margin-left: 4px; }
    .card-actions { display: flex; gap: 8px; margin-top: 10px; }
    .action-btn {
      padding: 5px 10px;
      border-radius: var(--radius-sm, 6px);
      border: none;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.82rem;
      font-family: 'Inter', sans-serif;
    }
    .action-btn.deliver { background: var(--color-success, #1a7f5c); color: #fff; }
    .action-btn.cancel { background: var(--color-error, #c62828); color: #fff; }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-msg { text-align: center; color: var(--color-text-low, #7a9aaa); font-size: 0.9rem; padding: 24px 0; }

    @media (max-width: 768px) {
      .board-container { padding: 12px; height: auto; min-height: calc(100vh - 64px); }
      .board { flex-direction: column; overflow-x: visible; overflow-y: auto; gap: 16px; }
      .column { min-width: 0; max-height: none; }
      .card-list { min-height: 80px; }
      .board-header h2 { font-size: 1.2rem; }
      .board-header p { display: none; }
    }

    @media (max-width: 480px) {
      .board-container { padding: 10px; }
      .board-header { margin-bottom: 12px; }
      .card { padding: 10px; }
    }
  `]
})
export class KitchenBoardComponent implements OnInit, OnDestroy {
  private ventasService = inject(VentasService);
  private sseService = inject(VentasSseService);
  private sseSub?: Subscription;

  nuevos: VentaResponse[] = [];
  enPreparacion: VentaResponse[] = [];
  listos: VentaResponse[] = [];

  ngOnInit() {
    this.loadVentas();

    // Habilitar conexión SSE en tiempo real
    this.sseService.connect();
    this.sseSub = this.sseService.ventas$.subscribe({
      next: (ventas: VentaResponse[]) => {
        this.updateLocalLists(ventas);
      },
      error: (err) => {
        console.error('Error en stream SSE de cocina', err);
      }
    });
  }

  ngOnDestroy() {
    if (this.sseSub) {
      this.sseSub.unsubscribe();
    }
    this.sseService.disconnect();
  }

  loadVentas() {
    this.ventasService.getVentasCocina().subscribe({
      next: (ventas: VentaResponse[]) => {
        this.updateLocalLists(ventas);
      },
      error: err => {
        console.error('Error cargando ventas de cocina', err);
      }
    });
  }

  private updateLocalLists(ventas: VentaResponse[]) {
    this.nuevos = ventas.filter(v => this.isEstadoNuevo(v.estadoVenta));
    this.enPreparacion = ventas.filter(v => this.isEstadoPreparacion(v.estadoVenta));
    this.listos = ventas.filter(v => this.isEstadoListo(v.estadoVenta));
  }

  getPlatoNombre(detalle: VentaResponse['detalles'][number]): string {
    return detalle.platoNombre ?? detalle.plato?.nombre ?? 'Plato sin nombre';
  }

  getAgregados(detalle: VentaResponse['detalles'][number]): string[] {
    if (detalle.agregados?.length) {
      return detalle.agregados.map(agregado => agregado.agregadoNombre);
    }

    return detalle.detalleVentaAgregados?.map(agregado => agregado.agregado.nombre) ?? [];
  }

  // Helpers to accept both backend UI labels and some legacy variants
  isEstadoNuevo(estado?: string): boolean {
    if (!estado) return false;
    const s = estado.toString().toLowerCase();
    return ['nuevos', 'nuevo', 'pendiente', 'pedido', 'recibido'].includes(s);
  }

  isEstadoPreparacion(estado?: string): boolean {
    if (!estado) return false;
    const s = estado.toString().toLowerCase();
    return ['en preparacion', 'en preparación', 'en_preparacion', 'en_preparación'].includes(s);
  }

  isEstadoListo(estado?: string): boolean {
    if (!estado) return false;
    const s = estado.toString().toLowerCase();
    return ['listos', 'listo'].includes(s);
  }

  // Pending action tracking to disable buttons while mutating
  pendingActions = new Set<number>();

  marcarEntregado(item: VentaResponse) {
    if (this.pendingActions.has(item.id)) return;
    this.pendingActions.add(item.id);
    this.ventasService.entregarVenta(item.id).subscribe({
      next: () => {
        this.pendingActions.delete(item.id);
        this.loadVentas();
      },
      error: (err) => {
        this.pendingActions.delete(item.id);
        console.error('Error marcando entregado', err);
        alert('No se pudo marcar como entregado. Intente de nuevo.');
      }
    });
  }

  marcarCancelado(item: VentaResponse) {
    if (this.pendingActions.has(item.id)) return;
    this.pendingActions.add(item.id);
    this.ventasService.cancelarVenta(item.id).subscribe({
      next: () => {
        this.pendingActions.delete(item.id);
        this.loadVentas();
      },
      error: (err) => {
        this.pendingActions.delete(item.id);
        console.error('Error marcando cancelado', err);
        alert('No se pudo cancelar el pedido. Intente de nuevo.');
      }
    });
  }

  drop(event: CdkDragDrop<VentaResponse[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const item = event.container.data[event.currentIndex];
      const targetState = event.container.id; // 'Recibido', 'En Preparación', 'Listo'

      this.ventasService.updateEstadoVenta(item.id, targetState).subscribe({
        next: () => {
          item.estadoVenta = targetState;
        },
        error: (err) => {
          console.error('Error actualizando estado', err);
          alert('Hubo un error al actualizar el estado en el servidor. Revirtiendo cambio.');
          this.loadVentas(); // Revert local state to match server
        }
      });
    }
  }
}
