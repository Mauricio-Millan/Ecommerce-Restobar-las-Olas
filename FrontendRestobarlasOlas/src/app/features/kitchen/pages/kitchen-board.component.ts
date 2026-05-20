import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { VentasService } from '../../../core/ventas/ventas.service';
import { VentaResponse } from '../../../core/ventas/venta.model';

@Component({
  selector: 'app-kitchen-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
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
        <div class="column">
          <h3 class="column-title nuevos">Nuevos</h3>
          <div
            cdkDropList
            #nuevosList="cdkDropList"
            id="Nuevos"
            [cdkDropListData]="nuevos"
            [cdkDropListConnectedTo]="[preparacionList, listosList]"
            class="card-list"
            (cdkDropListDropped)="drop($event)">
            
            <div class="card" *ngFor="let item of nuevos" cdkDrag>
              <div class="card-header">
                <span class="order-id">#{{ item.id }}</span>
                <span class="time">{{ item.fechaCreacion | date:'shortTime' }}</span>
              </div>
              <div class="card-body">
                <ul>
                  <li *ngFor="let det of item.detalles">
                    <strong>{{ det.cantidad }}x</strong> {{ getPlatoNombre(det) }}
                    <div class="agregados" *ngIf="getAgregados(det).length">
                      + <span *ngFor="let a of getAgregados(det); let last=last">{{ a }}{{ last ? '' : ', ' }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="empty-msg" *ngIf="!nuevos.length">Sin pedidos</div>
          </div>
        </div>

        <!-- Columna: En Preparación -->
        <div class="column">
          <h3 class="column-title preparacion">En Preparación</h3>
            <div
            cdkDropList
            #preparacionList="cdkDropList"
            id="En Preparacion"
            [cdkDropListData]="enPreparacion"
            [cdkDropListConnectedTo]="[nuevosList, listosList]"
            class="card-list"
            (cdkDropListDropped)="drop($event)">
            
            <div class="card" *ngFor="let item of enPreparacion" cdkDrag>
              <div class="card-header">
                <span class="order-id">#{{ item.id }}</span>
                <span class="time">{{ item.fechaCreacion | date:'shortTime' }}</span>
              </div>
              <div class="card-body">
                <ul>
                  <li *ngFor="let det of item.detalles">
                    <strong>{{ det.cantidad }}x</strong> {{ getPlatoNombre(det) }}
                    <div class="agregados" *ngIf="getAgregados(det).length">
                      + <span *ngFor="let a of getAgregados(det); let last=last">{{ a }}{{ last ? '' : ', ' }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="empty-msg" *ngIf="!enPreparacion.length">Sin pedidos</div>
          </div>
        </div>

        <!-- Columna: Listos -->
        <div class="column">
          <h3 class="column-title listos">Listos</h3>
            <div
            cdkDropList
            #listosList="cdkDropList"
            id="Listos"
            [cdkDropListData]="listos"
            [cdkDropListConnectedTo]="[nuevosList, preparacionList]"
            class="card-list"
            (cdkDropListDropped)="drop($event)">
            
            <div class="card" *ngFor="let item of listos" cdkDrag>
              <div class="card-header">
                <span class="order-id">#{{ item.id }}</span>
                <span class="time">{{ item.fechaCreacion | date:'shortTime' }}</span>
              </div>
              <div class="card-body">
                <ul>
                  <li *ngFor="let det of item.detalles">
                    <strong>{{ det.cantidad }}x</strong> {{ getPlatoNombre(det) }}
                  </li>
                </ul>
              </div>
              <div class="card-actions">
                <button class="action-btn deliver" (click)="marcarEntregado(item)" [disabled]="pendingActions.has(item.id)">Entregado</button>
                <button class="action-btn cancel" (click)="marcarCancelado(item)" [disabled]="pendingActions.has(item.id)">Cancelar</button>
              </div>
            </div>
            <div class="empty-msg" *ngIf="!listos.length">Sin pedidos</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .board-container {
      padding: 24px;
      height: calc(100vh - 64px);
      background-color: #f4f7f9;
      font-family: 'Source Sans 3', sans-serif;
      display: flex;
      flex-direction: column;
    }
    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .board-header h2 {
      margin: 0;
      color: #1d2b2a;
      font-family: 'Fraunces', serif;
    }
    .board-header p {
      margin: 4px 0 0;
      color: #666;
      font-size: 0.9rem;
    }
    .refresh-btn {
      padding: 8px 16px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: #1f6f8b;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .refresh-btn:hover { background: #f0f0f0; }
    
    .board {
      display: flex;
      gap: 24px;
      flex: 1;
      overflow-x: auto;
    }
    .column {
      flex: 1;
      min-width: 300px;
      background: #e2e8f0;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      max-height: 100%;
    }
    .column-title {
      padding: 16px;
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      border-bottom: 2px solid transparent;
    }
    .column-title.nuevos { color: #b42318; border-color: #b42318; }
    .column-title.preparacion { color: #d97706; border-color: #d97706; }
    .column-title.listos { color: #059669; border-color: #059669; }

    .card-list {
      padding: 12px;
      flex: 1;
      overflow-y: auto;
      min-height: 200px;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: grab;
      border-left: 4px solid #1f6f8b;
    }
    .card:active { cursor: grabbing; }
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 5px 15px -3px rgba(0,0,0,0.2), 0 8px 10px -5px rgba(0,0,0,0.14);
      background: white;
    }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .card-list.cdk-drop-list-dragging .card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-weight: 700;
      font-size: 1.1rem;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 4px;
    }
    .order-id { color: #1f6f8b; }
    .time { font-size: 0.85rem; color: #666; font-weight: normal; }
    .card-body ul {
      margin: 0;
      padding-left: 20px;
      font-size: 0.9rem;
    }
    .card-body li { margin-bottom: 4px; }
    .agregados {
      font-size: 0.8rem;
      color: #d97706;
      margin-left: 4px;
    }
    .card-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .action-btn {
      padding: 6px 10px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 700;
    }
    .action-btn.deliver { background: #059669; color: white; }
    .action-btn.cancel { background: #b42318; color: white; }
    .empty-msg {
      text-align: center;
      color: #94a3b8;
      font-size: 0.9rem;
      padding: 20px 0;
    }
  `]
})
export class KitchenBoardComponent implements OnInit, OnDestroy {
  private ventasService = inject(VentasService);
  private pollInterval: any;

  nuevos: VentaResponse[] = [];
  enPreparacion: VentaResponse[] = [];
  listos: VentaResponse[] = [];

  ngOnInit() {
    this.loadVentas();
    // Refresco cada 15 segundos
    this.pollInterval = setInterval(() => {
      this.loadVentas();
    }, 15000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadVentas() {
    this.ventasService.getVentasCocina().subscribe({
      next: (ventas: VentaResponse[]) => {
        this.nuevos = ventas.filter(v => this.isEstadoNuevo(v.estadoVenta));
        this.enPreparacion = ventas.filter(v => this.isEstadoPreparacion(v.estadoVenta));
        this.listos = ventas.filter(v => this.isEstadoListo(v.estadoVenta));
      },
      error: err => {
        console.error('Error cargando ventas de cocina', err);
      }
    });
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
