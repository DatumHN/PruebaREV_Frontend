import {
  getAllRemoteRoutes,
  getLandingRoutes,
  getRegistryRoutes,
} from './routing';

describe('Routing Functions', () => {
  it('should return landing routes', () => {
    const routes = getLandingRoutes();
    expect(routes).toBeDefined();
    expect(routes.length).toBe(1);
    expect(routes[0].path).toBe('landing');
  });

  it('should return registry routes', () => {
    const routes = getRegistryRoutes();
    expect(routes).toBeDefined();
    expect(routes.length).toBe(1);
    expect(routes[0].path).toBe('registry');
  });

  it('should return all remote routes', () => {
    const routes = getAllRemoteRoutes();
    expect(routes).toBeDefined();
    expect(routes.length).toBe(2);
    expect(routes[0].path).toBe('landing');
    expect(routes[1].path).toBe('registry');
  });
});
