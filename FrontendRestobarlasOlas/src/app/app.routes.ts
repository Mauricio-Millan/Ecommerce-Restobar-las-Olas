import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { HomePageComponent } from './features/home/pages/home-page.component';
import { adminGuard } from './core/auth/admin.guard';

const adminRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/pages/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
  }
];

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  ...adminRoutes,
  ...authRoutes,
];
