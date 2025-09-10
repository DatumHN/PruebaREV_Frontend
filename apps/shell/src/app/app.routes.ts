import { Route } from '@angular/router';

import { getLandingRoutes, getRegistryRoutes } from '@revfa/routing-functions';

import { ApproveTable } from './components/approve-table/approve-table';
import { InicioLayoutComponent } from './inicio-layout/inicio-layout.component';
import { authGuard, roleGuard } from '@revfa/auth-shared';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const appRoutes: Route[] = [
  ...getLandingRoutes(),
  {
    path: 'inicio',
    component: InicioLayoutComponent,
    canActivate: [authGuard],
    children: [
      ...getRegistryRoutes(),
      {
        path: 'approve-table',
        component: ApproveTable,
      },
      {
        path: 'Principal',
        component: ApproveTable,
      },
      {
        path: 'registros',
        redirectTo: 'registry',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'registry',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'config',
    component: InicioLayoutComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard],
    data: {
      roles: [
        'admin',
        'administrador-rnpn',
        'registrador-sistema',
        'administrador-catalogos',
        'admin-log-npe',
      ],
    },
    children: [
      {
        path: 'principal',
        loadComponent: () =>
          import('./components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent,
          ),
        canMatch: [roleGuard],
        data: {
          roles: [
            'admin',
            'administrador-rnpn',
            'registrador-sistema',
            'admin-log-npe',
          ],
        },
      },
      {
        path: 'plantillas',
        loadComponent: () =>
          import('./components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent,
          ),
        canMatch: [roleGuard],
        data: {
          roles: [
            'admin',
            'administrador-rnpn',
            'registrador-sistema',
            'admin-log-npe',
          ],
        },
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent,
          ),
        canMatch: [roleGuard],
        data: {
          roles: ['admin', 'administrador-catalogos'],
        },
      },
      {
        path: 'mantenimiento-formularios',
        loadComponent: () =>
          import('./components/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent,
          ),
        canMatch: [roleGuard],
        data: {
          roles: [
            'admin',
            'administrador-rnpn',
            'registrador-sistema',
            'admin-log-npe',
          ],
        },
      },
      {
        path: '',
        redirectTo: 'principal',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
