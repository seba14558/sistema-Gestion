# Sistema de Gestión

Sistema web de gestión con React (frontend) y Express/Prisma (backend).

## Requisitos previos

- Node.js (v18 o superior)
- npm

## Instalación

1. Clonar el repositorio
2. Instalar dependencias en todos los directorios:
```bash
npm run install:all
```

O instalar manualmente:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

## Configuración

1. Copiar el archivo de ejemplo de variables de entorno:
```bash
cp server/.env.example server/.env
```

2. Configurar las variables de entorno en `server/.env` según necesidad:
```
PORT=3001
JWT_SECRET=tu-clave-secreta-aqui
```

## Base de datos

El proyecto usa SQLite con Prisma. Para configurar la base de datos:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

## Ejecución

Para ejecutar tanto el frontend como el backend simultáneamente:

```bash
npm run dev
```

O ejecutar por separado:

**Frontend (React + Vite):**
```bash
cd client
npm run dev
```
Abre http://localhost:5173

**Backend (Express):**
```bash
cd server
npm run dev
```
Corre en http://localhost:3001

## Estructura del proyecto

```
sistema-web/
├── client/          # Frontend React + Vite
├── server/          # Backend Express + Prisma
└── package.json     # Scripts para ejecutar ambos
```

## Tecnologías

- **Frontend:** React, TypeScript, Vite, TailwindCSS, React Router, Axios
- **Backend:** Express, TypeScript, Prisma, SQLite
- **Autenticación:** JWT

Para levantar el proyecto en otra PC:

Clonar el repositorio
Ejecutar npm run install:all
Copiar server/.env.example a [d:/SEBA/Escritorio/sistema web/server/.env](cci:4://file://d:/SEBA/Escritorio/sistema web/server/.env:0:0-0:0)
Ejecutar cd server && npm run prisma:migrate
Ejecutar npm run dev