import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/auth/session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar class="topbar">
      <div class="customer-panel">
        <div class="customer-label">Cliente</div>
        <div class="customer-value" [class.guest]="!isAuthenticated()">{{ customerName() }}</div>
        <div class="customer-subtitle">{{ customerStatus() }}</div>
      </div>

      <div class="brand-area">
        <span class="brand-title">{{ title }}</span>
        <span class="brand-subtitle">{{ subtitle }}</span>
      </div>

      <span class="spacer"></span>

      <nav class="nav-actions">
        <a mat-button routerLink="/">Inicio</a>
        <a mat-button routerLink="/login" *ngIf="!isAuthenticated()">Login</a>
        <a mat-button routerLink="/register" *ngIf="!isAuthenticated()">Registro</a>
        <a mat-button routerLink="/admin" *ngIf="showAdminLink && isAdmin()">Admin</a>
        <button mat-flat-button color="accent" type="button" *ngIf="isAuthenticated()" (click)="logout()">
          <mat-icon>logout</mat-icon>
          Salir
        </button>
      </nav>
    </mat-toolbar>
  `,
  styles: [
    `
      :host {
        display: block;
        font-family: 'Source Sans 3', sans-serif;
      }

      .topbar {
        display: flex;
        align-items: center;
        gap: 16px;
        position: sticky;
        top: 0;
        z-index: 20;
        padding: 16px 20px;
        min-height: 88px;
        background: linear-gradient(120deg, #113b30, #1f6f8b 70%, #f4b286 140%);
        color: #f6f4ef;
        box-shadow: 0 18px 40px rgba(12, 22, 24, 0.2);
      }

      .customer-panel {
        display: flex;
        flex-direction: column;
        min-width: 220px;
        padding-right: 12px;
        border-right: 1px solid rgba(246, 244, 239, 0.2);
      }

      .customer-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        opacity: 0.75;
      }

      .customer-value {
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.2;
      }

      .customer-value.guest {
        font-weight: 600;
      }

      .customer-subtitle {
        font-size: 0.85rem;
        opacity: 0.8;
        margin-top: 2px;
      }

      .brand-area {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        padding-left: 4px;
      }

      .brand-title {
        font-family: 'Fraunces', serif;
        font-size: 1.4rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .brand-subtitle {
        font-size: 0.82rem;
        opacity: 0.82;
      }

      .spacer {
        flex: 1;
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      @media (max-width: 900px) {
        .topbar {
          flex-wrap: wrap;
          min-height: auto;
        }

        .customer-panel {
          min-width: 100%;
          border-right: 0;
          padding-right: 0;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(246, 244, 239, 0.2);
        }

        .brand-area {
          min-width: 100%;
        }

        .spacer {
          display: none;
        }

        .nav-actions {
          width: 100%;
          justify-content: flex-start;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNavbarComponent implements OnInit {
  private auth = inject(AuthService);
  private session = inject(SessionService);
  private router = inject(Router);

  @Input() title = 'Restobar Las Olas';
  @Input() subtitle = 'Sabores marinos, cocina de barrio y atencion cercana';
  @Input() showAdminLink = true;

  isAuthenticated = signal(false);
  customerName = signal('Invitado');
  customerStatus = signal('No has iniciado sesion');

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

  async logout() {
    await this.auth.signOut();
    this.isAuthenticated.set(false);
    this.customerName.set('Invitado');
    this.customerStatus.set('No has iniciado sesion');
    await this.router.navigateByUrl('/login');
  }
}
