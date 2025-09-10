// (Opcional) Testing Library
import '@testing-library/jest-dom';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// opcional si tus tests usan alert:
Object.defineProperty(window, 'alert', { value: jest.fn(), writable: true });
