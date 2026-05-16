import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'usuarios-admin',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule],
  template: `
    <div class="admin-panel-container">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Gestión de Accesos</p>
          <h3>Usuarios del Sistema</h3>
        </div>
        <div class="search-box">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar por nombre o correo..." />
          </mat-form-field>
        </div>
      </div>

      <div class="panel-body">
        <div class="list" role="list">
          
          <!-- Mock User 1 -->
          <div class="list-item" role="listitem">
            <div class="user-avatar">
              <mat-icon>security</mat-icon>
            </div>
            <div class="item-body">
              <div class="item-title">Carlos Administrador</div>
              <div class="item-sub">carlos.admin@restobar.com</div>
            </div>
            <div class="item-role">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="role-select">
                <mat-label>Rol</mat-label>
                <mat-select value="admin">
                  <mat-option value="admin">Administrador</mat-option>
                  <mat-option value="mesero">Mesero</mat-option>
                  <mat-option value="cliente">Cliente</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="item-actions">
              <button mat-icon-button color="primary" matTooltip="Guardar cambios">
                <mat-icon>save</mat-icon>
              </button>
            </div>
          </div>

          <!-- Mock User 2 -->
          <div class="list-item" role="listitem">
            <div class="user-avatar cliente">
              <mat-icon>person_outline</mat-icon>
            </div>
            <div class="item-body">
              <div class="item-title">Maria Cliente</div>
              <div class="item-sub">maria.cliente@gmail.com</div>
            </div>
            <div class="item-role">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="role-select">
                <mat-label>Rol</mat-label>
                <mat-select value="cliente">
                  <mat-option value="admin">Administrador</mat-option>
                  <mat-option value="mesero">Mesero</mat-option>
                  <mat-option value="cliente">Cliente</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="item-actions">
              <button mat-icon-button color="primary">
                <mat-icon>save</mat-icon>
              </button>
            </div>
          </div>

          <!-- Mock User 3 -->
          <div class="list-item" role="listitem">
            <div class="user-avatar mesero">
              <mat-icon>room_service</mat-icon>
            </div>
            <div class="item-body">
              <div class="item-title">Juan Mesero</div>
              <div class="item-sub">juan.mesero@restobar.com</div>
            </div>
            <div class="item-role">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="role-select">
                <mat-label>Rol</mat-label>
                <mat-select value="mesero">
                  <mat-option value="admin">Administrador</mat-option>
                  <mat-option value="mesero">Mesero</mat-option>
                  <mat-option value="cliente">Cliente</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="item-actions">
              <button mat-icon-button color="primary">
                <mat-icon>save</mat-icon>
              </button>
            </div>
          </div>

        </div>
        <p class="pending-note">* Los datos mostrados son de prueba. La lógica de filtrado y actualización está pendiente de integración con el backend.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Source Sans 3', sans-serif; color: #1d2b2a; display: block; }
    h3 { font-family: 'Fraunces', serif; margin: 0; font-size: 1.5rem; color: #0f172a; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.68rem; color: #64748b; margin: 0 0 4px; font-weight: 600;}
    
    .admin-panel-container { 
      background: #ffffff; 
      border-radius: 16px; 
      border: 1px solid rgba(15, 23, 42, 0.08); 
      padding: 24px; 
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05); 
    }
    
    .panel-header { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      gap: 16px; 
      margin-bottom: 24px; 
      flex-wrap: wrap;
    }
    
    .search-box {
      flex: 1;
      max-width: 400px;
    }
    .search-field { width: 100%; }
    
    .list { display: grid; gap: 12px; }
    .list-item { 
      display: grid; 
      grid-template-columns: auto 1fr auto auto; 
      align-items: center; 
      gap: 16px; 
      padding: 16px; 
      border-radius: 12px; 
      background: #f8fafc; 
      border: 1px solid rgba(15, 23, 42, 0.05); 
      transition: all 0.2s ease;
    }
    .list-item:hover {
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
      border-color: rgba(31, 111, 139, 0.2);
    }
    
    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-avatar.cliente { background: #e0f2fe; color: #0284c7; }
    .user-avatar.mesero { background: #fef3c7; color: #d97706; }
    
    .item-title { font-weight: 700; color: #0f172a; font-size: 1.05rem;}
    .item-sub { font-size: 0.85rem; color: #64748b; margin-top: 2px;}
    
    .item-role {
      width: 160px;
    }
    .role-select {
      width: 100%;
    }
    
    .pending-note {
      margin-top: 24px;
      font-size: 0.85rem;
      color: #94a3b8;
      font-style: italic;
      text-align: center;
    }

    @media (max-width: 768px) {
      .list-item { 
        grid-template-columns: auto 1fr;
        grid-template-areas: 
          "avatar body"
          "role role"
          "actions actions";
      }
      .user-avatar { grid-area: avatar; }
      .item-body { grid-area: body; }
      .item-role { grid-area: role; width: 100%; margin-top: 12px;}
      .item-actions { grid-area: actions; justify-self: end;}
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosAdminComponent {}
