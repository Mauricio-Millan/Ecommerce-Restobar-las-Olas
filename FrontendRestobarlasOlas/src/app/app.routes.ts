import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { adminGuard } from './core/auth/admin.guard';
import { MainLayoutComponent } from './core/layout/main-layout.component';

const adminRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./core/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/pages/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
      },
      {
        path: 'platos',
        loadComponent: () => import('./features/admin/pages/platos-admin.component').then((m) => m.PlatosAdminComponent)
      },
      {
        path: 'agregados',
        loadComponent: () => import('./features/admin/pages/agregados-admin.component').then((m) => m.AgregadosAdminComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/pages/usuarios-admin.component').then((m) => m.UsuariosAdminComponent)
      }
    ]
  }
];

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/pages/home-page.component').then((m) => m.HomePageComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/menu/pages/menu-page.component').then((m) => m.MenuPageComponent)
      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/cart/pages/cart-page.component').then((m) => m.CartPageComponent)
      }
    ]
  },
  ...adminRoutes,
  ...authRoutes,
];
