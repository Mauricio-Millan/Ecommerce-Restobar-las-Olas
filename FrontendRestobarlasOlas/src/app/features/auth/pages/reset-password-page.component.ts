import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'auth-reset-password-page',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="page">
      <div class="auth-shell">
        <mat-card class="auth-card">
          <mat-card-header>
            <mat-card-title>Restablecer contraseña</mat-card-title>
            <mat-card-subtitle>Ingresa tu nueva contraseña</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nueva contraseña</mat-label>
                <input matInput formControlName="password" type="password" />
                <mat-error>Mínimo 8 caracteres</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmar contraseña</mat-label>
                <input matInput formControlName="confirmPassword" type="password" />
                @if (form.errors?.['passwordMismatch']) {
                  <mat-error>Las contraseñas no coinciden</mat-error>
                }
              </mat-form-field>

              <div class="actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || sending()">
                  Guardar contraseña
                </button>
              </div>
            </form>
          </mat-card-content>

          @if (feedbackMessage()) {
            <mat-card-content>
              <div class="auth-message" [class.success]="feedbackType() === 'success'" [class.error]="feedbackType() === 'error'">
                {{ feedbackMessage() }}
              </div>
            </mat-card-content>
          }
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    mat-card-title {
      font-family: 'Fraunces', serif !important;
      color: var(--color-primary-dark, #003f5c) !important;
      font-size: 1.6rem !important;
    }
    mat-card-subtitle {
      color: var(--color-text-medium, #4a6572) !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  sending = signal(false);
  feedbackMessage = signal<string | null>(null);
  feedbackType = signal<'success' | 'error' | null>(null);

  async onSubmit() {
    this.feedbackMessage.set(null);
    this.feedbackType.set(null);
    if (this.form.invalid) return;
    const { password } = this.form.value;
    this.sending.set(true);
    try {
      await this.auth.updatePassword(password);
      this.feedbackType.set('success');
      this.feedbackMessage.set('Contraseña actualizada. Redirigiendo...');
      setTimeout(() => void this.router.navigateByUrl('/'), 1200);
    } catch {
      this.feedbackType.set('error');
      this.feedbackMessage.set('El enlace no es válido o ha expirado. Solicita uno nuevo.');
    } finally {
      this.sending.set(false);
    }
  }
}
