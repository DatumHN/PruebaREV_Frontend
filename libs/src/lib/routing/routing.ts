import { Route } from '@angular/router';

export function getLandingRoutes(): Route[] {
  return [
    {
      path: 'landing',
      loadChildren: () => import('landing/Routes').then((m) => m?.remoteRoutes),
    },
  ];
}

export function getRegistryRoutes(): Route[] {
  return [
    {
      path: 'registry',
      loadChildren: () =>
        import('registry/Routes').then((m) => m?.remoteRoutes),
    },
  ];
}

export function getAllRemoteRoutes(): Route[] {
  return [...getLandingRoutes(), ...getRegistryRoutes()];
}
