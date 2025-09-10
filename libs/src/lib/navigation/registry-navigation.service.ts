import { Injectable } from '@angular/core';
import {
  FileText,
  Users,
  FileCheck,
  Clipboard,
  BookOpen,
} from 'lucide-angular';

export interface RegistryMenuItem {
  id: string;
  title: string;
  route: string;
  icon: any;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegistryNavigationService {
  private readonly registryMenuItems: RegistryMenuItem[] = [
    {
      id: 'nacimiento',
      title: 'Registro de nacimiento',
      route: '/inicio/registry/form/1',
      icon: FileText,
      description: 'Iniciar solicitud de registro de nacimiento',
    },
    {
      id: 'matrimonio',
      title: 'Registro de Matrimonio',
      route: '/inicio/registry/form/86',
      icon: Users,
      description: 'Iniciar solicitud de registro de matrimonio',
    },
    {
      id: 'union-no-matrimonial',
      title: 'Registro de Unión No Matrimonial',
      route: '/inicio/registry/form/109',
      icon: Users,
      description: 'Iniciar solicitud de unión no matrimonial',
    },
    {
      id: 'certificaciones',
      title: 'Certificaciones y autenticas',
      route: '/inicio/certiAutenticas',
      icon: FileCheck,
      description: 'Certificaciones y documentos auténticos',
    },
    {
      id: 'defuncion',
      title: 'Registro de Defunción',
      route: '/inicio/registry/form/147',
      icon: Clipboard,
      description: 'Iniciar solicitud de registro de defunción',
    },
    {
      id: 'nacionalizacion',
      title: 'Registro de Nacionalización o Naturalización',
      route: '/inicio/nacionalizados',
      icon: BookOpen,
      description: 'Registro de nacionalización o naturalización',
    },
    {
      id: 'defunciones-fetales',
      title: 'Registro Defunciones Fetales',
      route: '/inicio/defunfetales',
      icon: FileText,
      description: 'Iniciar solicitud de defunciones fetales',
    },
    {
      id: 'marginaciones',
      title: 'Registro de Marginaciones',
      route: '/inicio/marginaciones',
      icon: FileText,
      description: 'Registro de marginaciones',
    },
  ];

  getRegistryMenuItems(): RegistryMenuItem[] {
    return this.registryMenuItems;
  }

  getMenuItemById(id: string): RegistryMenuItem | undefined {
    return this.registryMenuItems.find((item) => item.id === id);
  }

  getMenuItemByRoute(route: string): RegistryMenuItem | undefined {
    return this.registryMenuItems.find((item) => item.route === route);
  }
}
