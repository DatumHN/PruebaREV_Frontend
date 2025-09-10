import { Route } from '@angular/router';
import { Api } from '../services/api/api';
import { PdfService } from '../services/pdf-service/pdf-service';
import { Logo } from '../services/logo/logo';
import { RemoteEntry } from './entry';
import { RegistryWelcome } from '../components/registry-welcome/registry-welcome';
import { RegistryForm } from '../components/registry-form/registry-form';
import { DialogService } from 'primeng/dynamicdialog';
import { RegistryApprove } from '../components/registry-approve/registry-approve';

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
        path: 'approve/:id',
        component: RegistryApprove,
      },
    ],
  },
];
