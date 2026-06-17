import { Component, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { VentasService } from '../../../core/ventas/ventas.service';
import { VentasSseService } from '../../../core/ventas/ventas-sse.service';
import { VentaResponse } from '../../../core/ventas/venta.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionService } from '../../../core/auth/session.service';

interface RecentOrder {
  id: number;
  fecha: string;
  total: number;
  tipoComprobante?: string;
  numeroComprobante?: string;
  estadoVenta?: string;
}

@Component({
  selector: 'app-order-tracking-page',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="tracking-container">
      <div class="tracking-wrapper">

        <!-- Header con buscador rápido -->
        <header class="tracking-header">
          <h1 class="title">Seguimiento de tu Pedido</h1>
          <p class="subtitle">Consulta el estado de tu orden en tiempo real</p>
          <div class="search-box">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Número de Pedido (ID)</mat-label>
              <input matInput type="number" [(ngModel)]="searchId" placeholder="Ej. 124" (keyup.enter)="buscarPedido()" />
              <button mat-icon-button matSuffix (click)="buscarPedido()" color="primary">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>
          </div>
        </header>

        @if (isLoading()) {
          <div class="loading-state">
            <span class="spinner"></span>
            <p>Buscando tu pedido en nuestro sistema...</p>
          </div>
        }

        @if (errorMsg()) {
          <div class="error-state">
            <mat-icon class="error-icon">warning</mat-icon>
            <p>{{ errorMsg() }}</p>
            <button mat-stroked-button (click)="errorMsg.set(null)">Entendido</button>
          </div>
        }

        @if (order() && !isLoading()) {
          <main>
            <mat-card class="status-card" [class.cancelled]="isCancelled()">

              <div class="order-meta">
                <div class="meta-item">
                  <span class="label">Pedido</span>
                  <span class="value">#{{ order()?.id }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">Fecha</span>
                  <span class="value">{{ order()?.fechaCreacion | date:'medium' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">Total</span>
                  <span class="value total-price">S/ {{ (order()?.total || getVentaTotal(order())) | number:'1.2-2' }}</span>
                </div>
                <div class="meta-item status-badge-wrapper">
                  <span class="status-badge" [class]="getStatusClass(order()?.estadoVenta)">
                    {{ order()?.estadoVenta }}
                  </span>
                </div>
              </div>

              <mat-divider></mat-divider>

              @if (!isCancelled()) {
                <div class="progress-section">
                  <div class="progress-timeline">

                    <div class="step" [class.completed]="stepIndex() >= 0" [class.active]="stepIndex() === 0">
                      <div class="step-icon-wrapper">
                        <mat-icon class="step-icon">receipt</mat-icon>
                      </div>
                      <div class="step-label">Recibido</div>
                      @if (stepIndex() >= 0) { <div class="step-time">Confirmado</div> }
                    </div>

                    <div class="step-line" [class.filled]="stepIndex() >= 1"></div>

                    <div class="step" [class.completed]="stepIndex() >= 1" [class.active]="stepIndex() === 1">
                      <div class="step-icon-wrapper">
                        <mat-icon class="step-icon">local_dining</mat-icon>
                      </div>
                      <div class="step-label">En Cocina</div>
                      @if (stepIndex() >= 1) { <div class="step-time">Preparando</div> }
                    </div>

                    <div class="step-line" [class.filled]="stepIndex() >= 2"></div>

                    <div class="step" [class.completed]="stepIndex() >= 2" [class.active]="stepIndex() === 2">
                      <div class="step-icon-wrapper">
                        <mat-icon class="step-icon">room_service</mat-icon>
                      </div>
                      <div class="step-label">Listo</div>
                      @if (stepIndex() >= 2) { <div class="step-time">¡Servido!</div> }
                    </div>

                    <div class="step-line" [class.filled]="stepIndex() >= 3"></div>

                    <div class="step" [class.completed]="stepIndex() >= 3" [class.active]="stepIndex() === 3">
                      <div class="step-icon-wrapper">
                        <mat-icon class="step-icon">sports_motorsports</mat-icon>
                      </div>
                      <div class="step-label">Entregado</div>
                      @if (stepIndex() >= 3) { <div class="step-time">¡Disfrutado!</div> }
                    </div>

                  </div>
                  <div class="realtime-indicator">
                    <span class="pulse-dot"></span>
                    <span class="indicator-text">Actualizando en tiempo real</span>
                  </div>
                </div>
              }

              @if (isCancelled()) {
                <div class="cancelled-banner">
                  <mat-icon class="banner-icon">cancel</mat-icon>
                  <div class="banner-text">
                    <h3>Este pedido ha sido Cancelado</h3>
                    <p>Si tienes alguna consulta, por favor comunícate con soporte o llama a la tienda.</p>
                  </div>
                </div>
              }

            </mat-card>

            <div class="details-grid">

              <mat-card class="detail-card items-card">
                <mat-card-header>
                  <mat-card-title>Platos seleccionados</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="items-list">
                    @for (det of order()?.detalles; track $index) {
                      <div class="item-row">
                        <div class="item-qty">{{ det.cantidad }}x</div>
                        <div class="item-info">
                          <div class="item-name">{{ getPlatoNombre(det) }}</div>
                          @if (getAgregados(det).length) {
                            <div class="item-agregados">
                              + @for (a of getAgregados(det); track a; let last = $last) {<span>{{ a }}{{ last ? '' : ', ' }}</span>}
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="detail-card info-card">
                <mat-card-header>
                  <mat-card-title>Datos de entrega y facturación</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-list">
                    <div class="info-row">
                      <span class="info-label">Tipo de Entrega:</span>
                      <span class="info-val">{{ order()?.direccionEntrega ? 'Delivery a domicilio' : 'Recojo en restaurante' }}</span>
                    </div>
                    @if (order()?.direccionEntrega) {
                      <div class="info-row">
                        <span class="info-label">Dirección:</span>
                        <span class="info-val">{{ order()?.direccionEntrega }}</span>
                      </div>
                    }
                    <div class="info-row">
                      <span class="info-label">Método de Pago:</span>
                      <span class="info-val">{{ order()?.metodoPago || 'Simulado' }}</span>
                    </div>
                    @if (order()?.numeroComprobante) {
                      <div class="info-row">
                        <span class="info-label">Documento Comprobante:</span>
                        <span class="info-val">{{ order()?.tipoComprobante }}: {{ order()?.numeroComprobante }}</span>
                      </div>
                    }
                    @if (order()?.voucherUrl) {
                      <div class="info-row pdf-row">
                        <span class="info-label">Comprobante de Pago:</span>
                        <a mat-flat-button color="accent" [href]="order()?.voucherUrl" target="_blank" class="download-pdf-btn">
                          <mat-icon>picture_as_pdf</mat-icon> Descargar PDF
                        </a>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>

            </div>
          </main>
        }

        @if (!order() && !isLoading()) {
          <section class="recent-orders-section">
            <mat-card class="recent-card">
              <mat-card-header>
                <mat-card-title>Tus Pedidos Recientes</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p class="description">
                  {{ isUserAuthenticated()
                    ? 'Selecciona uno de tus pedidos anteriores para rastrear su progreso en tiempo real.'
                    : 'Selecciona un pedido que hayas realizado recientemente en este navegador para rastrear su progreso en vivo.' }}
                </p>

                @if (recentOrders().length > 0) {
                  <div class="recent-list">
                    @for (ro of recentOrders(); track ro.id) {
                      <div class="recent-item" (click)="verPedido(ro.id)">
                        <div class="recent-left">
                          <div class="recent-id-row">
                            <span class="recent-id">Pedido #{{ ro.id }}</span>
                            @if (ro.estadoVenta) {
                              <span class="status-badge" [class]="getStatusClass(ro.estadoVenta)">{{ ro.estadoVenta }}</span>
                            }
                          </div>
                          <span class="recent-date">{{ ro.fecha | date:'short' }}</span>
                        </div>
                        <div class="recent-right">
                          <span class="recent-total">S/ {{ ro.total | number:'1.2-2' }}</span>
                          <mat-icon class="arrow-icon">chevron_right</mat-icon>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="empty-state">
                    <mat-icon class="empty-icon">history</mat-icon>
                    <p>Aún no tienes pedidos registrados.</p>
                    <p class="small">
                      {{ isUserAuthenticated()
                        ? 'Realiza un pedido desde la carta para verlo aquí.'
                        : 'Realiza una compra desde el carrito para poder rastrearla aquí.' }}
                    </p>
                    <a mat-flat-button color="primary" routerLink="/menu" style="margin-top: 12px;">Ir a la carta</a>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </section>
        }

      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; }
    .tracking-container {
      min-height: calc(100vh - 72px);
      background-color: var(--color-bg, #f7f9fc);
      padding: 40px 20px;
    }
    .tracking-wrapper {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .tracking-header {
      text-align: center;
      margin-bottom: 8px;
    }
    .tracking-header .title {
      font-family: 'Fraunces', serif;
      color: var(--color-primary-dark, #003f5c);
      font-size: 2rem;
      margin: 0;
      font-weight: 700;
    }
    .tracking-header .subtitle {
      color: var(--color-text-medium, #4a6572);
      font-size: 1.05rem;
      margin: 8px 0 24px;
    }
    .search-box { max-width: 400px; margin: 0 auto; }
    .search-field { width: 100%; }

    .loading-state, .error-state {
      text-align: center;
      padding: 40px;
      background: var(--color-surface, #fff);
      border-radius: var(--radius-md, 12px);
      box-shadow: var(--shadow-md, 0 4px 16px rgba(0,63,92,0.1));
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .error-icon { font-size: 48px; width: 48px; height: 48px; color: var(--color-error, #c62828); }
    .spinner {
      width: 48px; height: 48px;
      border: 5px solid var(--color-border, #d0e3ed);
      border-top-color: var(--color-primary, #005f87);
      border-radius: 50%;
      animation: spin 1s infinite linear;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .status-card {
      padding: 24px;
      border-radius: var(--radius-lg, 16px) !important;
      box-shadow: var(--shadow-lg, 0 10px 32px rgba(0,63,92,0.12)) !important;
      border-left: 5px solid var(--color-primary, #005f87);
      margin-bottom: 0;
    }
    .status-card.cancelled { border-left-color: var(--color-error, #c62828); }

    .order-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 20px;
    }
    .meta-item { display: flex; flex-direction: column; gap: 4px; }
    .meta-item .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--color-text-medium, #4a6572);
      letter-spacing: 0.1em;
    }
    .meta-item .value { font-size: 1.2rem; font-weight: 700; color: var(--color-text-high, #0d2633); }
    .meta-item .total-price { color: var(--color-primary, #005f87); }

    .progress-section {
      padding: 28px 0 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .progress-timeline {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 2;
      flex: 1;
    }
    .step-icon-wrapper {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: var(--color-surface-raised, #f0f6fa);
      border: 3px solid var(--color-border, #d0e3ed);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-low, #7a9aaa);
      transition: all 0.4s ease;
    }
    .step-icon { font-size: 24px; width: 24px; height: 24px; }
    .step-label {
      margin-top: 10px;
      font-weight: 700;
      color: var(--color-text-low, #7a9aaa);
      font-size: 0.9rem;
      transition: color 0.4s ease;
    }
    .step-time {
      font-size: 0.75rem;
      color: var(--color-secondary, #00897b);
      margin-top: 2px;
      font-weight: 600;
    }
    .step-line {
      height: 4px;
      background: var(--color-border, #d0e3ed);
      flex-grow: 1;
      margin: 0 -24px;
      position: relative;
      top: -18px;
      z-index: 1;
      transition: background 0.4s ease;
    }
    .step.completed .step-icon-wrapper {
      background: var(--color-success-surface, #e3f6ee);
      border-color: var(--color-success, #1a7f5c);
      color: var(--color-success, #1a7f5c);
    }
    .step.completed .step-label { color: var(--color-success, #1a7f5c); }
    .step.active .step-icon-wrapper {
      background: var(--color-primary, #005f87);
      border-color: var(--color-primary, #005f87);
      color: #fff;
      transform: scale(1.15);
      animation: pulse-step 2s infinite alternate;
    }
    .step.active .step-label { color: var(--color-primary, #005f87); font-size: 1rem; }
    .step-line.filled { background: var(--color-success, #1a7f5c); }

    @keyframes pulse-step {
      0% { box-shadow: 0 0 0 0 rgba(0,95,135,0.4); }
      100% { box-shadow: 0 0 0 12px rgba(0,95,135,0); }
    }

    .realtime-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-success-surface, #e3f6ee);
      border: 1px solid #a7f3d0;
      padding: 6px 14px;
      border-radius: var(--radius-pill, 999px);
    }
    .pulse-dot {
      width: 8px; height: 8px;
      background: var(--color-success, #1a7f5c);
      border-radius: 50%;
      animation: pulse-dot 1.5s infinite;
    }
    @keyframes pulse-dot {
      0% { transform: scale(0.8); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.8); opacity: 0.5; }
    }
    .indicator-text { font-size: 0.8rem; font-weight: 600; color: var(--color-success, #1a7f5c); }

    .cancelled-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--color-error-surface, #fdecea);
      border: 1px solid #ffcdd2;
      border-radius: var(--radius-md, 12px);
      margin-top: 16px;
    }
    .banner-icon { color: var(--color-error, #c62828); font-size: 32px; width: 32px; height: 32px; }
    .banner-text h3 { margin: 0; color: var(--color-error, #c62828); font-size: 1.1rem; }
    .banner-text p { margin: 4px 0 0; color: var(--color-text-medium, #4a6572); font-size: 0.9rem; }

    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .detail-card { border-radius: var(--radius-md, 12px) !important; box-shadow: var(--shadow-sm) !important; }
    .detail-card mat-card-title {
      font-family: 'Fraunces', serif !important;
      color: var(--color-primary-dark, #003f5c) !important;
      font-size: 1.15rem !important;
    }
    .items-list { display: flex; flex-direction: column; gap: 12px; }
    .item-row { display: flex; gap: 12px; align-items: flex-start; }
    .item-qty { font-weight: 700; color: var(--color-secondary, #00897b); min-width: 28px; }
    .item-name { font-weight: 600; color: var(--color-text-high, #0d2633); }
    .item-agregados { font-size: 0.8rem; color: var(--color-secondary, #00897b); }

    .info-list { display: flex; flex-direction: column; gap: 12px; }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.92rem;
    }
    .info-label { color: var(--color-text-medium, #4a6572); font-weight: 600; }
    .info-val { font-weight: 700; color: var(--color-text-high, #0d2633); }
    .pdf-row { margin-top: 8px; border-top: 1px dashed var(--color-border, #d0e3ed); padding-top: 12px; }
    .download-pdf-btn { border-radius: var(--radius-pill, 999px) !important; }

    .recent-card {
      border-radius: var(--radius-lg, 16px) !important;
      box-shadow: var(--shadow-md) !important;
    }
    .recent-card mat-card-title {
      font-family: 'Fraunces', serif !important;
      color: var(--color-primary-dark, #003f5c) !important;
      font-size: 1.35rem !important;
    }
    .recent-orders-section .description { color: var(--color-text-medium, #4a6572); margin: 8px 0 20px; }
    .recent-list { display: flex; flex-direction: column; gap: 10px; }
    .recent-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border: 1px solid var(--color-border-light, #e8f1f7);
      border-radius: var(--radius-md, 12px);
      cursor: pointer;
      background: var(--color-surface, #fff);
      transition: border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
    }
    .recent-item:hover {
      border-color: var(--color-primary, #005f87);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .recent-left { display: flex; flex-direction: column; gap: 4px; }
    .recent-id-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .recent-id { font-weight: 700; color: var(--color-primary, #005f87); font-size: 1.05rem; }
    .recent-date { color: var(--color-text-medium, #4a6572); font-size: 0.85rem; }
    .recent-right { display: flex; align-items: center; gap: 10px; }
    .recent-total { font-weight: 700; font-size: 1.05rem; color: var(--color-text-high, #0d2633); }
    .arrow-icon { color: var(--color-border, #d0e3ed); }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; color: var(--color-border, #d0e3ed); margin-bottom: 8px; }
    .empty-state p { margin: 0; color: var(--color-text-medium, #4a6572); font-weight: 600; }
    .empty-state .small { color: var(--color-text-low, #7a9aaa); font-size: 0.85rem; font-weight: normal; }

    @media (max-width: 768px) {
      .details-grid { grid-template-columns: 1fr; }
      .progress-timeline { flex-direction: column; gap: 24px; align-items: flex-start; padding-left: 20px; }
      .step { flex-direction: row; gap: 16px; align-items: center; text-align: left; width: 100%; }
      .step-line { width: 4px; height: 32px; margin: -16px 0 -16px 22px; top: 0; left: 0; }
      .step-time { margin-top: 0; margin-left: auto; }
      .order-meta { flex-direction: column; align-items: flex-start; gap: 12px; }
      .status-badge-wrapper { width: 100%; }
    }
  `]
})
export class OrderTrackingPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private ventasService = inject(VentasService);
  private sseService = inject(VentasSseService);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);

  private routeSub?: Subscription;
  private sseSub?: Subscription;

  // State signals
  order = signal<any | null>(null);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  recentOrders = signal<RecentOrder[]>([]);
  isUserAuthenticated = signal(false);
  
  searchId = '';

  // Derived signals
  stepIndex = computed(() => {
    const estado = this.order()?.estadoVenta;
    if (!estado) return -1;
    const s = estado.toString().toLowerCase();
    
    // Etapa 1: Recibido / Nuevo
    if (['nuevos', 'nuevo', 'pendiente', 'pedido', 'recibido'].includes(s)) {
      return 0;
    }
    // Etapa 2: En Cocina
    if (['en preparacion', 'en preparación', 'en_preparacion', 'en_preparación'].includes(s)) {
      return 1;
    }
    // Etapa 3: Listo
    if (['listos', 'listo'].includes(s)) {
      return 2;
    }
    // Etapa 4: Entregado
    if (['entregado', 'entregada'].includes(s)) {
      return 3;
    }
    
    return -1;
  });

  isCancelled = computed(() => {
    const estado = this.order()?.estadoVenta;
    if (!estado) return false;
    const s = estado.toString().toLowerCase();
    return ['cancelado', 'cancelada'].includes(s);
  });

  ngOnInit() {
    // Cargar pedidos recientes (desde backend si está autenticado, sino desde LocalStorage)
    if (this.isBrowser) {
      const logged = this.sessionService.isAuthenticated();
      this.isUserAuthenticated.set(logged);
      if (logged) {
        this.authService.ensureProfileLoaded()
          .then(profile => {
            if (profile && profile.id) {
              this.loadUserOrdersFromBackend(profile.id);
            } else {
              this.loadRecentOrders();
            }
          })
          .catch(e => {
            console.error('Error cargando perfil del usuario:', e);
            this.loadRecentOrders();
          });
      } else {
        this.loadRecentOrders();
      }
    }

    // Escuchar parámetros de ruta
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.trackOrder(Number(id));
      } else {
        this.order.set(null);
      }
    });

    // Conectar a SSE para escuchar actualizaciones automáticas (Escenario 2)
    if (this.isBrowser) {
      this.sseService.connect();
      
      this.sseSub = this.sseService.ventas$.subscribe(updatedVentas => {
        const activeOrder = this.order();
        if (activeOrder) {
          // Buscar si el pedido que rastreamos está en la lista de actualizaciones
          const updated = updatedVentas.find(v => v.id === activeOrder.id);
          if (updated) {
            console.log('[OrderTracking] Pedido actualizado vía SSE:', updated);
            // Actualizamos el estadoVenta y detalles del objeto reactivamente
            this.order.set({
              ...activeOrder,
              estadoVenta: updated.estadoVenta,
              detalles: updated.detalles
            });
            // Actualizar también la fecha o datos de LocalStorage
            this.updateRecentOrderInStorage(updated.id, updated.estadoVenta);
          } else {
            // Si el pedido NO está en las ventas activas (Kanban) pero ya estaba cargado,
            // podría haberse cancelado o entregado recientemente.
            // Para confirmar el estado, hacemos una consulta rápida por HTTP
            this.ventasService.getEstadoVenta(activeOrder.id).subscribe({
              next: (res) => {
                if (res && res.estadoVenta !== activeOrder.estadoVenta) {
                  console.log('[OrderTracking] Estado cambiado detectado vía HTTP check:', res.estadoVenta);
                  this.order.set({
                    ...activeOrder,
                    estadoVenta: res.estadoVenta
                  });
                  this.updateRecentOrderInStorage(activeOrder.id, res.estadoVenta);
                }
              }
            });
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.sseSub) this.sseSub.unsubscribe();
    // No desconectamos globalmente para que otras pantallas (ej. cocina) puedan seguir usando el SSE si se navega
  }

  trackOrder(id: number) {
    this.isLoading.set(true);
    this.errorMsg.set(null);

    this.ventasService.getVentaById(id).subscribe({
      next: (venta) => {
        this.isLoading.set(false);
        if (venta) {
          this.order.set(venta);
          // Registrar en pedidos recientes si es en el browser
          if (this.isBrowser) {
            this.saveRecentOrder(venta);
          }
        } else {
          this.order.set(null);
          this.errorMsg.set(`No se encontró ningún pedido con el número #${id}.`);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.order.set(null);
        console.error('Error cargando pedido', err);
        this.errorMsg.set(`Ocurrió un error al cargar el pedido #${id}. Por favor verifica el número o intenta más tarde.`);
      }
    });
  }

  buscarPedido() {
    const id = Number(this.searchId.trim());
    if (id && !isNaN(id)) {
      void this.router.navigate(['/seguimiento', id]);
      this.searchId = '';
    } else {
      this.errorMsg.set('Por favor, ingresa un número de pedido válido.');
    }
  }

  verPedido(id: number) {
    void this.router.navigate(['/seguimiento', id]);
  }

  getPlatoNombre(detalle: any): string {
    return detalle.platoNombre ?? detalle.plato?.nombre ?? 'Plato sin nombre';
  }

  getAgregados(detalle: any): string[] {
    if (detalle.agregados?.length) {
      return detalle.agregados.map((a: any) => a.agregadoNombre);
    }
    return detalle.detalleVentaAgregados?.map((da: any) => da.agregado?.nombre).filter(Boolean) || [];
  }

  getVentaTotal(venta: any): number {
    if (!venta || !venta.detalles) return 0;
    return venta.detalles.reduce((acc: number, item: any) => {
      const precioPlato = item.precioUnitarioHistorico || item.plato?.precio || 0;
      const agregadosTotal = (item.agregados || []).reduce((sum: number, a: any) => sum + (a.precioExtraHistorico || 0), 0);
      return acc + (precioPlato + agregadosTotal) * item.cantidad;
    }, 0);
  }

  getStatusClass(estado?: string): string {
    if (!estado) return '';
    const s = estado.toString().toLowerCase();
    if (['nuevos', 'nuevo', 'pendiente', 'pedido', 'recibido'].includes(s)) return 'nuevo';
    if (['en preparacion', 'en preparación', 'en_preparacion', 'en_preparación'].includes(s)) return 'preparacion';
    if (['listos', 'listo'].includes(s)) return 'listo';
    if (['entregado', 'entregada'].includes(s)) return 'entregado';
    if (['cancelado', 'cancelada'].includes(s)) return 'cancelado';
    return '';
  }

  // --- Manejo de LocalStorage para pedidos recientes ---

  // --- Manejo de pedidos para el historial ---

  private loadUserOrdersFromBackend(userId: string) {
    this.isLoading.set(true);
    this.ventasService.getVentasPorUsuario(userId).subscribe({
      next: (ventas) => {
        this.isLoading.set(false);
        const mapped: RecentOrder[] = (ventas || []).map(v => ({
          id: v.id,
          fecha: v.fechaCreacion || new Date().toISOString(),
          total: v.total || this.getVentaTotal(v),
          tipoComprobante: v.tipoComprobante,
          numeroComprobante: v.numeroComprobante,
          estadoVenta: v.estadoVenta
        }));
        this.recentOrders.set(mapped);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error cargando pedidos desde el backend', err);
        // Fallback to localStorage
        this.loadRecentOrders();
      }
    });
  }

  private loadRecentOrders() {
    try {
      const stored = localStorage.getItem('lasolas_recent_orders');
      if (stored) {
        this.recentOrders.set(JSON.parse(stored) as RecentOrder[]);
      }
    } catch (e) {
      console.error('Error cargando pedidos recientes de localStorage', e);
    }
  }

  private saveRecentOrder(venta: any) {
    try {
      const currentList = [...this.recentOrders()];
      // Verificar si ya existe en la lista
      const exists = currentList.some(o => o.id === venta.id);
      if (!exists) {
        const newOrder: RecentOrder = {
          id: venta.id,
          fecha: venta.fechaCreacion || new Date().toISOString(),
          total: venta.total || this.getVentaTotal(venta),
          tipoComprobante: venta.tipoComprobante,
          numeroComprobante: venta.numeroComprobante,
          estadoVenta: venta.estadoVenta
        };
        const updated = [newOrder, ...currentList].slice(0, 10); // Guardar máximo 10
        this.recentOrders.set(updated);
        
        // Solo guardar en LocalStorage si no está autenticado
        if (!this.sessionService.isAuthenticated()) {
          localStorage.setItem('lasolas_recent_orders', JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error('Error guardando pedido', e);
    }
  }

  private updateRecentOrderInStorage(id: number, estado: string) {
    console.log(`[RecentOrders] Notificación de estado para pedido #${id}: ${estado}`);
    const currentList = this.recentOrders();
    const index = currentList.findIndex(o => o.id === id);
    if (index !== -1) {
      const updatedList = [...currentList];
      updatedList[index] = {
        ...updatedList[index],
        estadoVenta: estado
      };
      this.recentOrders.set(updatedList);
      
      // Si no está autenticado, actualizar LocalStorage
      if (!this.sessionService.isAuthenticated()) {
        try {
          localStorage.setItem('lasolas_recent_orders', JSON.stringify(updatedList));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}
