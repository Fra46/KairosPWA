# Kairos

![Status](https://img.shields.io/badge/status-development-orange.svg)
![.NET 8](https://img.shields.io/badge/.NET-8.0-blue.svg)
![React 18](https://img.shields.io/badge/React-18.0-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-4.0-646CFF.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Introducción

Kairos es una solución de gestión de turnos pensada para instituciones y empresas que necesitan administrar servicios, usuarios y turnos de manera centralizada y con soporte en tiempo real. El proyecto incluye un backend en ASP.NET Core y un frontend en React + Vite.

## 📌 Tabla de contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [API principal](#-api-principal)
- [Pruebas](#-pruebas)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

- Gestión de turnos: creación, consulta, avance y estado.
- Gestión de usuarios con roles y permisos.
- CRUD de servicios para atención por departamento.
- Middleware de autenticación y autorización JWT.
- Interacción entre frontend y backend a través de endpoints REST.
- Preparado para consumo por aplicaciones PWA.

## 🛠️ Tecnologías

### Backend

- ASP.NET Core 8
- Entity Framework Core
- SQL Server / LocalDB
- JWT para autenticación
- C# y arquitectura basada en servicios

### Frontend

- React 18
- Vite
- React Router DOM
- Axios
- Bootstrap 5

## 📁 Estructura del repositorio

- `KairosPWA/` - Backend ASP.NET Core
- `KairosFrontend/` - Frontend React + Vite
- `KairosPWA.Tests/` - Pruebas unitarias del backend

## ⚙️ Instalación y ejecución

### Requisitos

- .NET 8.0 SDK
- SQL Server (LocalDB o instancia completa)
- Node.js 18+ y npm
- Visual Studio 2022 o VS Code

### 1. Configurar y ejecutar el backend

1. Abrir la carpeta `KairosPWA`.
2. Restaurar dependencias:
   ```bash
   dotnet restore
   ```
3. Actualizar la base de datos con las migraciones existentes:
   ```bash
   dotnet ef database update
   ```
4. Ejecutar la API:
   ```bash
   dotnet run
   ```

La API estará disponible en `https://localhost:7299`.

> Ajusta la cadena de conexión en `appsettings.json` si usas una instancia de SQL Server distinta.

### 2. Configurar y ejecutar el frontend

1. Abrir la carpeta `KairosFrontend`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

El frontend se ejecutará en el puerto que asigne Vite, por ejemplo `http://localhost:3000`.

## 🌐 API principal

### Turnos

- `GET /api/Turnos` - Obtener todos los turnos
- `GET /api/Turnos/pendientes` - Obtener turnos pendientes
- `GET /api/Turnos/actual` - Obtener turno actual
- `POST /api/Turnos` - Crear nuevo turno
- `POST /api/Turnos/siguiente` - Avanzar al siguiente turno

### Servicios

- `GET /api/Servicios` - Obtener todos los servicios
- `POST /api/Servicios` - Crear servicio
- `PUT /api/Servicios/{id}` - Actualizar servicio
- `DELETE /api/Servicios/{id}` - Eliminar servicio

### Usuarios

- `GET /api/Usuarios` - Obtener todos los usuarios
- `POST /api/Usuarios` - Crear usuario
- `PUT /api/Usuarios/{id}` - Actualizar usuario
- `DELETE /api/Usuarios/{id}` - Eliminar usuario

### Autenticación

- `POST /api/Users/Login` - Iniciar sesión y obtener token JWT

## 🧪 Pruebas

Para ejecutar las pruebas del backend:

```bash
cd KairosPWA.Tests
dotnet test
```

## 🤝 Contribuir

1. Crear un fork del repositorio.
2. Crear una rama para tu cambio: `git checkout -b feature/nueva-funcionalidad`.
3. Hacer commit de tus cambios.
4. Abrir un pull request.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👥 Autores

- Andres Zapata - [@Fra46](https://github.com/Fra46)
- Maira Torres - [@22MAT11](https://github.com/22MAT11)
