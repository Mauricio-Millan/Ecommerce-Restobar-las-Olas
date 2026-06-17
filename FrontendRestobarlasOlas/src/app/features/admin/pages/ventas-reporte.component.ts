import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AdminService, PlatoMasVendido } from '../../../core/admin/admin.service';

@Component({
  selector: 'ventas-reporte',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="reporte-container">

      <!-- ── Encabezado ─────────────────────────────────────────── -->
      <div class="page-header">
        <div>
          <p class="eyebrow">Iteración 6 · HU-17</p>
          <h2>Consultar Ventas</h2>
          <p class="header-sub">Estadísticas de rendimiento y exportación de reportes diarios.</p>
        </div>
        <button mat-stroked-button (click)="loadReporte()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </div>

      <!-- ── Tarjetas de resumen ─────────────────────────────────── -->
      <div class="stats-grid">
        <div class="stat-card">
          <mat-icon class="stat-icon primary">bar_chart</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ totalPedidos() | number }}</div>
            <div class="stat-label">Total pedidos registrados</div>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon class="stat-icon success">payments</mat-icon>
          <div class="stat-body">
            <div class="stat-value">S/ {{ totalIngresos() | number:'1.2-2' }}</div>
            <div class="stat-label">Ingresos totales</div>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon class="stat-icon warning">emoji_events</mat-icon>
          <div class="stat-body">
            <div class="stat-value">{{ platoTop()?.platoNombre ?? '—' }}</div>
            <div class="stat-label">Plato más vendido</div>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon class="stat-icon info">trending_up</mat-icon>
          <div class="stat-body">
            <div class="stat-value">S/ {{ promedioPorPlato() | number:'1.2-2' }}</div>
            <div class="stat-label">Ingreso promedio por plato</div>
          </div>
        </div>
      </div>

      <!-- ── Gráfico: Platos más vendidos ──────────────────────── -->
      <section class="panel chart-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Estadísticas</p>
            <h3>Platos más vendidos</h3>
          </div>
          <span class="limit-badge">Top {{ platosVendidos().length }}</span>
        </div>

        @if (loading()) {
          <div class="state-box">
            <div class="spinner"></div>
            <span>Cargando reporte...</span>
          </div>
        }
        @if (error() && !loading()) {
          <div class="state-box error-state">
            <mat-icon>error_outline</mat-icon>
            <span>{{ error() }}</span>
            <button mat-stroked-button (click)="loadReporte()">Reintentar</button>
          </div>
        }
        @if (!loading() && !error() && !platosVendidos().length) {
          <div class="state-box empty-state">
            <mat-icon>inventory_2</mat-icon>
            <span>No hay datos de ventas disponibles.</span>
          </div>
        }

        @if (!loading() && platosVendidos().length) {
          <div class="chart">
            @for (item of platosVendidos(); track item.platoId; let i = $index) {
              <div class="chart-row">
                <div class="chart-rank">{{ i + 1 }}</div>
                <div class="chart-info">
                  <div class="chart-name">{{ item.platoNombre }}</div>
                  <div class="chart-bar-wrap">
                    <div class="chart-bar-track">
                      <div class="chart-bar-fill"
                           [style.width.%]="barWidth(item.cantidad)"
                           [style.background]="barColor(i)">
                      </div>
                    </div>
                    <span class="chart-count">{{ item.cantidad }} ped.</span>
                  </div>
                </div>
                <div class="chart-revenue">
                  <span class="revenue-amount">S/ {{ item.ingresos | number:'1.2-2' }}</span>
                  <span class="revenue-label">ingresos</span>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- ── Exportar reportes ──────────────────────────────────── -->
      <section class="panel export-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Exportación</p>
            <h3>Reportes Diarios</h3>
          </div>
        </div>

        <div class="export-body">
          <div class="export-date-wrap">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Fecha del reporte</mat-label>
              <input matInput type="date" [(ngModel)]="fechaExport" />
              <mat-icon matSuffix>calendar_today</mat-icon>
            </mat-form-field>
            <p class="export-hint">Selecciona el día del que quieres descargar el reporte de ventas.</p>
          </div>

          <div class="export-actions">
            <button mat-flat-button color="primary" class="export-btn"
                    (click)="descargarExcel()" [disabled]="exportando() !== null">
              @if (exportando() === 'excel') {
                <div class="btn-spinner"></div>
              } @else {
                <mat-icon>table_chart</mat-icon>
              }
              Exportar Excel (.xlsx)
            </button>

            <button mat-stroked-button color="primary" class="export-btn"
                    (click)="descargarCsv()" [disabled]="exportando() !== null">
              @if (exportando() === 'csv') {
                <div class="btn-spinner btn-spinner-outlined"></div>
              } @else {
                <mat-icon>description</mat-icon>
              }
              Exportar CSV
            </button>
          </div>
        </div>

        @if (exportError()) {
          <p class="export-msg error">{{ exportError() }}</p>
        }
        @if (exportOk()) {
          <p class="export-msg success">Archivo descargado correctamente.</p>
        }
      </section>

    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; color: var(--color-text-high); display: block; }

    h2 { font-family: 'Fraunces', serif; margin: 0; font-size: 1.75rem; color: var(--color-primary-dark); }
    h3 { font-family: 'Fraunces', serif; margin: 0; font-size: 1.2rem; color: var(--color-primary-dark); }
    .eyebrow {
      text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.68rem;
      color: var(--color-secondary); margin: 0 0 4px; font-weight: 600;
    }

    /* ── Layout ──────────────────────────────────────────────── */
    .reporte-container { display: flex; flex-direction: column; gap: 20px; }

    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; flex-wrap: wrap;
    }
    .header-sub { margin: 6px 0 0; color: var(--color-text-medium); font-size: 0.92rem; }

    /* ── Stats ───────────────────────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: var(--shadow-sm);
      transition: box-shadow var(--transition-fast);
    }
    .stat-card:hover { box-shadow: var(--shadow-md); }
    .stat-icon {
      font-size: 28px; width: 28px; height: 28px;
      padding: 10px;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }
    .stat-icon.primary { background: var(--color-primary-surface); color: var(--color-primary); }
    .stat-icon.success { background: var(--color-success-surface); color: var(--color-success); }
    .stat-icon.warning { background: var(--color-warning-surface); color: var(--color-warning); }
    .stat-icon.info    { background: var(--color-info-surface); color: var(--color-info); }

    .stat-value { font-size: 1.25rem; font-weight: 800; color: var(--color-text-high); line-height: 1.2; }
    .stat-label { font-size: 0.78rem; color: var(--color-text-medium); margin-top: 2px; }

    /* ── Panel ───────────────────────────────────────────────── */
    .panel {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 22px 24px;
      box-shadow: var(--shadow-sm);
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--color-border-light);
    }
    .limit-badge {
      background: var(--color-primary-surface);
      color: var(--color-primary);
      font-size: 0.75rem; font-weight: 700;
      padding: 3px 10px;
      border-radius: var(--radius-pill);
    }

    /* ── States ──────────────────────────────────────────────── */
    .state-box {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; padding: 40px 0;
      color: var(--color-text-medium); font-size: 0.95rem;
    }
    .state-box mat-icon { font-size: 36px; width: 36px; height: 36px; opacity: 0.5; }
    .state-box.error-state { color: var(--color-error); }
    .state-box.error-state mat-icon { opacity: 0.8; }
    .state-box.empty-state mat-icon { color: var(--color-text-low); }

    .spinner {
      width: 32px; height: 32px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Chart ───────────────────────────────────────────────── */
    .chart { display: flex; flex-direction: column; gap: 14px; }

    .chart-row {
      display: grid;
      grid-template-columns: 28px 1fr 120px;
      align-items: center;
      gap: 12px;
    }
    .chart-rank {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: var(--color-primary-surface);
      color: var(--color-primary);
      font-size: 0.8rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .chart-row:first-child .chart-rank {
      background: var(--color-warning-surface);
      color: var(--color-warning);
    }

    .chart-info { display: flex; flex-direction: column; gap: 5px; }
    .chart-name { font-weight: 600; font-size: 0.9rem; color: var(--color-text-high); }

    .chart-bar-wrap {
      display: flex; align-items: center; gap: 10px;
    }
    .chart-bar-track {
      flex: 1; height: 8px;
      background: var(--color-surface-elevated);
      border-radius: var(--radius-pill);
      overflow: hidden;
    }
    .chart-bar-fill {
      height: 100%;
      border-radius: var(--radius-pill);
      transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .chart-count { font-size: 0.78rem; font-weight: 600; color: var(--color-text-medium); white-space: nowrap; }

    .chart-revenue { text-align: right; }
    .revenue-amount { display: block; font-weight: 800; font-size: 0.95rem; color: var(--color-primary); }
    .revenue-label { font-size: 0.72rem; color: var(--color-text-low); }

    /* ── Export ──────────────────────────────────────────────── */
    .export-body {
      display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;
    }
    .export-date-wrap { display: flex; flex-direction: column; gap: 6px; }
    .export-hint { margin: 0; font-size: 0.82rem; color: var(--color-text-medium); max-width: 280px; }

    .export-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding-top: 4px; }

    .export-btn {
      display: flex; align-items: center; gap: 8px;
      border-radius: var(--radius-pill) !important;
      font-weight: 600 !important;
    }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .btn-spinner-outlined {
      border-color: rgba(0, 95, 135, 0.3);
      border-top-color: var(--color-primary);
    }

    .export-msg {
      margin: 12px 0 0; font-size: 0.9rem; font-weight: 600;
      padding: 10px 14px; border-radius: var(--radius-md);
    }
    .export-msg.success { background: var(--color-success-surface); color: var(--color-success); }
    .export-msg.error   { background: var(--color-error-surface); color: var(--color-error); }

    /* ── Responsive ──────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .panel { padding: 16px; }
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .stat-card { padding: 14px; }
      .stat-value { font-size: 1.05rem; }
      .chart-row { grid-template-columns: 24px 1fr; }
      .chart-revenue { display: none; }
      .export-body { flex-direction: column; }
    }

    @media (max-width: 420px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentasReporteComponent implements OnInit {
  private adminService = inject(AdminService);

  platosVendidos = signal<PlatoMasVendido[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  exportando = signal<'csv' | 'excel' | null>(null);
  exportError = signal<string | null>(null);
  exportOk = signal(false);
  fechaExport = new Date().toISOString().split('T')[0];

  totalPedidos = computed(() => this.platosVendidos().reduce((s, p) => s + p.cantidad, 0));
  totalIngresos = computed(() => this.platosVendidos().reduce((s, p) => s + p.ingresos, 0));
  platoTop = computed((): PlatoMasVendido | null => this.platosVendidos()[0] ?? null);
  promedioPorPlato = computed(() => {
    const list = this.platosVendidos();
    return list.length ? this.totalIngresos() / list.length : 0;
  });

  private maxCantidad = computed(() => Math.max(...this.platosVendidos().map(p => p.cantidad), 1));

  ngOnInit() { this.loadReporte(); }

  loadReporte() {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getPlatosMasVendidos(10).subscribe({
      next: data => { this.platosVendidos.set(data); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar el reporte. Verifique la conexión con el servidor.'); this.loading.set(false); }
    });
  }

  barWidth(cantidad: number): number {
    return Math.round((cantidad / this.maxCantidad()) * 100);
  }

  barColor(index: number): string {
    const colors = [
      'var(--color-primary)',
      'var(--color-secondary)',
      'var(--color-info)',
      'var(--color-warning)',
      'var(--color-success)',
    ];
    return colors[index % colors.length];
  }

  descargarExcel() {
    this.exportando.set('excel');
    this.exportError.set(null);
    this.exportOk.set(false);
    this.adminService.exportarExcel(this.fechaExport).subscribe({
      next: blob => { this.triggerDownload(blob, `reporte-ventas-${this.fechaExport}.xlsx`); this.exportando.set(null); this.exportOk.set(true); },
      error: () => { this.exportError.set('Error al generar el Excel. Intente nuevamente.'); this.exportando.set(null); }
    });
  }

  descargarCsv() {
    this.exportando.set('csv');
    this.exportError.set(null);
    this.exportOk.set(false);
    this.adminService.exportarCsv(this.fechaExport).subscribe({
      next: blob => { this.triggerDownload(blob, `reporte-ventas-${this.fechaExport}.csv`); this.exportando.set(null); this.exportOk.set(true); },
      error: () => { this.exportError.set('Error al generar el CSV. Intente nuevamente.'); this.exportando.set(null); }
    });
  }

  private triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
