import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AppNavbarComponent } from '../../shared/components/app-navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppNavbarComponent, MatIconModule, MatButtonModule, MatRippleModule],
  template: `
    <!-- Overlay móvil -->
    @if (sidebarOpen()) {
      <div class="sidebar-overlay" (click)="closeSidebar()" aria-hidden="true"></div>
    }

    <div class="admin-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <mat-icon class="brand-icon">restaurant_menu</mat-icon>
          <span class="brand-text">Admin Panel</span>
          <button mat-icon-button class="close-sidebar-btn" (click)="closeSidebar()" aria-label="Cerrar menú">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
             class="nav-item" (click)="closeSidebar()" matRipple>
            <mat-icon>dashboard</mat-icon>
            <span>Resumen</span>
          </a>
          <div class="nav-section">Catálogo</div>
          <a routerLink="/admin/platos" routerLinkActive="active"
             class="nav-item" (click)="closeSidebar()" matRipple>
            <mat-icon>restaurant</mat-icon>
            <span>Platos</span>
          </a>
          <a routerLink="/admin/agregados" routerLinkActive="active"
             class="nav-item" (click)="closeSidebar()" matRipple>
            <mat-icon>add_circle_outline</mat-icon>
            <span>Agregados</span>
          </a>
          <div class="nav-section">Reportes</div>
          <a routerLink="/admin/ventas" routerLinkActive="active"
             class="nav-item" (click)="closeSidebar()" matRipple>
            <mat-icon>bar_chart</mat-icon>
            <span>Ventas</span>
          </a>
          <div class="nav-section">Sistema</div>
          <a routerLink="/admin/usuarios" routerLinkActive="active"
             class="nav-item" (click)="closeSidebar()" matRipple>
            <mat-icon>manage_accounts</mat-icon>
            <span>Usuarios</span>
          </a>
        </nav>
      </aside>

      <!-- Contenido principal -->
      <div class="main-content">
        <div class="topbar-row">
          <!-- Botón hamburger solo en móvil -->
          <button mat-icon-button class="sidebar-toggle-btn" (click)="toggleSidebar()" aria-label="Abrir menú">
            <mat-icon>menu</mat-icon>
          </button>
          <app-navbar title="Restobar Las Olas" subtitle="Panel de Control"></app-navbar>
        </div>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', sans-serif;
    }

    /* ── Overlay ────────────────────────────────────────────────── */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 40;
      animation: fadeIn 180ms ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ── Layout ─────────────────────────────────────────────────── */
    .admin-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: var(--color-bg, #f7f9fc);
    }

    /* ── Sidebar ────────────────────────────────────────────────── */
    .sidebar {
      width: 260px;
      background-color: var(--sidebar-bg, #071b2b);
      color: var(--sidebar-text, #a8c4d5);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      box-shadow: 4px 0 20px rgba(0, 20, 40, 0.25);
      z-index: 50;
      transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-header {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: var(--sidebar-bg-header, #040f1a);
      color: #e8f4f9;
      border-bottom: 1px solid var(--sidebar-border, rgba(168,196,213,0.08));
    }
    .brand-icon { color: var(--sidebar-icon-accent, #4db6ac); }
    .brand-text {
      font-family: 'Fraunces', serif;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #e8f4f9;
      flex: 1;
    }
    .close-sidebar-btn {
      display: none;
      color: var(--sidebar-text, #a8c4d5) !important;
      margin-left: auto;
    }

    .sidebar-nav {
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-section {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--sidebar-text-muted, #4a7086);
      margin: 16px 0 6px 8px;
      font-weight: 600;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      color: var(--sidebar-text, #a8c4d5);
      text-decoration: none;
      border-radius: var(--radius-md, 12px);
      font-weight: 500;
      font-size: 0.9rem;
      transition: background var(--transition-base, 220ms ease), color var(--transition-base);
    }
    .nav-item mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .nav-item:hover {
      background-color: var(--sidebar-hover, rgba(168,196,213,0.07));
      color: #e8f4f9;
    }
    .nav-item.active {
      background-color: var(--sidebar-active, #005f87);
      color: var(--sidebar-active-text, #ffffff);
    }
    .nav-item.active mat-icon { color: #ffffff; }

    /* ── Main content ───────────────────────────────────────────── */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar-row {
      display: contents;
    }

    .sidebar-toggle-btn {
      display: none;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 39;
      background: var(--color-primary, #005f87) !important;
      color: #fff !important;
      box-shadow: var(--shadow-lg);
      width: 52px !important;
      height: 52px !important;
    }

    .content-area {
      flex: 1;
      padding: var(--space-6, 24px);
      overflow-y: auto;
    }

    /* ── Responsive ─────────────────────────────────────────────── */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100dvh;
        transform: translateX(-100%);
        overflow-y: auto;
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .close-sidebar-btn { display: flex; }
      .sidebar-toggle-btn { display: flex; }
      .content-area { padding: 16px; }
    }

    @media (max-width: 480px) {
      .content-area { padding: 12px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar() { this.sidebarOpen.set(false); }
}
