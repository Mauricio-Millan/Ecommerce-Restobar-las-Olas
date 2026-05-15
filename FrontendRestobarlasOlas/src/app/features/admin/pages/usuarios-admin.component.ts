import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'usuarios-admin',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  template: `
    <div class="admin-grid">
      <section class="admin-list">
        <h3>Usuarios (pendiente de implementación backend)</h3>
        <mat-list>
          <mat-list-item>
            <div matLine>Funcionalidad de usuarios aún no implementada en el backend</div>
          </mat-list-item>
        </mat-list>
      </section>
    </div>
  `,
  styles: [`.admin-grid{display:grid;grid-template-columns:1fr;gap:16px}.admin-list{background:#fff;padding:12px;border-radius:8px}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosAdminComponent {}
