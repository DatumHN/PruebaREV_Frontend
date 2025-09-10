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

### 📝 Cheatsheet rápido

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
