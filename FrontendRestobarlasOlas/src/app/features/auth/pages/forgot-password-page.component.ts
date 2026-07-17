import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'auth-forgot-password-page',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="page">
      <div class="auth-shell">
        <mat-card class="auth-card">
          <mat-card-header>
            <mat-card-title>Recuperar contraseña</mat-card-title>
            <mat-card-subtitle>Te enviaremos un enlace para restablecerla</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput id="email" formControlName="email" type="email" />
                <mat-error>Email inválido</mat-error>
              </mat-form-field>

              <div class="actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || sending()">
                  Enviar enlace
                </button>
              </div>
            </form>
          </mat-card-content>

          <mat-divider></mat-divider>

          <mat-card-content>
            @if (feedbackMessage()) {
              <div class="auth-message" [class.success]="feedbackType() === 'success'" [class.error]="feedbackType() === 'error'">
                {{ feedbackMessage() }}
              </div>
            }
            <p class="footer-link">¿Ya la recordaste? <a (click)="goLogin()">Inicia sesión</a></p>
          </mat-card-content>
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
export class ForgotPasswordPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  sending = signal(false);
  feedbackMessage = signal<string | null>(null);
  feedbackType = signal<'success' | 'error' | null>(null);

  private readonly genericMessage =
    'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.';

  async onSubmit() {
    this.feedbackMessage.set(null);
    this.feedbackType.set(null);
    if (this.form.invalid) return;
    const { email } = this.form.value;
    this.sending.set(true);
    try {
      await this.auth.requestPasswordReset(email);
    } catch {
      // Nunca revelamos si el correo existe o no, ni errores internos del proveedor.
    } finally {
      this.sending.set(false);
      this.feedbackType.set('success');
      this.feedbackMessage.set(this.genericMessage);
    }
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
