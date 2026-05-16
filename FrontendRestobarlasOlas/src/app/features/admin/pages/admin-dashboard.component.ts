import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="admin-dashboard">
      <header class="admin-hero">
        <div class="hero-copy">
          <p class="eyebrow">Panel administrativo</p>
          <h1>Gestiona la carta y operaciones</h1>
          <p class="hero-sub">Selecciona una opción del menú lateral para administrar los Platos, Agregados o Usuarios.</p>
        </div>
        <div class="hero-cards">
          <mat-card class="hero-card">
            <mat-card-header>
              <mat-card-title>Checklist rápido</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ul>
                <li>Verifica categorías activas</li>
                <li>Revisa precios y disponibilidad</li>
                <li>Confirma nuevos agregados</li>
              </ul>
            </mat-card-content>
          </mat-card>
          <mat-card class="hero-card accent">
            <mat-card-header>
              <mat-card-title>Tips del día</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Mantén las imágenes actualizadas para atraer más clientes.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </header>
    </div>
  `,
  styles: [`
    :host { font-family: 'Source Sans 3', sans-serif; color: #1d2b2a; display: block; }
    .admin-dashboard { width: min(1200px, 100%); margin: 0 auto; }
    .admin-hero { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: stretch; margin-bottom: 24px; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.7rem; color: rgba(29, 43, 42, 0.6); margin: 0 0 6px; }
    h1 { font-family: 'Fraunces', serif; font-size: clamp(1.8rem, 2.6vw, 2.5rem); margin: 0 0 8px; color: #0f172a; }
    .hero-sub { margin: 0; font-size: 1.05rem; color: #475569; }
    .hero-cards { display: grid; gap: 16px; }
    .hero-card { border-radius: 16px; border: 1px solid rgba(31, 111, 139, 0.12); box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05); }
    .hero-card.accent { background: linear-gradient(140deg, rgba(31, 111, 139, 0.08), rgba(244, 178, 134, 0.12)); }
    .hero-card ul { margin: 8px 0 0; padding-left: 20px; color: #334155; }
    
    mat-card-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
    mat-card-content { padding-top: 8px; }

    @media (max-width: 980px) {
      .admin-hero { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent { }
