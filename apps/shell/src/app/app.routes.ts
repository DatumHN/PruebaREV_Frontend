import { Route } from '@angular/router';

import { InicioLayoutComponent } from './inicio-layout/inicio-layout.component';
import { NxWelcome } from './nx-welcome';
import { ApproveTable } from './components/approve-table/approve-table';

export const appRoutes: Route[] = [
  {
    path: 'admin',
    loadChildren: () => import('admin/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('auth/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'landing',
    loadChildren: () => import('landing/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'inicio',
    component: InicioLayoutComponent,
    children: [
      {
        path: 'registry',
        loadChildren: () =>
          import('registry/Routes').then((m) => m!.remoteRoutes),
      },
      {
        path: 'approve-table',
        component: ApproveTable
      },
      {
        path: '',
        redirectTo: 'registry',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full',
  },
];
