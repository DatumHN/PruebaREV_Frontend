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
      route: '/inicio/registry/form/2',
      icon: Users,
      description: 'Iniciar solicitud de registro de matrimonio',
    },
    {
      id: 'union-no-matrimonial',
      title: 'Registro de Unión No Matrimonial',
      route: '/inicio/registry/form/3',
      icon: Users,
      description: 'Iniciar solicitud de unión no matrimonial',
    },
    {
      id: 'certificaciones',
      title: 'Certificaciones y autenticas',
      route: '/inicio/registry/form/4',
      icon: FileCheck,
      description: 'Solicitar certificaciones y auténticas',
    },
    {
      id: 'defuncion',
      title: 'Registro de Defunción',
      route: '/inicio/registry/form/5',
      icon: Clipboard,
      description: 'Iniciar solicitud de registro de defunción',
    },
    {
      id: 'nacionalizacion',
      title: 'Registro de Nacionalización o Naturalización',
      route: '/inicio/registry/form/6',
      icon: BookOpen,
      description: 'Iniciar solicitud de nacionalización',
    },
    {
      id: 'defunciones-fetales',
      title: 'Registro Defunciones Fetales',
      route: '/inicio/registry/form/7',
      icon: FileText,
      description: 'Iniciar solicitud de defunciones fetales',
    },
    {
      id: 'marginaciones',
      title: 'Registro de Marginaciones',
      route: '/inicio/registry/form/8',
      icon: FileText,
      description: 'Iniciar solicitud de marginaciones',
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
