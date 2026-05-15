import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { signal, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionService } from '../../../core/auth/session.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'auth-register-page',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="page">
      <div class="auth-shell">
        <mat-card class="auth-card">
          <mat-card-header>
            <mat-card-title>Registrar cuenta</mat-card-title>
            <mat-card-subtitle>Crea tu acceso para continuar</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre</mat-label>
                <input matInput id="nombre" type="text" formControlName="nombre" />
                <mat-error *ngIf="form.get('nombre')?.touched && form.get('nombre')?.invalid">Nombre requerido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Apellido</mat-label>
                <input matInput id="apellido" type="text" formControlName="apellido" />
                <mat-error *ngIf="form.get('apellido')?.touched && form.get('apellido')?.invalid">Apellido requerido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput id="email" type="email" formControlName="email" />
                <mat-error *ngIf="form.get('email')?.touched && form.get('email')?.invalid">Email inválido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>DNI</mat-label>
                <input matInput id="dni" type="text" formControlName="dni" />
                <mat-error *ngIf="form.get('dni')?.touched && form.get('dni')?.invalid">DNI debe tener 8 dígitos</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Celular</mat-label>
                <input matInput id="celular" type="text" formControlName="celular" />
                <mat-error *ngIf="form.get('celular')?.touched && form.get('celular')?.invalid">Celular debe tener 9 dígitos</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput id="password" type="password" formControlName="password" />
                <mat-error *ngIf="form.get('password')?.touched && form.get('password')?.invalid">Mínimo 8 caracteres</mat-error>
              </mat-form-field>

              <div class="actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Registrar</button>
                <button mat-stroked-button type="button" (click)="router.navigate(['/login'])">Ir a Login</button>
              </div>
            </form>
          </mat-card-content>

          <mat-divider></mat-divider>

          <mat-card-content *ngIf="error()">
            <div class="auth-message error">{{ error() }}</div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private session = inject(SessionService);
  private http = inject(HttpClient);
  public router = inject(Router);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    celular: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  error = signal<string | null>(null);
  
  private debugLogs: string[] = [];

  private addLog(msg: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${msg}`;
    this.debugLogs.push(logEntry);
    console.log(logEntry);
    
    // También guardar en sessionStorage para persistencia
    sessionStorage.setItem('registerDebugLogs', JSON.stringify(this.debugLogs));
  }

  async onSubmit() {
    this.error.set(null);
    this.debugLogs = [];
    sessionStorage.removeItem('registerDebugLogs');
    
    if (this.form.invalid) return;
    const { nombre, apellido, email, dni, celular, password } = this.form.value;
    if (!nombre || !apellido || !email || !dni || !celular || !password) {
      this.error.set('Todos los campos son requeridos');
      return;
    }
    
    try {
      // Step 1: Sign up in Supabase with metadata
      const metadata = { 
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        dni: String(dni).trim(),
        celular: String(celular).trim()
      };
      
      this.addLog(`Step 1: Signing up in Supabase with metadata: ${JSON.stringify(metadata)}`);
      const signUpResult = await this.auth.signUp(email, password, metadata);
      this.addLog(`Step 1 result: ${JSON.stringify(signUpResult)}`);

      // Step 2: Check if we got an access token
      const accessToken = (signUpResult as any)?.session?.access_token ?? null;
      if (!accessToken) {
        this.addLog(`⚠️ No access_token received (email confirmation likely required)`);
        this.error.set('✓ Registro recibido. Por favor confirma tu correo antes de continuar (revisa tu bandeja de entrada).');
        return;
      }

      this.addLog(`Step 2: Access token obtained, session stored`);

      // Step 3: Verify token is in localStorage (for interceptor to pick it up)
      const storedToken = this.session.getAccessToken();
      if (!storedToken) {
        this.addLog(`❌ ERROR: Token not stored in localStorage`);
        this.error.set('Error: No se pudo almacenar la sesión. Por favor, intenta de nuevo.');
        return;
      }

      this.addLog(`Step 3: Token verified in localStorage, proceeding to backend sync`);

      // Step 4: Call backend to sync profile
      const profileData = { 
        nombre, 
        apellido, 
        dni, 
        celular, 
        direccion: '' 
      };

      this.addLog(`Step 4: Calling backend /api/auth/register-profile with payload: ${JSON.stringify(profileData)}`);
      const resp = await this.http.post(
        `${environment.apiBaseUrl}/api/auth/register-profile`, 
        profileData
      ).toPromise();
      
      this.addLog(`✅ Step 4 success: Backend response: ${JSON.stringify(resp)}`);
      this.error.set(null);
      
      // Step 5: Redirect to home
      this.addLog(`Step 5: Registration complete, redirecting to home`);
      await this.router.navigateByUrl('/');
      
    } catch (err: any) {
      this.addLog(`❌ Error during registration: ${JSON.stringify({status: err?.status, message: err?.message, error: err?.error})}`);
      
      // Handle specific HTTP errors
      if (err?.status === 409) {
        this.error.set('❌ El email o DNI ya está registrado. Por favor usa otro.');
      } else if (err?.status === 401) {
        this.addLog(`Received 401, attempting to refresh token and retry...`);
        // Try to refresh and retry once
        try {
          await this.auth.refreshSessionIfNeeded();
          this.addLog(`Token refreshed, retrying backend call...`);
          
          const profileData = { 
            nombre, 
            apellido, 
            dni, 
            celular, 
            direccion: '' 
          };
          
          const resp = await this.http.post(
            `${environment.apiBaseUrl}/api/auth/register-profile`, 
            profileData
          ).toPromise();
          
          this.addLog(`✅ Retry succeeded: ${JSON.stringify(resp)}`);
          await this.router.navigateByUrl('/');
        } catch (retryErr: any) {
          this.addLog(`❌ Retry failed: ${JSON.stringify({status: retryErr?.status, message: retryErr?.message})}`);
          this.error.set('❌ Sesión expirada. Por favor, inicia sesión nuevamente.');
          
          // Mostrar logs antes de redirigir
          this.showDebugLogs();
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login');
          }, 3000);
        }
      } else if (err?.status === 400) {
        this.error.set(`❌ Error de validación: ${err?.error?.message ?? 'Verifica los datos ingresados'}`);
      } else if (err?.status === 0) {
        // Network error
        this.addLog(`Network error - server may be unavailable`);
        this.error.set('❌ Error de conexión. Verifica que el servidor está disponible.');
        this.showDebugLogs();
      } else {
        this.error.set(`❌ Error: ${err?.error?.message ?? err?.message ?? 'Error desconocido en el registro'}`);
        this.showDebugLogs();
      }
    }
  }

  private showDebugLogs() {
    const logsText = this.debugLogs.join('\n');
    alert(`📋 LOGS DE REGISTRO:\n\n${logsText}\n\nRevisa los logs de DevTools (F12 → Console) para más detalles.`);
  }
}


