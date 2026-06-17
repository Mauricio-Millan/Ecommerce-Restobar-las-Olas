import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { PlatosService } from '../../../core/catalog/platos.service';
import { Plato } from '../../../core/catalog/plato.model';
import { CategoriasService } from '../../../core/catalog/categorias.service';
import { Categoria } from '../../../core/catalog/categoria.model';
import { StorageService } from '../../../core/storage/storage.service';

@Component({
  selector: 'platos-admin',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatButtonModule, MatListModule, MatIconModule],
  template: `
    <div class="admin-grid">
      <section class="panel form-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Carta principal</p>
            <h3>{{ editingPlatoId() ? 'Editar plato' : 'Nuevo plato' }}</h3>
          </div>
        </div>
        <form [formGroup]="platoForm" (ngSubmit)="savePlato()" class="form-body">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción</mat-label>
            <textarea matInput rows="3" formControlName="descripcion"></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="categoriaId">
              @if (!categorias().length) {
                <mat-option [disabled]="true">Sin categorías disponibles</mat-option>
              }
              @for (c of categorias(); track c.id) {
                <mat-option [value]="c.id">{{ c.nombre || ('ID ' + c.id) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (loadingCategorias()) { <p class="form-hint">Cargando categorías...</p> }
          @if (errorCategorias()) { <p class="form-hint error">{{ errorCategorias() }}</p> }
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Precio</mat-label>
            <input matInput type="number" step="0.01" formControlName="precio" />
          </mat-form-field>
          <div class="file-upload full-width">
            <button type="button" mat-stroked-button color="primary" (click)="imageInput.click()">
              <mat-icon>upload_file</mat-icon> Subir Imagen
            </button>
            <input hidden type="file" #imageInput accept="image/*" (change)="onImageSelected($event)" />
            @if (selectedImage()) {
              <span class="file-name selected">{{ selectedImage()?.name }}</span>
            }
            @if (!selectedImage() && platoForm.get('urlImagen')?.value) {
              <span class="file-name">Imagen actual cargada</span>
            }
          </div>
          <mat-slide-toggle formControlName="activo">Activo</mat-slide-toggle>
          <div class="actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="isSaving()">
              {{ isSaving() ? 'Guardando...' : 'Guardar' }}
            </button>
            <button mat-stroked-button type="button" (click)="resetPlatoForm()" [disabled]="isSaving()">Limpiar</button>
          </div>
        </form>
      </section>

      <section class="panel list-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Listado</p>
            <h3>Platos registrados</h3>
          </div>
          <button mat-stroked-button type="button" (click)="loadPlatos()">Recargar</button>
        </div>
        @if (loadingPlatos()) { <p class="state">Cargando platos...</p> }
        @if (errorPlatos()) { <p class="state error">{{ errorPlatos() }}</p> }
        @if (!loadingPlatos() && !platos().length) { <p class="state empty">No hay platos registrados.</p> }
        @if (platos().length) {
          <div class="list" role="list">
            @for (plato of platos(); track plato.id) {
              <div class="list-item" role="listitem">
                <div class="item-body">
                  <div class="item-title">{{ plato.nombre }}</div>
                  <div class="item-sub">{{ plato.descripcion || 'Plato sin descripcion' }}</div>
                </div>
                <div class="item-meta">
                  <span class="price">S/ {{ plato.precio | number:'1.2-2' }}</span>
                  <span class="pill" [class.inactive]="!plato.activo">{{ plato.activo ? 'Activo' : 'Inactivo' }}</span>
                </div>
                <div class="item-actions">
                  <button mat-icon-button color="primary" (click)="editPlato(plato)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deletePlato(plato)">
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
    .panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    .form-body { display: grid; gap: 12px; }
    .full-width { width: 100%; }
    .file-upload { margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
    .file-name { font-size: 0.85rem; color: var(--color-text-medium, #4a6572); }
    .file-name.selected { color: var(--color-primary, #005f87); }
    .actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 4px; }
    .form-hint { margin: 0; font-size: 0.85rem; color: var(--color-text-medium, #4a6572); }
    .form-hint.error { color: var(--color-error, #c62828); }
    .state { margin: 8px 0; font-size: 0.9rem; color: var(--color-text-medium, #4a6572); }
    .state.error { color: var(--color-error, #c62828); }
    .state.empty { color: var(--color-text-low, #7a9aaa); }
    .list { display: grid; gap: 10px; }
    .list-item { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 12px; padding: 12px; border-radius: var(--radius-md, 12px); background: var(--color-surface-raised, #f0f6fa); border: 1px solid var(--color-border-light, #e8f1f7); }
    .item-title { font-weight: 700; color: var(--color-text-high, #0d2633); }
    .item-sub { font-size: 0.86rem; color: var(--color-text-medium, #4a6572); }
    .item-meta { display: grid; justify-items: end; gap: 6px; }
    .price { font-weight: 700; color: var(--color-primary, #005f87); }
    .pill { font-size: 0.72rem; padding: 2px 10px; border-radius: var(--radius-pill, 999px); background: rgba(0,95,135,0.1); color: var(--color-primary, #005f87); font-weight: 600; }
    .pill.inactive { background: rgba(198,40,40,0.1); color: var(--color-error, #c62828); }
    .item-actions { display: flex; gap: 4px; }

    @media (max-width: 980px) {
      .admin-grid { grid-template-columns: 1fr; }
      .list-item { grid-template-columns: 1fr; align-items: flex-start; }
      .item-meta { justify-items: start; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatosAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private platosService = inject(PlatosService);
  private categoriasService = inject(CategoriasService);
  private storageService = inject(StorageService);

  platos = signal<Plato[]>([]);
  categorias = signal<Categoria[]>([]);
  editingPlatoId = signal<number | null>(null);
  loadingPlatos = signal(false);
  loadingCategorias = signal(false);
  isSaving = signal(false);
  errorPlatos = signal<string | null>(null);
  errorCategorias = signal<string | null>(null);
  selectedImage = signal<File | null>(null);

  platoForm = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    categoriaId: [undefined as number | undefined, [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0)]],
    urlImagen: [''],
    activo: [true]
  });

  async ngOnInit() {
    await Promise.all([this.loadPlatos(), this.loadCategorias()]);
  }

  async loadPlatos() {
    this.loadingPlatos.set(true);
    this.errorPlatos.set(null);
    try {
      const res = await this.platosService.getAll().toPromise();
      this.platos.set(res ?? []);
    } catch (error) {
      console.error('Error cargando platos', error);
      this.errorPlatos.set('No se pudieron cargar los platos. Revisa el backend o la sesion.');
      this.platos.set([]);
    } finally {
      this.loadingPlatos.set(false);
    }
  }

  async loadCategorias() {
    this.loadingCategorias.set(true);
    this.errorCategorias.set(null);
    try {
      const res = await this.categoriasService.getAll().toPromise();
      this.categorias.set(res ?? []);
    } catch (error) {
      console.error('Error cargando categorias', error);
      this.errorCategorias.set('No se pudieron cargar las categorias.');
      this.categorias.set([]);
    } finally {
      this.loadingCategorias.set(false);
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage.set(input.files[0]);
    }
  }

  async savePlato() {
    if (this.platoForm.invalid) return;
    
    this.isSaving.set(true);
    let finalUrl = this.platoForm.get('urlImagen')?.value;

    if (this.selectedImage()) {
      try {
        finalUrl = await this.storageService.uploadPlatoImage(this.selectedImage()!);
      } catch (error) {
        console.error('Error subiendo imagen de plato', error);
        alert('Error al subir la imagen. Verifica que el bucket "Platos" exista en Supabase y tenga políticas RLS para INSERT.');
        this.isSaving.set(false);
        return;
      }
    }

    const raw = this.platoForm.getRawValue();
    const payload: Plato = {
      nombre: String(raw.nombre ?? ''),
      descripcion: (raw.descripcion ?? undefined) as string | undefined,
      precio: Number(raw.precio),
      urlImagen: finalUrl ?? undefined,
      activo: Boolean(raw.activo),
      categoria: raw.categoriaId ? { id: Number(raw.categoriaId), nombre: undefined } : undefined
    };

    try {
      if (this.editingPlatoId()) {
        await this.platosService.update(this.editingPlatoId()!, payload).toPromise();
      } else {
        await this.platosService.create(payload).toPromise();
      }
      this.resetPlatoForm();
      await this.loadPlatos();
    } catch (error) {
      console.error('Error guardando plato', error);
      alert('Error al guardar el plato.');
    } finally {
      this.isSaving.set(false);
    }
  }

  editPlato(plato: Plato) {
    this.editingPlatoId.set(plato.id ?? null);
    this.platoForm.patchValue({
      nombre: plato.nombre,
      descripcion: plato.descripcion ?? '',
      precio: plato.precio,
      urlImagen: plato.urlImagen ?? '',
      activo: plato.activo ?? true,
      categoriaId: plato.categoria?.id ?? undefined
    });
  }

  async deletePlato(plato: Plato) {
    if (!plato.id) return;
    await this.platosService.delete(plato.id).toPromise();
    await this.loadPlatos();
  }

  resetPlatoForm() {
    this.editingPlatoId.set(null);
    this.selectedImage.set(null);
    this.platoForm.reset({ nombre: '', descripcion: '', precio: 0, urlImagen: '', activo: true, categoriaId: null });
  }
}
