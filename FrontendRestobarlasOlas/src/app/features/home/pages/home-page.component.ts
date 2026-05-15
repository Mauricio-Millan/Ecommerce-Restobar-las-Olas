import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { AppNavbarComponent } from '../../../shared/components/app-navbar.component';
import { Agregado } from '../../../core/catalog/agregado.model';
import { Plato } from '../../../core/catalog/plato.model';
import { PlatosService } from '../../../core/catalog/platos.service';
import { PlatoAgregadosService } from '../../../core/catalog/plato-agregados.service';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, MatCardModule, MatChipsModule, MatCheckboxModule, MatDividerModule],
  template: `
    <div class="home-shell">
      <app-navbar></app-navbar>

      <section class="banner-placeholder" aria-label="Banner principal pendiente"></section>

      <main class="content-grid">
        <section class="section-block">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>Selecciona tu plato</mat-card-title>
              <mat-card-subtitle>Platos activos disponibles para personalizar</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="platos-grid">
                <button class="plato-card" *ngFor="let plato of platos()" type="button" (click)="selectPlato(plato)" [class.active]="selectedPlato()?.id === plato.id">
                  <div class="plato-image" [style.backgroundImage]="plato.urlImagen ? 'url(' + plato.urlImagen + ')' : 'none'">
                    <span *ngIf="!plato.urlImagen">Sin imagen</span>
                  </div>
                  <div class="plato-body">
                    <div class="plato-name">{{ plato.nombre }}</div>
                    <div class="plato-desc">{{ plato.descripcion || 'Plato del día' }}</div>
                    <div class="plato-price">S/ {{ plato.precio | number:'1.2-2' }}</div>
                  </div>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <section class="section-block" *ngIf="selectedPlato() as plato">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>Personaliza tu plato</mat-card-title>
              <mat-card-subtitle>{{ plato.nombre }} - S/ {{ plato.precio | number:'1.2-2' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="section-copy">Elige los agregados permitidos para este plato y calcula el precio final en tiempo real.</p>
              <div class="addons-list" *ngIf="availableAgregados().length; else loadingAgregados">
                <mat-checkbox *ngFor="let agregado of availableAgregados()" [checked]="selectedAgregadoIds().includes(agregado.id ?? 0)" (change)="toggleAgregado(agregado)">
                  {{ agregado.nombre }} <span class="addon-price">(+ S/ {{ agregado.precio | number:'1.2-2' }})</span>
                </mat-checkbox>
              </div>

              <ng-template #loadingAgregados>
                <p class="muted">No hay agregados cargados para este plato o aún se están obteniendo.</p>
              </ng-template>

              <mat-divider></mat-divider>

              <div class="summary-box">
                <div><strong>Subtotal:</strong> S/ {{ basePrice() | number:'1.2-2' }}</div>
                <div><strong>Agregados:</strong> S/ {{ addonsTotal() | number:'1.2-2' }}</div>
                <div><strong>Total:</strong> S/ {{ finalPrice() | number:'1.2-2' }}</div>
              </div>

              <div class="selected-chips" *ngIf="selectedAgregados().length">
                <mat-chip-set>
                  <mat-chip *ngFor="let agregado of selectedAgregados()">{{ agregado.nombre }}</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .home-shell { min-height: 100vh; background: linear-gradient(180deg, #f4f7f9 0%, #f6f4ef 100%); }
    .banner-placeholder { min-height: 220px; background: rgba(255,255,255,.62); border:1px dashed rgba(31,111,139,.35); margin:20px; border-radius:16px; box-shadow:0 10px 30px rgba(35,50,56,.06); }
    .content-grid { display:grid; grid-template-columns: 1.2fr .8fr; gap:20px; padding:0 20px 24px; }
    .section-card { height:100%; }
    .platos-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap:14px; margin-top:16px; }
    .plato-card { border:1px solid rgba(31,111,139,.14); background:#fff; border-radius:14px; overflow:hidden; text-align:left; padding:0; cursor:pointer; box-shadow:0 6px 16px rgba(35,50,56,.06); transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
    .plato-card:hover { transform: translateY(-2px); box-shadow:0 10px 20px rgba(35,50,56,.08); }
    .plato-card.active { border-color:#1f6f8b; box-shadow:0 0 0 2px rgba(31,111,139,.12); }
    .plato-image { height:120px; background: linear-gradient(135deg, #1f6f8b, #8b5e3c); background-size: cover; background-position: center; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; }
    .plato-body { padding:12px; }
    .plato-name { font-weight:800; margin-bottom:4px; }
    .plato-desc { font-size:.9rem; color:#566; min-height: 40px; }
    .plato-price { margin-top:8px; font-weight:800; color:#1f6f8b; }
    .section-copy { margin-top: 12px; color:#566; }
    .addons-list { display:flex; flex-direction:column; gap:10px; margin:14px 0; }
    .summary-box { margin-top:16px; padding:14px; border-radius:12px; background:#fff7ef; border:1px solid rgba(139,94,60,.2); display:grid; gap:8px; }
    .selected-chips { margin-top: 14px; }
    .muted { color:#667; }
    .addon-price { color:#1f6f8b; font-weight:700; }

    @media (max-width: 980px) {
      .content-grid { grid-template-columns: 1fr; }
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements OnInit {
  private platosService = inject(PlatosService);
  private platoAgregadosService = inject(PlatoAgregadosService);

  platos = signal<Plato[]>([]);
  selectedPlato = signal<Plato | null>(null);
  availableAgregados = signal<Agregado[]>([]);
  selectedAgregadoIds = signal<number[]>([]);
  selectedAgregados = computed(() => this.availableAgregados().filter((agregado) => this.selectedAgregadoIds().includes(agregado.id ?? 0)));
  basePrice = computed(() => this.selectedPlato()?.precio ?? 0);
  addonsTotal = computed(() => this.selectedAgregados().reduce((sum, agregado) => sum + (agregado.precio ?? 0), 0));
  finalPrice = computed(() => this.basePrice() + this.addonsTotal());

  async ngOnInit() {
    await this.loadPlatos();
  }

  async loadPlatos() {
    try {
      const platos = await this.platosService.getActivos().toPromise();
      this.platos.set(platos ?? []);
      if (platos?.length) {
        await this.selectPlato(platos[0]);
      }
    } catch {
      this.platos.set([]);
    }
  }

  async selectPlato(plato: Plato) {
    this.selectedPlato.set(plato);
    this.selectedAgregadoIds.set([]);
    try {
      const agregados = await this.platoAgregadosService.getAgregadosDisponibles(plato.id ?? 0).toPromise();
      this.availableAgregados.set(agregados ?? []);
    } catch {
      this.availableAgregados.set([]);
    }
  }

  toggleAgregado(agregado: Agregado) {
    const id = agregado.id ?? 0;
    const current = this.selectedAgregadoIds();
    this.selectedAgregadoIds.set(current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

}
