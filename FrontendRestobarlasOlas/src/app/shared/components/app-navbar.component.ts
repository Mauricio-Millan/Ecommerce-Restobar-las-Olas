import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/auth/session.service';
import { CartService } from '../../core/cart/cart.service';
import { CartModalComponent } from './cart-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatDialogModule, MatRippleModule],
  template: `
    <!-- Overlay para cerrar el menú móvil -->
    @if (mobileMenuOpen()) {
      <div class="nav-overlay" (click)="closeMobileMenu()" aria-hidden="true"></div>
    }

    <mat-toolbar class="topbar">
      <!-- Brand -->
      <a routerLink="/" class="brand-area" (click)="closeMobileMenu()">
        <span class="brand-title">{{ title }}</span>
        <span class="brand-subtitle">{{ subtitle }}</span>
      </a>

      <span class="spacer"></span>

      <!-- Acciones siempre visibles (desktop + móvil) -->
      <div class="topbar-right">
        <!-- Nav desktop -->
        <nav class="nav-desktop">
          <a mat-button routerLink="/">Inicio</a>
          <a mat-button routerLink="/seguimiento">Seguimiento</a>
          @if (isKitchen()) {
            <button mat-button type="button" (click)="goToKitchen()">Cocina</button>
          }
          @if (isAdmin()) {
            <button mat-button type="button" (click)="goToAdmin()">Admin</button>
          }
        </nav>

        <!-- Chip de usuario (desktop) -->
        @if (isAuthenticated()) {
          <div class="user-chip">
            <div class="user-avatar-icon">
              <mat-icon>person</mat-icon>
            </div>
            <div class="user-chip-info">
              <span class="user-chip-name">{{ customerName() }}</span>
              <span class="user-chip-role">{{ customerStatus() }}</span>
            </div>
            <button mat-icon-button class="user-chip-logout" (click)="logout()" title="Cerrar sesión">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        } @else {
          <a mat-flat-button routerLink="/login" class="login-btn">
            <mat-icon>login</mat-icon>
            Iniciar sesión
          </a>
        }

        <!-- Carrito (siempre visible) -->
        <button mat-icon-button (click)="openCart()" class="cart-btn" aria-label="Ver carrito">
          <mat-icon [matBadge]="cartService.cartItemCount()"
                    [matBadgeHidden]="cartService.cartItemCount() === 0"
                    matBadgeColor="warn">shopping_cart</mat-icon>
        </button>

        <!-- Hamburger (solo móvil) -->
        <button mat-icon-button class="hamburger-btn" (click)="toggleMobileMenu()"
                [attr.aria-expanded]="mobileMenuOpen()" aria-label="Abrir menú">
          <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>
    </mat-toolbar>

    <!-- Drawer móvil -->
    <div class="mobile-drawer" [class.open]="mobileMenuOpen()" role="dialog" aria-label="Menú de navegación">
      <!-- Cabecera del drawer -->
      <div class="drawer-header">
        <div class="drawer-user">
          <div class="drawer-user-name" [class.guest]="!isAuthenticated()">{{ customerName() }}</div>
          <div class="drawer-user-status">{{ customerStatus() }}</div>
        </div>
      </div>

      <!-- Links del drawer -->
      <nav class="drawer-nav">
        <a class="drawer-item" routerLink="/" (click)="closeMobileMenu()" matRipple>
          <mat-icon>home</mat-icon><span>Inicio</span>
        </a>
        <a class="drawer-item" routerLink="/seguimiento" (click)="closeMobileMenu()" matRipple>
          <mat-icon>track_changes</mat-icon><span>Seguimiento</span>
        </a>

        @if (!isAuthenticated()) {
          <div class="drawer-divider"></div>
          <a class="drawer-item" routerLink="/login" (click)="closeMobileMenu()" matRipple>
            <mat-icon>login</mat-icon><span>Iniciar sesión</span>
          </a>
          <a class="drawer-item" routerLink="/register" (click)="closeMobileMenu()" matRipple>
            <mat-icon>person_add</mat-icon><span>Crear cuenta</span>
          </a>
        }

        @if (isKitchen()) {
          <div class="drawer-divider"></div>
          <button class="drawer-item" type="button" (click)="goToKitchen(); closeMobileMenu();" matRipple>
            <mat-icon>kitchen</mat-icon><span>Tablero de Cocina</span>
          </button>
        }

        @if (isAdmin()) {
          <button class="drawer-item" type="button" (click)="goToAdmin(); closeMobileMenu();" matRipple>
            <mat-icon>admin_panel_settings</mat-icon><span>Panel Admin</span>
          </button>
        }

        @if (isAuthenticated()) {
          <div class="drawer-divider"></div>
          <button class="drawer-item danger" type="button" (click)="logout()" matRipple>
            <mat-icon>logout</mat-icon><span>Cerrar sesión</span>
          </button>
        }
      </nav>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', sans-serif;
      position: relative;
    }

    /* ── Toolbar ─────────────────────────────────────────────────── */
    .topbar {
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0 20px;
      height: 64px;
      min-height: 64px;
      background: var(--color-primary-dark, #003f5c);
      color: #e8f4f9;
      box-shadow: var(--shadow-lg);
      border-bottom: 3px solid var(--color-secondary-light, #4db6ac);
    }

    .brand-area {
      display: flex;
      flex-direction: column;
      gap: 1px;
      text-decoration: none;
      color: inherit;
      flex-shrink: 0;
    }
    .brand-title {
      font-family: 'Fraunces', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }
    .brand-subtitle {
      font-size: 0.72rem;
      color: var(--sidebar-text, #a8c4d5);
      line-height: 1;
    }

    .spacer { flex: 1; }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ── Nav desktop ─────────────────────────────────────────────── */
    .nav-desktop {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .nav-desktop a[mat-button],
    .nav-desktop button[mat-button] {
      color: var(--sidebar-text, #a8c4d5) !important;
      font-weight: 500;
      font-size: 0.88rem;
      border-radius: var(--radius-md, 12px) !important;
      transition: background var(--transition-fast), color var(--transition-fast) !important;
    }
    .nav-desktop a[mat-button]:hover,
    .nav-desktop button[mat-button]:hover {
      background: rgba(168, 196, 213, 0.12) !important;
      color: #fff !important;
    }

    .cart-btn { color: #e8f4f9 !important; }

    /* ── User chip (desktop) ─────────────────────────────────────── */
    .user-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(168, 196, 213, 0.08);
      border: 1px solid rgba(168, 196, 213, 0.15);
      border-radius: var(--radius-pill);
      padding: 4px 4px 4px 10px;
      max-width: 220px;
    }

    .user-avatar-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--color-primary, #005f87);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-avatar-icon mat-icon {
      font-size: 17px;
      width: 17px;
      height: 17px;
      color: #fff;
    }

    .user-chip-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .user-chip-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #e8f4f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
    .user-chip-role {
      font-size: 0.68rem;
      color: var(--sidebar-text, #a8c4d5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .user-chip-logout {
      color: var(--sidebar-text, #a8c4d5) !important;
      width: 32px !important;
      height: 32px !important;
      flex-shrink: 0;
    }
    .user-chip-logout:hover { color: #fca99b !important; }
    .user-chip-logout mat-icon { font-size: 18px; }

    /* ── Login button ────────────────────────────────────────────── */
    .login-btn {
      background: var(--color-primary, #005f87) !important;
      color: #ffffff !important;
      border-radius: var(--radius-pill) !important;
      font-weight: 600 !important;
      font-size: 0.85rem !important;
      padding: 0 14px !important;
      gap: 6px;
    }
    .login-btn:hover { background: var(--color-primary-light, #3a88aa) !important; }

    /* ── Hamburger (oculto en desktop) ───────────────────────────── */
    .hamburger-btn {
      display: none;
      color: #e8f4f9 !important;
    }

    /* ── Overlay ─────────────────────────────────────────────────── */
    .nav-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 98;
      animation: fadeIn 180ms ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ── Drawer móvil ────────────────────────────────────────────── */
    .mobile-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: min(300px, 85vw);
      height: 100dvh;
      background: var(--sidebar-bg, #071b2b);
      z-index: 99;
      transform: translateX(100%);
      transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    .mobile-drawer.open { transform: translateX(0); }

    .drawer-header {
      padding: 20px 20px 16px;
      background: var(--sidebar-bg-header, #040f1a);
      border-bottom: 1px solid rgba(168, 196, 213, 0.1);
      padding-top: calc(env(safe-area-inset-top, 0px) + 64px);
    }
    .drawer-user-name {
      font-weight: 700;
      font-size: 1rem;
      color: #e8f4f9;
    }
    .drawer-user-name.guest { color: var(--sidebar-text, #a8c4d5); font-weight: 500; }
    .drawer-user-status { font-size: 0.8rem; color: var(--sidebar-text-muted, #4a7086); margin-top: 2px; }

    .drawer-nav {
      flex: 1;
      padding: 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .drawer-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 13px 14px;
      color: var(--sidebar-text, #a8c4d5);
      text-decoration: none;
      border-radius: var(--radius-md, 12px);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-family: 'Inter', sans-serif;
      transition: background var(--transition-fast), color var(--transition-fast);
    }
    .drawer-item:hover {
      background: rgba(168, 196, 213, 0.08);
      color: #e8f4f9;
    }
    .drawer-item mat-icon { color: var(--sidebar-icon-accent, #4db6ac); font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .drawer-item.danger { color: #fca99b; }
    .drawer-item.danger mat-icon { color: #fca99b; }

    .drawer-divider {
      height: 1px;
      background: rgba(168, 196, 213, 0.1);
      margin: 8px 4px;
    }

    /* ── Responsive breakpoints ──────────────────────────────────── */
    @media (max-width: 768px) {
      .nav-desktop { display: none; }
      .user-chip { display: none; }
      .login-btn { display: none; }
      .hamburger-btn { display: flex; }
      .topbar { padding: 0 12px; }
      .brand-subtitle { display: none; }
    }

    @media (max-width: 480px) {
      .brand-title { font-size: 1.1rem; }
      .topbar { padding: 0 10px; height: 56px; min-height: 56px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNavbarComponent implements OnInit {
  private auth = inject(AuthService);
  private session = inject(SessionService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  cartService = inject(CartService);

  @Input() title = 'Restobar Las Olas';
  @Input() subtitle = 'Sabores marinos, cocina de barrio y atencion cercana';

  isAuthenticated = signal(false);
  customerName = signal('Invitado');
  customerStatus = signal('No has iniciado sesion');
  mobileMenuOpen = signal(false);

  toggleMobileMenu() { this.mobileMenuOpen.update(v => !v); }
  closeMobileMenu() { this.mobileMenuOpen.set(false); }

  async ngOnInit() {
    const logged = this.session.isAuthenticated();
    this.isAuthenticated.set(logged);

    if (logged) {
      try {
        const profile = await this.auth.loadProfile();
        const user = (await this.auth.getUser()).data.user;
        const name = [profile?.nombre, profile?.apellido].filter(Boolean).join(' ').trim();
        this.customerName.set(name || profile?.email || user?.email || 'Cliente autenticado');
        this.customerStatus.set(profile?.rol ? `Rol: ${profile.rol}` : user?.email ? `Sesion activa: ${user.email}` : 'Sesion activa');
      } catch {
        this.customerName.set('Cliente autenticado');
        this.customerStatus.set('Sesion activa');
      }
    }
  }

  isAdmin() {
    return this.isAuthenticated() && this.auth.isAdmin();
  }

  isKitchen() {
    return this.isAuthenticated() && (this.auth.hasRole('COCINERO') || this.auth.hasRole('ADMIN'));
  }

  goToKitchen() {
    if (this.isKitchen()) {
      void this.router.navigateByUrl('/cocina');
    }
  }

  goToAdmin() {
    if (this.isAdmin()) {
      void this.router.navigateByUrl('/admin');
    }
  }

  async logout() {
    await this.auth.signOut();
    this.isAuthenticated.set(false);
    this.customerName.set('Invitado');
    this.customerStatus.set('No has iniciado sesion');
    await this.router.navigateByUrl('/login');
  }

  openCart() {
    this.dialog.open(CartModalComponent, {
      width: '400px',
      maxWidth: '90vw',
      position: { top: '80px', right: '20px' },
      panelClass: 'cart-dialog-container'
    });
  }
}
