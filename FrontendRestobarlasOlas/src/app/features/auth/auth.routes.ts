import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page.component';

export const authRoutes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'recuperar-password', component: ForgotPasswordPageComponent },
  { path: 'restablecer-password', component: ResetPasswordPageComponent }
];

