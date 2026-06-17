import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import jsPDF from 'jspdf';
import { CartService } from '../../../core/cart/cart.service';
import { VentasService } from '../../../core/ventas/ventas.service';
import { StorageService } from '../../../core/storage/storage.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionService } from '../../../core/auth/session.service';
import { VentaPayload, VentaDetallePayload } from '../../../core/ventas/venta.model';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    DecimalPipe, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatSlideToggleModule,
    MatIconModule, MatDividerModule
  ],
  template: `
    <div class="checkout-container">
      <div class="checkout-grid">

        <!-- Formulario a la izquierda -->
        <section class="form-section">
          <mat-card class="checkout-card">
            <mat-card-header>
              <mat-card-title>Detalles de facturación y envío</mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="checkoutForm" (ngSubmit)="procesarPago()">

                <div class="form-group">
                  <mat-slide-toggle formControlName="esDelivery" color="primary">
                    Es pedido para Delivery
                  </mat-slide-toggle>
                </div>

                @if (checkoutForm.get('esDelivery')?.value) {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Dirección de Entrega</mat-label>
                    <input matInput formControlName="direccionEntrega" placeholder="Ej. Av. Las Olas 123" />
                    <mat-error>La dirección es obligatoria para el delivery</mat-error>
                  </mat-form-field>
                }

                <div class="row-group">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Método de Pago</mat-label>
                    <mat-select formControlName="metodoPago">
                      <mat-select-trigger>
                        <div class="payment-option">
                          @if (checkoutForm.get('metodoPago')?.value === 'Tarjeta') {
                            <mat-icon class="icon-card">credit_card</mat-icon>
                          }
                          @if (checkoutForm.get('metodoPago')?.value === 'Yape') {
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;margin-right:8px;vertical-align:middle;">
                              <rect width="24" height="24" rx="6" fill="#742284"/>
                              <path d="M7 8C7 8 9.5 7.5 11 11.5C12.5 7.5 15 8 15 8C15 8 13.5 12 12.5 14C11.2 16.5 10 18 9 18C8 18 7.5 17.5 8.5 15.5C9.5 13.5 11 10.5 11 10.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          }
                          @if (checkoutForm.get('metodoPago')?.value === 'Plin') {
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;margin-right:8px;vertical-align:middle;">
                              <rect width="24" height="24" rx="6" fill="#00b0ca"/>
                              <path d="M8 8H13C15.2 8 16 9.5 16 11C16 12.5 15.2 14 13 14H10V18M10 8V18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          }
                          @if (checkoutForm.get('metodoPago')?.value === 'Pago al recoger') {
                            <mat-icon class="icon-store">store</mat-icon>
                          }
                          <span>{{ checkoutForm.get('metodoPago')?.value === 'Tarjeta' ? 'Tarjeta de Crédito/Débito' : (checkoutForm.get('metodoPago')?.value === 'Pago al recoger' ? 'Pago en tienda al recoger' : checkoutForm.get('metodoPago')?.value) }}</span>
                        </div>
                      </mat-select-trigger>

                      <mat-option value="Tarjeta">
                        <div class="payment-option">
                          <mat-icon class="icon-card">credit_card</mat-icon>
                          <span>Tarjeta de Crédito/Débito</span>
                        </div>
                      </mat-option>
                      <mat-option value="Yape">
                        <div class="payment-option">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;margin-right:8px;vertical-align:middle;">
                            <rect width="24" height="24" rx="6" fill="#742284"/>
                            <path d="M7 8C7 8 9.5 7.5 11 11.5C12.5 7.5 15 8 15 8C15 8 13.5 12 12.5 14C11.2 16.5 10 18 9 18C8 18 7.5 17.5 8.5 15.5C9.5 13.5 11 10.5 11 10.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <span>Yape</span>
                        </div>
                      </mat-option>
                      <mat-option value="Plin">
                        <div class="payment-option">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;margin-right:8px;vertical-align:middle;">
                            <rect width="24" height="24" rx="6" fill="#00b0ca"/>
                            <path d="M8 8H13C15.2 8 16 9.5 16 11C16 12.5 15.2 14 13 14H10V18M10 8V18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <span>Plin</span>
                        </div>
                      </mat-option>
                      <mat-option value="Pago al recoger">
                        <div class="payment-option">
                          <mat-icon class="icon-store">store</mat-icon>
                          <span>Pago en tienda al recoger</span>
                        </div>
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                @if (checkoutForm.get('metodoPago')?.value === 'Tarjeta') {
                  <div class="card-details-section">
                    <h4>Información de la Tarjeta</h4>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nombre en la tarjeta</mat-label>
                      <input matInput formControlName="nombreTitular" placeholder="Ej. Juan Pérez" />
                      <mat-error>Requerido</mat-error>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Número de Tarjeta</mat-label>
                      <input matInput formControlName="numeroTarjeta" placeholder="0000 0000 0000 0000" maxlength="16" />
                      <mat-error>Requerido o 16 dígitos</mat-error>
                    </mat-form-field>
                    <div class="row-group">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Vencimiento (MM/YY)</mat-label>
                        <input matInput formControlName="fechaVencimiento" placeholder="12/25" maxlength="5" />
                        <mat-error>Formato MM/YY</mat-error>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>CVV</mat-label>
                        <input matInput type="password" formControlName="cvv" placeholder="123" maxlength="4" />
                        <mat-error>3 o 4 dígitos</mat-error>
                      </mat-form-field>
                    </div>
                  </div>
                }

                @if (checkoutForm.get('metodoPago')?.value === 'Yape') {
                  <div class="card-details-section">
                    <h4>Información de Yape</h4>
                    <div class="row-group">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Número de Celular</mat-label>
                        <input matInput formControlName="celularYape" placeholder="Ej. 987654321" maxlength="9" />
                        <mat-error>9 dígitos, empieza con 9</mat-error>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Código de Aprobación</mat-label>
                        <input matInput formControlName="codigoAprobacionYape" placeholder="Ej. 123456" maxlength="6" />
                        <mat-error>6 dígitos</mat-error>
                      </mat-form-field>
                    </div>
                  </div>
                }

                <mat-divider style="margin: 20px 0;"></mat-divider>

                <div class="row-group">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Tipo de Comprobante</mat-label>
                    <mat-select formControlName="tipoComprobante">
                      <mat-option value="Boleta">Boleta</mat-option>
                      <mat-option value="Factura">Factura</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>{{ checkoutForm.get('tipoComprobante')?.value === 'Boleta' ? 'DNI' : 'RUC' }}</mat-label>
                    <input matInput formControlName="numeroComprobante"
                      [maxlength]="checkoutForm.get('tipoComprobante')?.value === 'Boleta' ? 8 : 11"
                      [placeholder]="checkoutForm.get('tipoComprobante')?.value === 'Boleta' ? 'Ingresa tu DNI (8 dígitos)' : 'Ingresa tu RUC (11 dígitos)'" />
                    <mat-error>{{ checkoutForm.get('tipoComprobante')?.value === 'Boleta' ? '8 dígitos requeridos' : '11 dígitos requeridos' }}</mat-error>
                  </mat-form-field>
                </div>

              </form>
            </mat-card-content>
          </mat-card>
        </section>

        <!-- Resumen a la derecha -->
        <section class="summary-section">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>Resumen de tu pedido</mat-card-title>
            </mat-card-header>

            <mat-card-content>
              @if (cartService.cartItems().length) {
                <div class="cart-items">
                  @for (item of cartService.cartItems(); track item.id) {
                    <div class="cart-item">
                      <div class="item-qty">{{ item.quantity }}x</div>
                      <div class="item-details">
                        <div class="item-name">{{ item.plato.nombre }}</div>
                        @if (item.agregados.length) {
                          <div class="item-agregados">
                            @for (a of item.agregados; track a.id; let last = $last) {
                              <span>{{ a.nombre }}{{ !last ? ', ' : '' }}</span>
                            }
                          </div>
                        }
                      </div>
                      <div class="item-price">S/ {{ item.totalPrice | number:'1.2-2' }}</div>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-msg">No tienes productos en el carrito.</p>
              }

              <mat-divider></mat-divider>

              <div class="totals-section">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>S/ {{ subtotal() | number:'1.2-2' }}</span>
                </div>
                <div class="total-row">
                  <span>IGV (18%):</span>
                  <span>S/ {{ igv() | number:'1.2-2' }}</span>
                </div>
                <div class="total-row final-total">
                  <span>Total:</span>
                  <span>S/ {{ cartService.cartTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="action-section">
                <button mat-flat-button color="primary" class="pay-btn"
                        [disabled]="cartService.cartItems().length === 0 || isProcessing()"
                        (click)="procesarPago()">
                  {{ isProcessing() ? 'Procesando...' : 'Confirmar Pedido' }}
                </button>
                @if (formError()) {
                  <p class="error-msg">{{ formError() }}</p>
                }
              </div>

            </mat-card-content>
          </mat-card>
        </section>

      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; }
    .checkout-container {
      min-height: calc(100vh - 72px);
      background-color: var(--color-bg, #f7f9fc);
      padding: var(--space-10, 40px) var(--space-5, 20px);
    }
    .checkout-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 28px;
      max-width: 1200px;
      margin: 0 auto;
    }
    mat-card-title {
      font-family: 'Fraunces', serif !important;
      color: var(--color-primary-dark, #003f5c) !important;
      font-size: 1.35rem !important;
      margin-bottom: 16px;
    }
    .form-group { margin-bottom: 20px; }
    .full-width { width: 100%; }
    .row-group { display: flex; gap: 16px; align-items: flex-start; }
    .half-width { flex: 1; }
    .payment-option { display: flex; align-items: center; gap: 4px; }
    .icon-card { color: var(--color-primary, #005f87); margin-right: 8px; vertical-align: middle; }
    .icon-store { color: var(--color-secondary, #00897b); margin-right: 8px; vertical-align: middle; }
    .card-details-section {
      background: var(--color-surface-raised, #f0f6fa);
      border: 1px solid var(--color-border-light, #e8f1f7);
      border-radius: var(--radius-md, 12px);
      padding: 20px;
      margin-bottom: 12px;
    }
    .card-details-section h4 {
      margin-top: 0;
      color: var(--color-primary-dark, #003f5c);
      font-family: 'Fraunces', serif;
      font-size: 1.05rem;
      font-weight: 700;
    }
    .cart-item { display: flex; gap: 12px; margin-bottom: 14px; }
    .item-qty { font-weight: 700; color: var(--color-secondary, #00897b); min-width: 28px; }
    .item-details { flex: 1; }
    .item-name { font-weight: 700; color: var(--color-text-high, #0d2633); }
    .item-agregados { font-size: 0.8rem; color: var(--color-text-medium, #4a6572); }
    .item-price { font-weight: 700; color: var(--color-primary, #005f87); white-space: nowrap; }
    .empty-msg { color: var(--color-text-medium, #4a6572); text-align: center; margin-bottom: 20px; }
    .totals-section { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .total-row { display: flex; justify-content: space-between; color: var(--color-text-medium, #4a6572); font-size: 0.95rem; }
    .final-total {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--color-primary, #005f87);
      margin-top: 8px;
      padding-top: 10px;
      border-top: 1px solid var(--color-border, #d0e3ed);
    }
    .action-section { margin-top: 24px; display: flex; flex-direction: column; gap: 8px; }
    .pay-btn { width: 100%; padding: 8px; font-size: 1rem; font-weight: 600; }
    .error-msg { color: var(--color-error, #c62828); font-size: 0.9rem; text-align: center; margin: 0; }

    @media (max-width: 900px) {
      .checkout-grid { grid-template-columns: 1fr; }
      .row-group { flex-direction: column; gap: 0; }
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private ventasService = inject(VentasService);
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  isProcessing = signal(false);
  formError = signal<string | null>(null);

  // Computed signals para los montos (asumiendo que los precios ya incluyen IGV)
  subtotal = computed(() => this.cartService.cartTotal() / 1.18);
  igv = computed(() => this.cartService.cartTotal() - this.subtotal());

  checkoutForm = this.fb.group({
    esDelivery: [true],
    direccionEntrega: ['', [Validators.required]],
    metodoPago: ['Tarjeta', [Validators.required]],
    numeroTarjeta: [''],
    fechaVencimiento: [''],
    cvv: [''],
    nombreTitular: [''],
    celularYape: [''],
    codigoAprobacionYape: [''],
    tipoComprobante: ['Boleta', [Validators.required]],
    numeroComprobante: ['', [Validators.required]]
  });

  ngOnInit() {
    // Validar autenticación, si no está logueado, llevar al login
    if (!this.sessionService.isAuthenticated()) {
      alert("Debes iniciar sesión para procesar un pago.");
      this.router.navigate(['/login']);
      return;
    }

    // Cargar perfil del usuario para obtener su DNI y celular
    this.authService.ensureProfileLoaded().then(profile => {
      if (profile) {
        // Si el comprobante actual es Boleta, rellenar el DNI
        if (profile.dni && this.checkoutForm.get('tipoComprobante')?.value === 'Boleta') {
          this.checkoutForm.get('numeroComprobante')?.setValue(profile.dni);
        }
        // Si la forma de pago es Yape, rellenar el celular
        if (profile.celular && this.checkoutForm.get('metodoPago')?.value === 'Yape') {
          this.checkoutForm.get('celularYape')?.setValue(profile.celular);
        }
      }
    }).catch(err => {
      console.error('Error cargando perfil del usuario en checkout', err);
    });

    // Validación condicional del DNI/RUC
    this.checkoutForm.get('tipoComprobante')?.valueChanges.subscribe(val => {
      const numCtrl = this.checkoutForm.get('numeroComprobante');
      if (val === 'Boleta') {
        numCtrl?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
        const profile = this.authService.profile();
        if (profile?.dni) {
          numCtrl?.setValue(profile.dni);
        } else {
          numCtrl?.setValue('');
        }
      } else {
        numCtrl?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
        numCtrl?.setValue('');
      }
      numCtrl?.updateValueAndValidity();
    });

    // Validación condicional para dirección
    this.checkoutForm.get('esDelivery')?.valueChanges.subscribe(val => {
      const dirCtrl = this.checkoutForm.get('direccionEntrega');
      if (val) {
        dirCtrl?.setValidators([Validators.required]);
      } else {
        dirCtrl?.clearValidators();
      }
      dirCtrl?.updateValueAndValidity();
    });

    // Validación condicional para Método de Pago
    this.checkoutForm.get('metodoPago')?.valueChanges.subscribe(val => {
      const numTar = this.checkoutForm.get('numeroTarjeta');
      const fVenc = this.checkoutForm.get('fechaVencimiento');
      const cvv = this.checkoutForm.get('cvv');
      const titular = this.checkoutForm.get('nombreTitular');
      const celYape = this.checkoutForm.get('celularYape');
      const codYape = this.checkoutForm.get('codigoAprobacionYape');

      if (val === 'Tarjeta') {
        numTar?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
        fVenc?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
        titular?.setValidators([Validators.required]);
        
        celYape?.clearValidators();
        codYape?.clearValidators();
        celYape?.setValue('');
        codYape?.setValue('');
      } else if (val === 'Yape') {
        numTar?.clearValidators();
        fVenc?.clearValidators();
        cvv?.clearValidators();
        titular?.clearValidators();
        numTar?.setValue('');
        fVenc?.setValue('');
        cvv?.setValue('');
        titular?.setValue('');

        celYape?.setValidators([Validators.required, Validators.pattern(/^9\d{8}$/)]);
        codYape?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);

        const profile = this.authService.profile();
        if (profile?.celular) {
          celYape?.setValue(profile.celular);
        } else {
          celYape?.setValue('');
        }
        codYape?.setValue('');
      } else {
        numTar?.clearValidators();
        fVenc?.clearValidators();
        cvv?.clearValidators();
        titular?.clearValidators();
        numTar?.setValue('');
        fVenc?.setValue('');
        cvv?.setValue('');
        titular?.setValue('');

        celYape?.clearValidators();
        codYape?.clearValidators();
        celYape?.setValue('');
        codYape?.setValue('');
      }
      
      numTar?.updateValueAndValidity();
      fVenc?.updateValueAndValidity();
      cvv?.updateValueAndValidity();
      titular?.updateValueAndValidity();
      celYape?.updateValueAndValidity();
      codYape?.updateValueAndValidity();
    });

    // Inicializar validadores condicionales
    this.checkoutForm.get('tipoComprobante')?.setValue('Boleta');
    this.checkoutForm.get('metodoPago')?.setValue('Tarjeta');
  }

  async generarComprobantePDF(formVals: any, transactionId: string): Promise<File> {
    const doc = new jsPDF();
    
    // Diseño del recibo
    doc.setFontSize(22);
    doc.text('Restobar Las Olas', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Comprobante: ${transactionId}`, 20, 40);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 48);
    doc.text(`Documento Cliente: ${formVals.numeroComprobante}`, 20, 56);
    doc.text(`Método: ${formVals.metodoPago}`, 20, 64);
    
    doc.line(20, 70, 190, 70);
    
    let y = 80;
    doc.setFontSize(10);
    this.cartService.cartItems().forEach(item => {
      const txt = `${item.quantity}x ${item.plato.nombre}`;
      doc.text(txt, 20, y);
      doc.text(`S/ ${item.totalPrice.toFixed(2)}`, 170, y, { align: 'right' });
      y += 8;
      if (item.agregados.length) {
        doc.setFontSize(8);
        doc.text(`+ ${item.agregados.map(a => a.nombre).join(', ')}`, 25, y);
        doc.setFontSize(10);
        y += 8;
      }
    });
    
    y += 4;
    doc.line(20, y, 190, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.text('Subtotal:', 120, y);
    doc.text(`S/ ${this.subtotal().toFixed(2)}`, 170, y, { align: 'right' });
    y += 8;
    
    doc.text('IGV (18%):', 120, y);
    doc.text(`S/ ${this.igv().toFixed(2)}`, 170, y, { align: 'right' });
    y += 10;
    
    doc.setFontSize(14);
    doc.text('TOTAL PAGADO:', 120, y);
    doc.text(`S/ ${this.cartService.cartTotal().toFixed(2)}`, 170, y, { align: 'right' });
    
    const pdfBlob = doc.output('blob');
    return new File([pdfBlob], `${transactionId}.pdf`, { type: 'application/pdf' });
  }

  async procesarPago() {
    this.formError.set(null);

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.formError.set("Por favor, corrige los errores del formulario.");
      return;
    }

    if (this.cartService.cartItems().length === 0) {
      this.formError.set("El carrito está vacío.");
      return;
    }

    try {
      this.isProcessing.set(true);

      // Obtener el ID del usuario
      const userRes = await this.authService.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) {
        throw new Error("No se pudo identificar al usuario. Inicia sesión nuevamente.");
      }

      const formVals = this.checkoutForm.value;

      // Simular pago si es Yape
      if (formVals.metodoPago === 'Yape') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("¡Yapeo exitoso!");
      }

      // 1. Generar ID transaccional (B001-... o F001-...)
      const prefix = formVals.tipoComprobante === 'Factura' ? 'F001' : 'B001';
      const timestamp = Math.floor(Date.now() / 1000).toString().substring(4);
      const transactionId = `${prefix}-${timestamp}`;

      // 2. Generar el Comprobante en PDF
      const pdfFile = await this.generarComprobantePDF(formVals, transactionId);

      // 3. Subir el comprobante a Supabase (Bucket Vouchers)
      const voucherUrl = await this.storageService.uploadVoucher(pdfFile);

      // 4. Construir Detalles
      const detalles: VentaDetallePayload[] = this.cartService.cartItems().map(item => ({
        platoId: item.plato.id!,
        cantidad: item.quantity,
        agregadosIds: item.agregados.map(a => a.id!)
      }));

      // 5. Construir Payload Principal
      const payload: VentaPayload = {
        usuario: { id: userId },
        direccionEntrega: formVals.esDelivery ? formVals.direccionEntrega! : undefined,
        esDelivery: formVals.esDelivery!,
        metodoPago: formVals.metodoPago!,
        tipoComprobante: formVals.tipoComprobante!,
        numeroComprobante: formVals.numeroComprobante!,
        voucherUrl: voucherUrl,
        detalles: detalles
      };

      // 6. Enviar a Backend
      const response: any = await this.ventasService.crearVenta(payload).toPromise();
      const ventaId = response?.id || transactionId;

      // 7. Guardar en pedidos recientes
      try {
        const stored = localStorage.getItem('lasolas_recent_orders');
        const currentList = stored ? JSON.parse(stored) : [];
        currentList.unshift({
          id: ventaId,
          fecha: new Date().toISOString(),
          total: this.cartService.cartTotal(),
          tipoComprobante: formVals.tipoComprobante,
          numeroComprobante: formVals.numeroComprobante
        });
        localStorage.setItem('lasolas_recent_orders', JSON.stringify(currentList.slice(0, 10)));
      } catch (e) {
        console.error("Error guardando pedido localmente", e);
      }

      // 8. Exito
      this.cartService.clearCart();
      alert(`¡Tu pedido ha sido procesado con éxito!\nComprobante generado: ${transactionId}`);
      this.router.navigate(['/seguimiento', ventaId]);

    } catch (error: any) {
      console.error(error);
      this.formError.set(error?.message || "Ocurrió un error al procesar tu pago. Verifica los permisos de Supabase o la conexión.");
    } finally {
      this.isProcessing.set(false);
    }
  }
}
