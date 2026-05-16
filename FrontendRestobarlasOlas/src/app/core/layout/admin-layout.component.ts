import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AppNavbarComponent } from '../../shared/components/app-navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AppNavbarComponent, MatIconModule],
  template: `
    <div class="admin-wrapper">
      <aside class="sidebar">
        <div class="sidebar-header">
          <mat-icon class="brand-icon">restaurant_menu</mat-icon>
          <span class="brand-text">Admin Panel</span>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <mat-icon>dashboard</mat-icon>
            <span>Resumen</span>
          </a>
          <div class="nav-section">Catálogo</div>
          <a routerLink="/admin/platos" routerLinkActive="active" class="nav-item">
            <mat-icon>restaurant</mat-icon>
            <span>Platos</span>
          </a>
          <a routerLink="/admin/agregados" routerLinkActive="active" class="nav-item">
            <mat-icon>add_circle_outline</mat-icon>
            <span>Agregados</span>
          </a>
          <div class="nav-section">Sistema</div>
          <a routerLink="/admin/usuarios" routerLinkActive="active" class="nav-item">
            <mat-icon>people</mat-icon>
            <span>Usuarios</span>
          </a>
        </nav>
      </aside>

      <div class="main-content">
        <app-navbar [showAdminLink]="false" title="Restobar Las Olas" subtitle="Panel de Control"></app-navbar>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Source Sans 3', sans-serif;
    }
    .admin-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: #f4f7f9;
    }
    .sidebar {
      width: 260px;
      background-color: #0f172a; /* Slate 900 - Formal Blue */
      color: #94a3b8; /* Slate 400 */
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      box-shadow: 4px 0 15px rgba(0,0,0,0.1);
      z-index: 30;
    }
    .sidebar-header {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: #0b1120; /* Slate 950 */
      color: #f8fafc;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .brand-icon {
      color: #38bdf8; /* Light blue accent */
    }
    .brand-text {
      font-family: 'Fraunces', serif;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .sidebar-nav {
      padding: 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-section {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      margin: 16px 0 8px 8px;
      font-weight: 600;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #cbd5e1;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      opacity: 0.8;
    }
    .nav-item:hover {
      background-color: rgba(255,255,255,0.05);
      color: #f8fafc;
    }
    .nav-item.active {
      background-color: #1f6f8b; /* Primary Brand Blue */
      color: #ffffff;
    }
    .nav-item.active mat-icon {
      opacity: 1;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0; /* Important for flex children to not overflow */
    }
    .content-area {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    @media (max-width: 900px) {
      .admin-wrapper {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding: 12px;
      }
      .nav-section {
        display: none;
      }
      .nav-item {
        padding: 8px 12px;
        white-space: nowrap;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {}
