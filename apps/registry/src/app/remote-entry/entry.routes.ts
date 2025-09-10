import { Route } from '@angular/router';

import { DialogService } from 'primeng/dynamicdialog';

import { RegistryApprove } from '../components/registry-approve/registry-approve';
import { RegistryForm } from '../components/registry-form/registry-form';
import { RegistryWelcome } from '../components/registry-welcome/registry-welcome';
import { Api } from '../services/api/api';
import { Logo } from '../services/logo/logo';
import { PdfService } from '../services/pdf-service/pdf-service';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,

    providers: [Api, PdfService, Logo, DialogService],

    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'welcome',
      },
      {
        path: 'welcome',
        component: RegistryWelcome,
      },
      {
        path: 'form',
        pathMatch: 'full',
        redirectTo: 'welcome',
      },
      {
        path: 'form/:id',
        component: RegistryForm,
      },
      {
        path: 'approve/:id/:idtipodoc',
        component: RegistryApprove,
      },
    ],
  },
];
