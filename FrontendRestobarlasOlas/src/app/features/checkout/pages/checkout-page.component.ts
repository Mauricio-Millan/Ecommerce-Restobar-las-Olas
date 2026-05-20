import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, 
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

                <mat-form-field appearance="outline" class="full-width" *ngIf="checkoutForm.get('esDelivery')?.value">
                  <mat-label>Dirección de Entrega</mat-label>
                  <input matInput formControlName="direccionEntrega" placeholder="Ej. Av. Las Olas 123" />
                  <mat-error *ngIf="checkoutForm.get('direccionEntrega')?.hasError('required')">
                    La dirección es obligatoria para el delivery
                  </mat-error>
                </mat-form-field>

                <div class="row-group">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Método de Pago</mat-label>
                    <mat-select formControlName="metodoPago">
                      <mat-option value="Tarjeta">Tarjeta de Crédito/Débito</mat-option>
                      <mat-option value="Yape">Yape</mat-option>
                      <mat-option value="Plin">Plin</mat-option>
                      <mat-option value="Pago al recoger">Pago en tienda al recoger</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <!-- Pasarela de Pago Simulada -->
                <div class="card-details-section" *ngIf="checkoutForm.get('metodoPago')?.value === 'Tarjeta'">
                  <h4>Información de la Tarjeta</h4>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nombre en la tarjeta</mat-label>
                    <input matInput formControlName="nombreTitular" placeholder="Ej. Juan Pérez" />
                    <mat-error *ngIf="checkoutForm.get('nombreTitular')?.hasError('required')">Requerido</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Número de Tarjeta</mat-label>
                    <input matInput formControlName="numeroTarjeta" placeholder="0000 0000 0000 0000" maxlength="16" />
                    <mat-error *ngIf="checkoutForm.get('numeroTarjeta')?.hasError('required')">Requerido</mat-error>
                    <mat-error *ngIf="checkoutForm.get('numeroTarjeta')?.hasError('pattern')">Debe tener 16 dígitos</mat-error>
                  </mat-form-field>

                  <div class="row-group">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Vencimiento (MM/YY)</mat-label>
                      <input matInput formControlName="fechaVencimiento" placeholder="12/25" maxlength="5" />
                      <mat-error *ngIf="checkoutForm.get('fechaVencimiento')?.hasError('required')">Requerido</mat-error>
                      <mat-error *ngIf="checkoutForm.get('fechaVencimiento')?.hasError('pattern')">Formato inválido</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>CVV</mat-label>
                      <input matInput type="password" formControlName="cvv" placeholder="123" maxlength="4" />
                      <mat-error *ngIf="checkoutForm.get('cvv')?.hasError('required')">Requerido</mat-error>
                      <mat-error *ngIf="checkoutForm.get('cvv')?.hasError('pattern')">3 o 4 dígitos</mat-error>
                    </mat-form-field>
                  </div>
                </div>

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
                    <mat-label>Número de Documento (DNI/RUC)</mat-label>
                    <input matInput formControlName="numeroComprobante" />
                    <mat-error *ngIf="checkoutForm.get('numeroComprobante')?.hasError('required')">
                      Requerido
                    </mat-error>
                    <mat-error *ngIf="checkoutForm.get('numeroComprobante')?.hasError('pattern')">
                      {{ checkoutForm.get('tipoComprobante')?.value === 'Boleta' ? 'Debe tener 8 dígitos' : 'Debe tener 11 dígitos' }}
                    </mat-error>
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
              <div class="cart-items" *ngIf="cartService.cartItems().length; else emptyCart">
                <div class="cart-item" *ngFor="let item of cartService.cartItems()">
                  <div class="item-qty">{{ item.quantity }}x</div>
                  <div class="item-details">
                    <div class="item-name">{{ item.plato.nombre }}</div>
                    <div class="item-agregados" *ngIf="item.agregados.length">
                      <span *ngFor="let a of item.agregados; let last=last">{{ a.nombre }}{{ !last ? ', ' : '' }}</span>
                    </div>
                  </div>
                  <div class="item-price">S/ {{ item.totalPrice | number:'1.2-2' }}</div>
                </div>
              </div>

              <ng-template #emptyCart>
                <p class="empty-msg">No tienes productos en el carrito.</p>
              </ng-template>

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
                <p class="error-msg" *ngIf="formError()">{{ formError() }}</p>
              </div>

            </mat-card-content>
          </mat-card>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      min-height: calc(100vh - 88px);
      background: linear-gradient(180deg, #f4f7f9 0%, #f6f4ef 100%);
      padding: 40px 20px;
      font-family: 'Source Sans 3', sans-serif;
    }
    .checkout-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    mat-card-title {
      font-family: 'Fraunces', serif;
      color: #1f6f8b;
      font-size: 1.4rem;
      margin-bottom: 16px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .full-width {
      width: 100%;
    }
    .row-group {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .half-width {
      flex: 1;
    }
    
    .card-details-section {
      background: #fdfbf8;
      border: 1px solid rgba(31,111,139,.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 12px;
    }
    .card-details-section h4 {
      margin-top: 0;
      color: #1f6f8b;
      font-family: 'Fraunces', serif;
      font-size: 1.1rem;
    }
    
    .cart-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .item-qty {
      font-weight: 700;
      color: #8b5e3c;
    }
    .item-details {
      flex: 1;
    }
    .item-name {
      font-weight: 700;
      color: #333;
    }
    .item-agregados {
      font-size: 0.8rem;
      color: #666;
    }
    .item-price {
      font-weight: 700;
      color: #1f6f8b;
    }
    .empty-msg {
      color: #666;
      text-align: center;
      margin-bottom: 20px;
    }
    .totals-section {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      color: #666;
    }
    .final-total {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1f6f8b;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed rgba(31,111,139,.2);
    }
    .action-section {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .pay-btn {
      width: 100%;
      padding: 8px;
      font-size: 1.1rem;
      border-radius: 24px;
    }
    .error-msg {
      color: #f44336;
      font-size: 0.9rem;
      text-align: center;
      margin: 0;
    }

    @media (max-width: 900px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
      .row-group {
        flex-direction: column;
        gap: 0;
      }
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
    tipoComprobante: ['Boleta', [Validators.required]],
    numeroComprobante: ['', [Validators.required]]
  });

  ngOnInit() {
    // Validar autenticación, si no está logueado, llevar al login
    if (!this.sessionService.isAuthenticated()) {
      alert("Debes iniciar sesión para procesar un pago.");
      this.router.navigate(['/login']);
    }

    // Validación condicional del DNI/RUC
    this.checkoutForm.get('tipoComprobante')?.valueChanges.subscribe(val => {
      const numCtrl = this.checkoutForm.get('numeroComprobante');
      if (val === 'Boleta') {
        numCtrl?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
      } else {
        numCtrl?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
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

    // Validación condicional para Tarjeta
    this.checkoutForm.get('metodoPago')?.valueChanges.subscribe(val => {
      const numTar = this.checkoutForm.get('numeroTarjeta');
      const fVenc = this.checkoutForm.get('fechaVencimiento');
      const cvv = this.checkoutForm.get('cvv');
      const titular = this.checkoutForm.get('nombreTitular');

      if (val === 'Tarjeta') {
        numTar?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
        fVenc?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
        titular?.setValidators([Validators.required]);
      } else {
        numTar?.clearValidators();
        fVenc?.clearValidators();
        cvv?.clearValidators();
        titular?.clearValidators();
      }
      numTar?.updateValueAndValidity();
      fVenc?.updateValueAndValidity();
      cvv?.updateValueAndValidity();
      titular?.updateValueAndValidity();
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
      await this.ventasService.crearVenta(payload).toPromise();

      // 7. Exito
      this.cartService.clearCart();
      alert(`¡Tu pedido ha sido procesado con éxito!\\nComprobante generado: ${transactionId}`);
      this.router.navigate(['/']);

    } catch (error: any) {
      console.error(error);
      this.formError.set(error?.message || "Ocurrió un error al procesar tu pago. Verifica los permisos de Supabase o la conexión.");
    } finally {
      this.isProcessing.set(false);
    }
  }
}
