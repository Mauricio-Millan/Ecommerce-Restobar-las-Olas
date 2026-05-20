import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';

import { Agregado } from '../../../core/catalog/agregado.model';
import { Plato } from '../../../core/catalog/plato.model';
import { PlatosService } from '../../../core/catalog/platos.service';
import { PlatoAgregadosService } from '../../../core/catalog/plato-agregados.service';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PlatoDetailModalComponent } from '../components/plato-detail-modal.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDialogModule],
  template: `
    <div class="home-shell">
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
                <button class="plato-card" *ngFor="let plato of platos()" type="button" (click)="selectPlato(plato)">
                  <div class="plato-image" [style.backgroundImage]="plato.urlImagen ? 'url(' + plato.urlImagen + ')' : 'linear-gradient(135deg, #1f6f8b, #8b5e3c)'">
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
      </main>
    </div>
  `,
  styles: [`
    .home-shell { min-height: 100vh; background: linear-gradient(180deg, #f4f7f9 0%, #f6f4ef 100%); }
    .banner-placeholder { min-height: 220px; background: rgba(255,255,255,.62); border:1px dashed rgba(31,111,139,.35); margin:20px; border-radius:16px; box-shadow:0 10px 30px rgba(35,50,56,.06); }
    .content-grid { display:grid; grid-template-columns: 1fr; gap:20px; padding:0 20px 24px; max-width: 1200px; margin: 0 auto; }
    .section-card { height:100%; }
    .platos-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:16px; margin-top:16px; }
    .plato-card { border:1px solid rgba(31,111,139,.14); background:#fff; border-radius:14px; overflow:hidden; text-align:left; padding:0; cursor:pointer; box-shadow:0 6px 16px rgba(35,50,56,.06); transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
    .plato-card:hover { transform: translateY(-4px); box-shadow:0 12px 24px rgba(35,50,56,.12); border-color:#1f6f8b; }
    .plato-image { height:160px; background-size: cover; background-position: center; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; }
    .plato-body { padding:16px; }
    .plato-name { font-weight:800; font-size:1.1rem; margin-bottom:4px; color:#1f6f8b; }
    .plato-desc { font-size:.9rem; color:#566; min-height: 40px; }
    .plato-price { margin-top:12px; font-weight:800; color:#1f6f8b; font-size:1.2rem; }

    @media (max-width: 980px) {
      .content-grid { grid-template-columns: 1fr; }
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements OnInit {
  private platosService = inject(PlatosService);
  private platoAgregadosService = inject(PlatoAgregadosService);
  private dialog = inject(MatDialog);

  platos = signal<Plato[]>([]);

  async ngOnInit() {
    await this.loadPlatos();
  }

  async loadPlatos() {
    try {
      const platos = await this.platosService.getActivos().toPromise();
      this.platos.set(platos ?? []);
    } catch {
      this.platos.set([]);
    }
  }

  async selectPlato(plato: Plato) {
    let agregados: Agregado[] = [];
    try {
      agregados = await this.platoAgregadosService.getAgregadosDisponibles(plato.id ?? 0).toPromise() || [];
    } catch {
      agregados = [];
    }

    this.dialog.open(PlatoDetailModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'plato-dialog-container',
      data: { plato, agregados }
    });
  }
}
