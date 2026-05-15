import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { signal, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'auth-login-page',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="page">
      <div class="auth-shell">
        <mat-card class="auth-card">
          <mat-card-header>
            <mat-card-title>Iniciar sesión</mat-card-title>
            <mat-card-subtitle>Ingresa con tu correo y contraseña</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput id="email" formControlName="email" type="email" />
                <mat-error *ngIf="form.get('email')?.touched && form.get('email')?.invalid">Email inválido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput id="password" formControlName="password" type="password" />
                <mat-error *ngIf="form.get('password')?.touched && form.get('password')?.invalid">Contraseña requerida</mat-error>
              </mat-form-field>

              <div class="actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Entrar</button>
              </div>
            </form>
          </mat-card-content>

          <mat-divider></mat-divider>

          <mat-card-content>
            <div *ngIf="feedbackMessage()" class="auth-message" [class.success]="feedbackType() === 'success'" [class.error]="feedbackType() === 'error'">
              {{ feedbackMessage() }}
            </div>
            <p class="footer-link">¿No tienes cuenta? <a (click)="goRegister()">Regístrate</a></p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  feedbackMessage = signal<string | null>(null);
  feedbackType = signal<'success' | 'error' | null>(null);

  async onSubmit() {
    this.feedbackMessage.set(null);
    this.feedbackType.set(null);
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    if (!email || !password) {
      this.feedbackType.set('error');
      this.feedbackMessage.set('Email y contraseña son requeridos');
      return;
    }
    try {
      await this.auth.signIn(email, password);
      this.feedbackType.set('success');
      this.feedbackMessage.set('Inicio de sesión exitoso');
      setTimeout(() => {
        void this.router.navigateByUrl('/');
      }, 900);
    } catch (err: any) {
      this.feedbackType.set('error');
      this.feedbackMessage.set('Credenciales incorrectas');
    }
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}


