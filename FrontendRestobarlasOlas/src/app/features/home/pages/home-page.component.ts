import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

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
  imports: [DecimalPipe, MatCardModule, MatDialogModule],
  template: `
    <div class="home-shell">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <p class="eyebrow">Restobar Las Olas</p>
          <h1 class="hero-title">Sabores del mar,<br><em>servidos frescos</em></h1>
          <p class="hero-sub">Cocina de barrio con alma marina. Selecciona tu plato y personalízalo a tu gusto.</p>
        </div>
      </section>

      <!-- Platos Grid -->
      <main class="content-grid">
        <div class="section-header">
          <h2 class="section-title">Nuestros platos</h2>
          <p class="section-sub">Haz clic en un plato para personalizarlo con agregados</p>
        </div>
        <div class="platos-grid">
          @for (plato of platos(); track plato.id) {
            <button class="plato-card" type="button" (click)="selectPlato(plato)">
              <div class="plato-image"
                   [style.backgroundImage]="plato.urlImagen ? 'url(' + plato.urlImagen + ')' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'">
                @if (!plato.urlImagen) {
                  <span class="no-img-label">Sin imagen</span>
                }
              </div>
              <div class="plato-body">
                <div class="plato-name">{{ plato.nombre }}</div>
                <div class="plato-desc">{{ plato.descripcion || 'Plato del día' }}</div>
                <div class="plato-price">S/ {{ plato.precio | number:'1.2-2' }}</div>
              </div>
            </button>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Inter', sans-serif; }

    .home-shell {
      min-height: 100vh;
      background-color: var(--color-bg, #f7f9fc);
    }

    /* Hero */
    .hero-section {
      background: linear-gradient(135deg, var(--color-primary-dark, #003f5c) 0%, var(--color-primary, #005f87) 55%, var(--color-secondary-dark, #005f56) 100%);
      padding: 72px 24px 80px;
      text-align: center;
      color: #ffffff;
    }
    .hero-content {
      max-width: 640px;
      margin: 0 auto;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--color-secondary-light, #4db6ac);
      margin: 0 0 16px;
    }
    .hero-title {
      font-family: 'Fraunces', serif;
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      margin: 0 0 20px;
      line-height: 1.15;
      color: #ffffff;
    }
    .hero-title em {
      font-style: italic;
      color: var(--color-secondary-light, #4db6ac);
    }
    .hero-sub {
      font-size: 1.05rem;
      color: rgba(232, 244, 249, 0.85);
      margin: 0;
      line-height: 1.6;
    }

    /* Grid */
    .content-grid {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px 48px;
    }
    .section-header {
      margin-bottom: 24px;
    }
    .section-title {
      font-family: 'Fraunces', serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--color-primary-dark, #003f5c);
      margin: 0 0 6px;
    }
    .section-sub {
      color: var(--color-text-medium, #4a6572);
      font-size: 0.95rem;
      margin: 0;
    }
    .platos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }

    /* Cards */
    .plato-card {
      border: 1px solid var(--color-border, #d0e3ed);
      background: var(--color-surface, #ffffff);
      border-radius: var(--radius-lg, 16px);
      overflow: hidden;
      text-align: left;
      padding: 0;
      cursor: pointer;
      box-shadow: var(--shadow-sm, 0 1px 4px rgba(0,63,92,0.08));
      transition: transform var(--transition-base, 220ms ease),
                  box-shadow var(--transition-base),
                  border-color var(--transition-base);
    }
    .plato-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg, 0 10px 32px rgba(0,63,92,0.12));
      border-color: var(--color-primary, #005f87);
    }
    .plato-image {
      height: 180px;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .no-img-label {
      color: rgba(255,255,255,0.8);
      font-weight: 600;
      font-size: 0.85rem;
      background: rgba(0,0,0,0.25);
      padding: 4px 10px;
      border-radius: 20px;
    }
    .plato-body { padding: 16px; }
    .plato-name {
      font-weight: 700;
      font-size: 1.05rem;
      margin-bottom: 4px;
      color: var(--color-text-high, #0d2633);
    }
    .plato-desc {
      font-size: 0.88rem;
      color: var(--color-text-medium, #4a6572);
      min-height: 38px;
      line-height: 1.5;
    }
    .plato-price {
      margin-top: 12px;
      font-weight: 700;
      color: var(--color-primary, #005f87);
      font-size: 1.15rem;
    }

    @media (max-width: 600px) {
      .hero-section { padding: 48px 16px 56px; }
      .content-grid { padding: 28px 16px 36px; }
      .platos-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    }

    @media (max-width: 400px) {
      .platos-grid { grid-template-columns: 1fr; }
      .hero-title { font-size: 1.75rem; }
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
