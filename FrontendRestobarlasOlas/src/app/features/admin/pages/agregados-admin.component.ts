import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AgregadosService } from '../../../core/catalog/agregados.service';
import { Agregado } from '../../../core/catalog/agregado.model';
import { PlatosService } from '../../../core/catalog/platos.service';
import { PlatoAgregadosService } from '../../../core/catalog/plato-agregados.service';
import { Plato } from '../../../core/catalog/plato.model';

@Component({
  selector: 'agregados-admin',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatListModule, MatIconModule],
  template: `
    <div class="admin-grid">
      <section class="panel form-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Extras</p>
            <h3>{{ editingAgregadoId() ? 'Editar agregado' : 'Nuevo agregado' }}</h3>
          </div>
        </div>
        <form [formGroup]="agregadoForm" (ngSubmit)="saveAgregado()" class="form-body">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Precio</mat-label>
            <input matInput type="number" step="0.01" formControlName="precio" />
          </mat-form-field>
          <div class="actions">
            <button mat-flat-button color="primary" type="submit">Guardar</button>
            <button mat-stroked-button type="button" (click)="resetAgregadoForm()">Limpiar</button>
          </div>
        </form>
      </section>

      <section class="panel list-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Asociaciones</p>
            <h3>Vincular agregados</h3>
          </div>
        </div>
        <div class="link-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Elegir agregado</mat-label>
            <mat-select (selectionChange)="onEditingAgregadoSelected($event.value)">
              @if (!agregados().length) { <mat-option [disabled]="true">Sin agregados disponibles</mat-option> }
              @for (a of agregados(); track a.id) { <mat-option [value]="a.id">{{ a.nombre }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Elegir plato</mat-label>
            <mat-select (selectionChange)="onSelectedPlatoSelected($event.value)">
              @if (!platos().length) { <mat-option [disabled]="true">Sin platos disponibles</mat-option> }
              @for (p of platos(); track p.id) { <mat-option [value]="p.id">{{ p.nombre }}</mat-option> }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" type="button" [disabled]="!canLink()" (click)="linkAgregadoToPlato()">Vincular agregado al plato</button>
        </div>
        @if (linkMessage()) { <p class="state">{{ linkMessage() }}</p> }
      </section>

      <section class="panel list-panel full">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Listado</p>
            <h3>Agregados registrados</h3>
          </div>
          <button mat-stroked-button type="button" (click)="loadAgregados()">Recargar</button>
        </div>
        @if (loadingAgregados()) { <p class="state">Cargando agregados...</p> }
        @if (errorAgregados()) { <p class="state error">{{ errorAgregados() }}</p> }
        @if (!loadingAgregados() && !agregados().length) { <p class="state empty">No hay agregados registrados.</p> }
        @if (agregados().length) {
          <div class="list" role="list">
            @for (agregado of agregados(); track agregado.id) {
              <div class="list-item" role="listitem">
                <div class="item-body">
                  <div class="item-title">{{ agregado.nombre }}</div>
                  <div class="item-sub">Agregado de carta</div>
                </div>
                <div class="item-meta">
                  <span class="price">S/ {{ agregado.precio | number:'1.2-2' }}</span>
                </div>
                <div class="item-actions">
                  <button mat-icon-button color="primary" (click)="editAgregado(agregado)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteAgregado(agregado)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; color: var(--color-text-high, #0d2633); }
    h3 { font-family: 'Fraunces', serif; margin: 0; font-size: 1.25rem; color: var(--color-primary-dark, #003f5c); }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.68rem; color: var(--color-secondary, #00897b); margin: 0 0 4px; font-weight: 600; }
    .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .panel { background: var(--color-surface, #fff); border-radius: var(--radius-lg, 16px); border: 1px solid var(--color-border-light, #e8f1f7); padding: 18px; box-shadow: var(--shadow-md); }
    .panel.full { grid-column: 1 / -1; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    .form-body { display: grid; gap: 12px; }
    .link-grid { display: grid; gap: 12px; }
    .full-width { width: 100%; }
    .actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 6px; }
    .state { margin: 8px 0; font-size: 0.9rem; color: var(--color-text-medium, #4a6572); }
    .state.error { color: var(--color-error, #c62828); }
    .state.empty { color: var(--color-text-low, #7a9aaa); }
    .list { display: grid; gap: 10px; }
    .list-item { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 12px; padding: 12px; border-radius: var(--radius-md, 12px); background: var(--color-surface-raised, #f0f6fa); border: 1px solid var(--color-border-light, #e8f1f7); }
    .item-title { font-weight: 700; color: var(--color-text-high, #0d2633); }
    .item-sub { font-size: 0.86rem; color: var(--color-text-medium, #4a6572); }
    .item-meta { display: grid; justify-items: end; gap: 6px; }
    .price { font-weight: 700; color: var(--color-primary, #005f87); }
    .item-actions { display: flex; gap: 4px; }

    @media (max-width: 980px) {
      .admin-grid { grid-template-columns: 1fr; }
      .panel.full { grid-column: auto; }
      .list-item { grid-template-columns: 1fr; align-items: flex-start; }
      .item-meta { justify-items: start; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgregadosAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private agregadosService = inject(AgregadosService);
  private platosService = inject(PlatosService);
  private platoAgregadosService = inject(PlatoAgregadosService);

  agregados = signal<Agregado[]>([]);
  editingAgregadoId = signal<number | null>(null);
  platos = signal<Plato[]>([]);
  selectedPlatoId = signal<number | null>(null);
  loadingAgregados = signal(false);
  errorAgregados = signal<string | null>(null);
  loadingPlatos = signal(false);
  errorPlatos = signal<string | null>(null);
  linkMessage = signal<string | null>(null);
  canLink = computed(() => Boolean(this.editingAgregadoId() && this.selectedPlatoId()));

  agregadoForm = this.fb.group({
    nombre: ['', [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0)]]
  });

  async ngOnInit() {
    await Promise.all([this.loadAgregados(), this.loadPlatos()]);
  }

  async loadAgregados() {
    this.loadingAgregados.set(true);
    this.errorAgregados.set(null);
    try {
      const res = await this.agregadosService.getAll().toPromise();
      this.agregados.set(res ?? []);
    } catch (error) {
      console.error('Error cargando agregados', error);
      this.errorAgregados.set('No se pudieron cargar los agregados.');
      this.agregados.set([]);
    } finally {
      this.loadingAgregados.set(false);
    }
  }

  async loadPlatos() {
    this.loadingPlatos.set(true);
    this.errorPlatos.set(null);
    try {
      const res = await this.platosService.getAll().toPromise();
      this.platos.set(res ?? []);
    } catch (error) {
      console.error('Error cargando platos para vinculo', error);
      this.errorPlatos.set('No se pudieron cargar los platos.');
      this.platos.set([]);
    } finally {
      this.loadingPlatos.set(false);
    }
  }

  async saveAgregado() {
    if (this.agregadoForm.invalid) return;
    const raw = this.agregadoForm.getRawValue();
    const payload: Agregado = { nombre: String(raw.nombre ?? ''), precio: Number(raw.precio), activo: true };
    if (this.editingAgregadoId()) {
      await this.agregadosService.update(this.editingAgregadoId()!, payload).toPromise();
    } else {
      await this.agregadosService.create(payload).toPromise();
    }
    this.resetAgregadoForm();
    await this.loadAgregados();
  }

  editAgregado(agregado: Agregado) {
    this.editingAgregadoId.set(agregado.id ?? null);
    this.agregadoForm.patchValue({ nombre: agregado.nombre, precio: agregado.precio });
  }

  async deleteAgregado(agregado: Agregado) {
    if (!agregado.id) return;
    await this.agregadosService.delete(agregado.id).toPromise();
    await this.loadAgregados();
  }

  resetAgregadoForm() {
    this.editingAgregadoId.set(null);
    this.agregadoForm.reset({ nombre: '', precio: 0 });
  }

  async linkAgregadoToPlato() {
    const agregadoId = this.editingAgregadoId();
    const platoId = this.selectedPlatoId();
    if (!agregadoId || !platoId) return;
    this.linkMessage.set(null);
    try {
      await this.platoAgregadosService.createAssociation(platoId, agregadoId).toPromise();
      this.linkMessage.set('Vinculo guardado correctamente.');
      await this.loadPlatos();
    } catch (error) {
      console.error('Error vinculando agregado', error);
      this.linkMessage.set('No se pudo vincular el agregado.');
    }
  }

  // Selection handlers called from template
  onEditingAgregadoSelected(value: number | null) {
    this.editingAgregadoId.set(value ?? null);
  }

  onSelectedPlatoSelected(value: number | null) {
    this.selectedPlatoId.set(value ?? null);
  }
}
