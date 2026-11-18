# Encontrame

Encontrame es una aplicación para ayudar a reunir mascotas perdidas con sus familias mediante chapitas con QR o NFC. El frontend consume una API REST desarrollada con FastAPI.

## Ejecución local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Inicia la aplicación con cualquiera de estos comandos:

   ```bash
   npm run dev
   ```

   o bien:

   ```bash
   npm start
   ```

## Flujo de trabajo (GitFlow)

Desde la versión 1.0 trabajamos con GitFlow:

- `main`: versión publicada. Solo recibe cambios desde `release/*` y `hotfix/*`.
- `develop`: integración de las funcionalidades terminadas.
- `feature/*`: una rama por tarea, creada desde `develop`. Se integra con un Pull Request.
- `release/*`: preparación de una versión. Se integra a `main` y a `develop`.
- `hotfix/*`: correcciones urgentes, creadas desde `main`.

Las tareas se organizan en un tablero Kanban en GitHub Projects, con un issue por tarea.

## Integrantes

- Jeremias Gonzalez
- Esteban Malpassi
- Marcos Olguin
