import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminService, UsuarioAdmin } from '../../../core/admin/admin.service';

const ROLES = [
  { id: 1, label: 'Cliente' },
  { id: 2, label: 'Admin' },
  { id: 3, label: 'Cocinero' },
];

@Component({
  selector: 'usuarios-admin',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatButtonModule, MatSlideToggleModule
  ],
  template: `
    <div class="admin-panel-container">

      <!-- ── Encabezado ──────────────────────────────────── -->
      <div class="panel-header">
        <div>
          <p class="eyebrow">Iteración 6 · HU-18</p>
          <h3>Gestionar Cuentas</h3>
          <p class="header-sub">Administra el acceso y los roles del personal.</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput
                   placeholder="Buscar por nombre, apellido o DNI..."
                   [ngModel]="searchQuery()"
                   (ngModelChange)="onSearchChange($event)" />
            @if (searchQuery()) {
              <button matSuffix mat-icon-button (click)="clearSearch()" aria-label="Limpiar">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
        </div>
      </div>

      <!-- ── Estado: cargando / error / vacío ──────────── -->
      @if (loading()) {
        <div class="state-box">
          <div class="spinner"></div>
          <span>Buscando usuarios...</span>
        </div>
      }

      @if (error() && !loading()) {
        <div class="state-box error-state">
          <mat-icon>error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-stroked-button (click)="buscar(searchQuery())">Reintentar</button>
        </div>
      }

      @if (!loading() && !error() && !usuarios().length) {
        <div class="state-box empty-state">
          <mat-icon>manage_accounts</mat-icon>
          <p>No se encontraron usuarios{{ searchQuery() ? ' para "' + searchQuery() + '"' : '' }}.</p>
        </div>
      }

      <!-- ── Lista de usuarios ──────────────────────────── -->
      @if (!loading() && usuarios().length) {
        <div class="result-info">
          {{ usuarios().length }} usuario{{ usuarios().length !== 1 ? 's' : '' }} encontrado{{ usuarios().length !== 1 ? 's' : '' }}
        </div>

        <div class="user-list" role="list">
          @for (u of usuarios(); track u.id) {
            <div class="user-card" role="listitem" [class.inactive]="!u.activo">

              <!-- Avatar -->
              <div class="user-avatar" [class]="avatarClass(u)">
                <mat-icon>{{ avatarIcon(u) }}</mat-icon>
              </div>

              <!-- Info básica -->
              <div class="user-info">
                <div class="user-name">{{ u.nombre }} {{ u.apellido }}</div>
                <div class="user-email">{{ u.email }}</div>
                <div class="user-meta">
                  <span class="meta-chip"><mat-icon>badge</mat-icon>{{ u.dni || '—' }}</span>
                  <span class="meta-chip"><mat-icon>phone</mat-icon>{{ u.celular || '—' }}</span>
                </div>
              </div>

              <!-- Rol selector -->
              <div class="user-role">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="role-select">
                  <mat-label>Rol</mat-label>
                  <mat-select [ngModel]="pendingRol(u.id) ?? u.rol?.id ?? null"
                              (ngModelChange)="onRolChange(u.id, $event)">
                    <mat-option [value]="null">Sin rol</mat-option>
                    @for (r of roles; track r.id) {
                      <mat-option [value]="r.id">{{ r.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <button mat-flat-button color="primary" class="save-btn"
                        [disabled]="!hasPendingRolChange(u.id) || savingId() === u.id"
                        (click)="saveRol(u)">
                  @if (savingId() === u.id) {
                    <div class="btn-spinner"></div>
                  } @else {
                    <mat-icon>save</mat-icon>
                  }
                  Guardar
                </button>
              </div>

              <!-- Toggle activo -->
              <div class="user-toggle">
                <mat-slide-toggle
                  [ngModel]="u.activo"
                  (ngModelChange)="toggleActivo(u, $event)"
                  [disabled]="togglingId() === u.id"
                  color="primary">
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </mat-slide-toggle>
                <span class="badge-status" [class.active]="u.activo" [class.inactive]="!u.activo">
                  {{ u.activo ? 'Acceso habilitado' : 'Acceso bloqueado' }}
                </span>
              </div>

            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; color: var(--color-text-high); display: block; }

    h3 { font-family: 'Fraunces', serif; margin: 0; font-size: 1.5rem; color: var(--color-primary-dark); }
    .eyebrow {
      text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.68rem;
      color: var(--color-secondary); margin: 0 0 4px; font-weight: 600;
    }
    .header-sub { margin: 4px 0 0; font-size: 0.88rem; color: var(--color-text-medium); }

    /* ── Container ───────────────────────────────────── */
    .admin-panel-container {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-light);
      padding: 24px;
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Header ──────────────────────────────────────── */
    .panel-header {
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 20px; flex-wrap: wrap;
    }
    .header-actions { flex: 1; max-width: 400px; }
    .search-field { width: 100%; }

    /* ── States ──────────────────────────────────────── */
    .state-box {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; padding: 48px 0;
      color: var(--color-text-medium); font-size: 0.95rem; text-align: center;
    }
    .state-box mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.45; }
    .state-box p { margin: 0; }
    .state-box.error-state { color: var(--color-error); }
    .state-box.error-state mat-icon { opacity: 0.75; }
    .state-box.empty-state mat-icon { color: var(--color-text-low); }

    .spinner {
      width: 32px; height: 32px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Result info ─────────────────────────────────── */
    .result-info {
      font-size: 0.82rem; color: var(--color-text-low); font-weight: 500;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--color-border-light);
    }

    /* ── User list ───────────────────────────────────── */
    .user-list { display: flex; flex-direction: column; gap: 12px; }

    .user-card {
      display: grid;
      grid-template-columns: 52px 1fr auto auto;
      align-items: center;
      gap: 16px;
      padding: 16px 18px;
      border-radius: var(--radius-md);
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-light);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    .user-card:hover {
      border-color: var(--color-border);
      box-shadow: var(--shadow-sm);
    }
    .user-card.inactive {
      opacity: 0.65;
      background: var(--color-surface);
      border-style: dashed;
    }

    /* ── Avatar ──────────────────────────────────────── */
    .user-avatar {
      width: 52px; height: 52px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: var(--color-primary-surface);
      color: var(--color-primary);
      flex-shrink: 0;
    }
    .user-avatar.admin   { background: var(--color-warning-surface); color: var(--color-warning); }
    .user-avatar.cliente { background: var(--color-info-surface); color: var(--color-info); }
    .user-avatar.cocinero{ background: var(--color-success-surface); color: var(--color-success); }
    .user-avatar mat-icon { font-size: 24px; }

    /* ── User info ───────────────────────────────────── */
    .user-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .user-name  { font-weight: 700; font-size: 0.97rem; color: var(--color-text-high); }
    .user-email { font-size: 0.83rem; color: var(--color-text-medium); }
    .user-meta  { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
    .meta-chip  {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.75rem; color: var(--color-text-low); font-weight: 500;
    }
    .meta-chip mat-icon { font-size: 13px; width: 13px; height: 13px; }

    /* ── Role select ─────────────────────────────────── */
    .user-role { display: flex; align-items: center; gap: 8px; }
    .role-select { width: 160px; }

    .save-btn {
      height: 40px !important;
      border-radius: var(--radius-md) !important;
      font-size: 0.82rem !important;
      font-weight: 600 !important;
      min-width: 90px !important;
    }
    .btn-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* ── Toggle ──────────────────────────────────────── */
    .user-toggle {
      display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
    }
    .badge-status {
      font-size: 0.72rem; font-weight: 600;
      padding: 2px 8px; border-radius: var(--radius-pill);
    }
    .badge-status.active   { background: var(--color-success-surface); color: var(--color-success); }
    .badge-status.inactive { background: var(--color-error-surface); color: var(--color-error); }

    /* ── Responsive ──────────────────────────────────── */
    @media (max-width: 900px) {
      .user-card {
        grid-template-columns: 44px 1fr;
        grid-template-areas:
          "avatar info"
          "role   role"
          "toggle toggle";
      }
      .user-avatar { grid-area: avatar; width: 44px; height: 44px; }
      .user-info   { grid-area: info; }
      .user-role   { grid-area: role; }
      .user-toggle { grid-area: toggle; align-items: flex-start; flex-direction: row; }
      .role-select { flex: 1; }
    }

    @media (max-width: 560px) {
      .admin-panel-container { padding: 16px; }
      .panel-header { flex-direction: column; }
      .header-actions { max-width: 100%; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosAdminComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);

  readonly roles = ROLES;

  usuarios  = signal<UsuarioAdmin[]>([]);
  loading   = signal(false);
  error     = signal<string | null>(null);
  searchQuery = signal('');
  savingId  = signal<string | null>(null);
  togglingId = signal<string | null>(null);

  private pendingRoles = new Map<string, number | null>();
  private searchSubject = new Subject<string>();
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.searchSubject.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(q => this.buscar(q));
    this.buscar('');
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  buscar(query: string) {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.buscarUsuarios(query || undefined).subscribe({
      next: data => { this.usuarios.set(data); this.loading.set(false); },
      error: () => { this.error.set('No se pudo conectar con el servidor.'); this.loading.set(false); }
    });
  }

  onRolChange(id: string, rolId: number | null) {
    this.pendingRoles.set(id, rolId);
  }

  hasPendingRolChange(id: string): boolean {
    return this.pendingRoles.has(id);
  }

  pendingRol(id: string): number | null | undefined {
    return this.pendingRoles.get(id);
  }

  saveRol(u: UsuarioAdmin) {
    const rolId = this.pendingRoles.get(u.id);
    if (rolId === undefined) return;
    this.savingId.set(u.id);
    this.adminService.asignarRolUsuario(u.id, rolId).subscribe({
      next: updated => {
        this.usuarios.update(list => list.map(x => x.id === u.id ? updated : x));
        this.pendingRoles.delete(u.id);
        this.savingId.set(null);
      },
      error: () => {
        alert('No se pudo guardar el rol. Intente nuevamente.');
        this.savingId.set(null);
      }
    });
  }

  toggleActivo(u: UsuarioAdmin, value: boolean) {
    this.togglingId.set(u.id);
    this.usuarios.update(list => list.map(x => x.id === u.id ? { ...x, activo: value } : x));
    this.adminService.cambiarEstadoUsuario(u.id, value).subscribe({
      next: updated => {
        this.usuarios.update(list => list.map(x => x.id === u.id ? updated : x));
        this.togglingId.set(null);
      },
      error: () => {
        this.usuarios.update(list => list.map(x => x.id === u.id ? { ...x, activo: !value } : x));
        alert('No se pudo cambiar el estado. Intente nuevamente.');
        this.togglingId.set(null);
      }
    });
  }

  avatarClass(u: UsuarioAdmin): string {
    const rolId = u.rol?.id;
    if (rolId === 2) return 'admin';
    if (rolId === 3) return 'cocinero';
    if (rolId === 1) return 'cliente';

    const rol = u.rol?.rol?.toLowerCase() ?? '';
    if (rol.includes('admin')) return 'admin';
    if (rol.includes('cocinero')) return 'cocinero';
    return 'cliente';
  }

  avatarIcon(u: UsuarioAdmin): string {
    const rolId = u.rol?.id;
    if (rolId === 2) return 'security';
    if (rolId === 3) return 'soup_kitchen';
    if (rolId === 1) return 'person_outline';

    const rol = u.rol?.rol?.toLowerCase() ?? '';
    if (rol.includes('admin')) return 'security';
    if (rol.includes('cocinero')) return 'soup_kitchen';
    return 'person_outline';
  }
}
