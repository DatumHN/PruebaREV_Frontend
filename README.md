# Guía de Desarrollo – Proyecto MDF (Angular + Nx)

Este documento explica cómo configurar y trabajar en el monorepo MDF.

El objetivo es mantener código limpio, formateado, tipado y testeado, con reglas claras para los commits y CI/CD.

---

## 🚀 Preparación del entorno

1. Instalar versiones correctas:
   - Node.js 20+
   - npm 10+
   - VS Code con extensiones recomendadas:
     - ESLint
     - Prettier
     - Nx Console (opcional)

2. Clonar y preparar dependencias:
   ```bash
   git clone <repo>
   cd REVFA_FrontEnd
   npm ci
   ```

---

## 🎨 Estilo de código

Prettier

Se usa para formatear automáticamente.

- Ejecutar formateo manual:
  ```bash
      npm run format
  ```
- Validar formateo:
  ```bash
      npm run format:fix
  ```

ESLint

Verifica reglas de Angular + Nx.

- Lint de todos los proyectos:
  ```bash
      npm run lint
  ```
- Validar Formateo
  ```bash
      npm run lint
  ```

---

## 🔒 Validación en Git

### Husky + lint-staged

Ejecutan Prettier antes de cada commit.

- Nada especial que hacer → al hacer git commit se ejecuta automáticamente.

### Commitlint

Los mensajes de commit deben seguir Conventional Commits.

Ejemplos válidos:

- feat(auth): add login page

- fix(ui): correct button alignment

- chore: update dependencies

- Ejemplo inválido (rechazado por commitlint): arreglando bug de login

---

## 🧑‍💻 Tipos y código muerto

### TypeScript estricto

Está habilitado con strict: true.

1. Evitar any sin justificación → usar unknown, never o crear tipos.
2. Tipos Compartidos: Define todos los tipos y interfaces compartidos en una librería central. Por ejemplo, en libs/shared/types. Esto asegura que todos los microfrontends utilicen las mismas definiciones de datos, evitando errores de tipado en las comunicaciones.
3. Interfaz de Decoradores: Asegúrate de que tus componentes y servicios que usan decoradores (@Component, @Injectable) tengan una interfaz claramente definida para su interacción. Esto es clave para la comunicación entre MFE.
4. Tipos de Propiedades: Usa tipos explícitos para todas las propiedades de los componentes (@Input, @Output) para que los datos pasados entre microfrontends sean predecibles.

### ts-prune

Detecta exportaciones no usadas.

- Revisar código muerto:
  ```bash
  npm run dead-types
  ```
- En CI falla si encuentra problemas:
  ```bash
  npm run dead-types:ci
  ```
  Nota: ignora falsos positivos (configs, public-api, etc.). Si ves (used in module), quita el export.

---

## 🏗️ Dependencias y arquitectura

### Dependency Cruiser

Sirve para detectar dependencias circulares o violaciones de arquitectura.

- Generar reporte:
  ```bash
  npx depcruise apps libs --config .dependency-cruiser.js --output-type dot | dot -T svg > dependency-graph.svg
  ```
- Abrir dependency-graph.svg en un navegador.

---

## 🧪 Pruebas unitarias

## 🛡️ Validaciones Frontend

En los formularios dinámicos del sistema, los controles cuentan con las siguientes validaciones implementadas en el frontend:

- **Requerido:** Los campos pueden marcarse como obligatorios (`required: true`).
- **Longitud mínima/máxima:** Se define mediante las propiedades `minLength` y `maxLength`.
- **Patrón/regex:** Validación por expresión regular (`pattern`) o mediante máscaras (`mask`), por ejemplo para documentos nacionales.
- **Validaciones personalizadas:** Se pueden agregar funciones de validación específicas en la configuración del campo.
- **Validación en tiempo real:** Las máscaras aplican formato y validan el valor mientras el usuario escribe, mostrando retroalimentación inmediata.
- **Visual feedback:** Los campos inválidos se muestran con estilos de error (por ejemplo, borde rojo) y mensajes de ayuda contextual.
- **Validaciones condicionales:** Es posible definir reglas que dependen de otros campos o del estado del formulario.

Estas validaciones aseguran la integridad de los datos antes de enviarlos al backend y mejoran la experiencia del usuario.

### Framework

Usamos Jest con @testing-library/angular.

Comandos

- Correr tests de un proyecto:
  ```bash
  nx test <nombre-proyecto>
  ```
- Correr todos los tests:
  ```bash
  npm run test
  ```
- Ver cobertura:
  ```
  npm run coverage
  ```

Cobertura mínima
**El CI exige 70% en branches, funciones, líneas y statements.**

---

## 🔄 Flujo de trabajo

1. Crear rama a partir de develop:
   ```bash
   git checkout -b feat/<nombre>
   ```
2. Hacer cambios.

3. Verificar calidad antes de commit:

   ```bash
       npm run format:check
       npm run lint
       npm run test
       npm run dead-types
   ```

4. Commit con mensaje válido:
   ```bash
       git commit -m "feat(admin): add user form"
   ```
5. Push y crear Pull Request a develop.

---

## 📦 CI/CD (resumen)

Cada PR ejecuta automáticamente:

- npm run format:check

- npm run lint

- npm run test (solo proyectos afectados)

- npm run build

Si algo falla → no se puede mergear.

---

## 📚 Reglas básicas

- OnPush por defecto en componentes Angular.

- Evitar any. Usar tipos claros.
- No introducir dependencias cruzadas entre libs/\*.
  - Respetar naming:
  - Archivos → kebab-case
  - Componentes/Clases → PascalCase
  - Funciones/variables → camelCase

---

## 🔐 Authentication & Authorization

This project uses a shared authentication library (`auth-shared`) that integrates with Keycloak for user authentication and authorization.

### Core Services

#### AuthService

The main authentication service located in `auth-shared/src/lib/services/auth.service.ts`.

**Key Features:**

- JWT token management with automatic refresh
- Secure localStorage with encryption
- Reactive state management with RxJS
- Token expiration detection with configurable buffer

#### AuthStateService

Reactive state management service in `auth-shared/src/lib/providers/auth-state.service.ts`.

**Key Features:**

- Angular signals for reactive UI updates
- Computed signals for role-based logic
- Automatic state synchronization with AuthService

#### TokenStorageService

Secure token storage service in `auth-shared/src/lib/services/token-storage.service.ts`.

**Key Features:**

- Encrypted localStorage operations
- Data validation and error handling
- Session data management

### Basic Usage

#### 1. Login

```typescript
import { AuthStateService } from '@auth-shared/providers/auth-state.service';

constructor(private authState: AuthStateService) {}

async login(credentials: { username: string; password: string }) {
  try {
    await this.authState.login(credentials);
    // Navigation will be handled automatically
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

#### 2. Logout

```typescript
async logout() {
  try {
    await this.authState.logout();
    // Navigation to landing page is handled automatically
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

#### 3. Check Authentication Status

```typescript
// In component
import { AuthStateService } from '@auth-shared/providers/auth-state.service';

constructor(private authState: AuthStateService) {}

ngOnInit() {
  // Reactive authentication status
  effect(() => {
    const isAuthenticated = this.authState.isAuthenticated();
    const user = this.authState.user();
    const isLoading = this.authState.isLoading();

    if (isAuthenticated && user) {
      console.log('User authenticated:', user.username);
    }
  });
}
```

#### 4. Role-Based Access Control

```typescript
// Check if user has specific role
hasRole(role: string): boolean {
  return this.authState.hasRole(role);
}

// Check if user has any of the specified roles
hasAnyRole(roles: string[]): boolean {
  return this.authState.hasAnyRole(roles);
}

// In template
<button *ngIf="authState.hasRole('admin')">Admin Panel</button>
<button *ngIf="authState.hasAnyRole(['editor', 'admin'])">Edit Content</button>
```

### Token Management

#### Automatic Token Refresh

The system automatically refreshes tokens before they expire:

- **Token Lifetime**: 5 minutes (configured in Keycloak)
- **Refresh Buffer**: 1 minute before expiration
- **Close to Expiration Threshold**: 2 minutes

#### Manual Token Operations

```typescript
import { AuthStateService } from '@auth-shared/providers/auth-state.service';

constructor(private authState: AuthStateService) {}

// Check if token is expired
isTokenExpired(): boolean {
  return this.authState.isTokenExpired();
}

// Manual token refresh
refreshToken() {
  this.authState.refreshToken().subscribe({
    next: () => console.log('Token refreshed'),
    error: (error) => console.error('Refresh failed:', error)
  });
}
```

### Security Considerations

#### 1. Token Storage

- All tokens are encrypted in localStorage
- Sensitive data is validated before storage
- Automatic cleanup on logout or errors

#### 2. Error Handling

```typescript
// Auth errors are handled automatically
// Subscribe to error observables for custom handling
effect(() => {
  const error = this.authState.error();
  const logoutError = this.authState.logoutError();

  if (error) {
    // Handle authentication errors
    this.showErrorMessage(error);
  }

  if (logoutError) {
    // Handle logout errors
    this.showErrorMessage(logoutError);
  }
});
```

#### 3. Session Persistence

- Authentication state persists across browser sessions
- Automatic token validation on app initialization
- Graceful handling of corrupted or expired stored data

### Configuration

#### AuthConfig

Located in `auth-shared/src/lib/config/auth.config.ts`:

```typescript
export interface AuthConfig {
  apiUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  logoutEndpoint: string;
  storageKeys: {
    accessToken: string;
    refreshToken: string;
    user: string;
    session: string;
  };
  tokenRefreshBuffer: number; // minutes
  encryptionEnabled: boolean;
}
```

#### Keycloak Integration

- **Server**: http://localhost:8085/api/v1
- **Token Lifetime**: 5 minutes
- **Supported Grant Types**: password, refresh_token

### Common Patterns

#### Protected Routes

```typescript
// In routing module
import { AuthGuard } from '@auth-shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
];
```

#### Loading States

```typescript
// Show loading indicators during auth operations
<div *ngIf="authState.isLoading()">
  <mat-spinner></mat-spinner>
  Authenticating...
</div>
```

#### Error Display

```typescript
// Display authentication errors
<div *ngIf="authState.error()" class="error-message">
  {{ authState.error() }}
</div>
```

### Troubleshooting

#### Common Issues

1. **Token expires immediately**
   - Check Keycloak token lifetime configuration
   - Verify system clock synchronization
   - Ensure refresh buffer is appropriate for token lifetime

2. **Authentication lost on page reload**
   - Verify localStorage is not being cleared
   - Check for encryption/decryption errors
   - Ensure token validation is working correctly

3. **Role-based permissions not working**
   - Verify user roles in Keycloak
   - Check role names match exactly
   - Ensure AuthGuard is properly configured

#### Debug Information

```typescript
// Get detailed auth state for debugging
getDebugInfo() {
  return {
    isAuthenticated: this.authState.isAuthenticated(),
    user: this.authState.user(),
    session: this.authState.session(),
    tokenExpired: this.authState.isTokenExpired(),
    userRoles: this.authState.userRoles()
  };
}
```

### Best Practices

1. **Always check authentication status reactively** using signals
2. **Handle errors gracefully** with proper user feedback
3. **Use role-based guards** for route protection
4. **Validate tokens** before making API calls
5. **Clear sensitive data** on logout
6. **Test authentication flows** thoroughly
7. **Monitor token expiration** in production
8. **Use HTTPS** in production environments

---

## 📝 Cheatsheet rápido

| Acción             | Comando                                                                                                   |
| :----------------- | :-------------------------------------------------------------------------------------------------------- |
| Instalar deps      | `npm ci`                                                                                                  |
| Formatear código   | `npm run format`                                                                                          |
| Lint               | `npm run lint`                                                                                            |
| Tests              | `npm run test`                                                                                            |
| Cobertura          | `npm run coverage`                                                                                        |
| Tipos muertos      | `npm run dead-types`                                                                                      |
| Grafo dependencias | `npx depcruise apps libs --config .dependency-cruiser.js --output-type dot \| dot -T svg > dep-graph.svg` |
| Crear rama         | `git checkout -b feat/<nombre>`                                                                           |
| Commit válido      | `git commit -m "feat(auth): add login form"`                                                              |
