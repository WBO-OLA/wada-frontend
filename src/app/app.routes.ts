import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard-module').then(m => m.DashboardModule)
      },
      {
        path: 'personnel',
        loadChildren: () =>
          import('./features/personnel/personnel-module').then(m => m.PersonnelModule)
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./features/inventory/inventory-module').then(m => m.InventoryModule)
      },
      {
        path: 'finance',
        loadChildren: () =>
          import('./features/finance/finance-module').then(m => m.FinanceModule)
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports-module').then(m => m.ReportsModule)
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin-module').then(m => m.AdminModule)
      }
    ]
  }
];
