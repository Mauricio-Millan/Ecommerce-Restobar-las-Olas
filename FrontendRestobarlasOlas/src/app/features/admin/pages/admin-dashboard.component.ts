import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { PlatosAdminComponent } from './platos-admin.component';
import { AgregadosAdminComponent } from './agregados-admin.component';
import { UsuariosAdminComponent } from './usuarios-admin.component';
import { AppNavbarComponent } from '../../../shared/components/app-navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule, AppNavbarComponent, PlatosAdminComponent, AgregadosAdminComponent, UsuariosAdminComponent],
  template: `
    <div class="page admin-page">
      <app-navbar [showAdminLink]="false"></app-navbar>
      <div class="admin-shell">
        <header class="admin-hero">
          <div class="hero-copy">
            <p class="eyebrow">Panel administrativo</p>
            <h1>Gestiona la carta y las operaciones diarias</h1>
            <p class="hero-sub">Actualiza platos, ajusta agregados y revisa usuarios con una vista clara y ordenada.</p>
          </div>
          <div class="hero-cards">
            <mat-card class="hero-card">
              <mat-card-title>Checklist rapido</mat-card-title>
              <mat-card-content>
                <ul>
                  <li>Verifica categorias activas</li>
                  <li>Revisa precios y disponibilidad</li>
                  <li>Confirma nuevos agregados</li>
                </ul>
              </mat-card-content>
            </mat-card>
            <mat-card class="hero-card accent">
              <mat-card-title>Tips del dia</mat-card-title>
              <mat-card-content>
                <p>Usa el recargado rapido si notas cambios recientes en el backend.</p>
              </mat-card-content>
            </mat-card>
          </div>
        </header>

        <mat-card class="admin-surface">
          <mat-tab-group class="admin-tabs">
            <mat-tab label="Platos"><platos-admin></platos-admin></mat-tab>
            <mat-tab label="Agregados"><agregados-admin></agregados-admin></mat-tab>
            <mat-tab label="Usuarios"><usuarios-admin></usuarios-admin></mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Source Sans 3', sans-serif; color: #1d2b2a; }
    .admin-page { min-height: 100vh; background: radial-gradient(circle at top, rgba(31, 111, 139, 0.08), transparent 55%), linear-gradient(180deg, #f4f7f9 0%, #f6f4ef 100%); }
    .admin-shell { width: min(1200px, 100%); margin: 0 auto; padding: 18px 20px 32px; }
    .admin-hero { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: stretch; margin-bottom: 20px; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.7rem; color: rgba(29, 43, 42, 0.6); margin: 0 0 6px; }
    h1 { font-family: 'Fraunces', serif; font-size: clamp(1.8rem, 2.6vw, 2.5rem); margin: 0 0 8px; }
    .hero-sub { margin: 0; font-size: 1rem; color: rgba(29, 43, 42, 0.75); }
    .hero-cards { display: grid; gap: 16px; }
    .hero-card { border-radius: 18px; border: 1px solid rgba(31, 111, 139, 0.12); box-shadow: 0 18px 40px rgba(18, 35, 32, 0.08); }
    .hero-card.accent { background: linear-gradient(140deg, rgba(31, 111, 139, 0.12), rgba(244, 178, 134, 0.16)); }
    .hero-card ul { margin: 8px 0 0; padding-left: 16px; color: rgba(29, 43, 42, 0.8); }
    .admin-surface { padding: 18px; border-radius: 18px; border: 1px solid rgba(31, 111, 139, 0.12); box-shadow: 0 18px 40px rgba(18, 35, 32, 0.08); }

    @media (max-width: 980px) {
      .admin-hero { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent {}
