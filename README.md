# Kairos - Sistema de Turnos

Kairos es un sistema web adaptable para la gestión eficiente de turnos en cualquier institución o empresa que preste servicios. Brinda administración centralizada y una experiencia moderna, facilitando la solicitud, visualización y avance de turnos en tiempo real.

![Logo de Kairos](https://github.com/Fra46/KairosPWA/blob/master/LogoKairos.jpg)

## 🚀 Características

- **Gestión de Turnos**: Creación, consulta, avance y administración de turnos en tiempo real para servicios o departamentos.
- **Gestión de Usuarios**: Registro y administración de clientes y personal con roles definidos.
- **Gestión de Servicios**: Operaciones CRUD para servicios adaptables a cualquier sector (salud, educación, comercio, etc.).
- **Control de Roles y Permisos**: Validación y autorización basada en roles usando JSON Web Tokens (JWT).
- **API segura**: Autenticación por JWT con generación de tokens y validación en backend.
- **Backend modular**: Servicios especializados para Usuarios, Roles, Servicios y Turnos.
- **Interoperabilidad PWA**: Backend preparado para consumir desde aplicaciones web progresivas (PWA).

## 🛠️ Tecnologías

### Backend
- ASP.NET Core 8.0 Web API
- Entity Framework Core
- SQL Server
- JWT para autenticación
- CORS habilitado

### Frontend
- React 18 (en desarrollo separado)
- Vite
- React Router DOM
- Axios
- Bootstrap 5

## 📋 Requisitos Previos

- .NET 8.0 SDK instalado
- SQL Server (LocalDB o instancia completa)
- Node.js 18+ y npmNode.js 18+ y npm
- Visual Studio 2022 y VS Code

## 🔧 Instalación y Configuración del Backend

1. Clonar el repositorio backend:
```bash
git clone https://github.com/Fra46/KairosWebAPI
```

2. Restaurar dependencias .NET:


```bash
dotnet restore
```

3. Configurar la cadena de conexión en `appsettings.json` (ya configurado por defecto):


```json
{
  "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=KairosDB;Trusted_Connection=True;"
  },
  "JwtSettings": {
    "Key": "tu_clave_secreta_para_jwt",
    "Issuer": "tu_emisor",
    "Audience": "tu_audiencia",
    "DurationInMinutes": "60"
  }
}

```

4. Crear migraciones y actualizar base de datos:


```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

5. Ejecutar la API:


```bash
dotnet run o Click en http:// (KairosPWA)
```

El backend estará disponible en `https://localhost:7299`

## Estructura del Backend

```plaintext
KairosPWA/
├── Controllers/       # Controladores API REST
├── Data/              # Contexto de base de datos
├── DTOs/              # Objetos de transferencia de datos
├── JWT/               # Generación de tokens JWT
├── MappingProfiles/   # Mappeo AutoMapper entre entidad y DTO
├── Models/            # Entidades de base de datos
├── Services/          # Lógica de negocio modularizada
├── Migrations/        # Migraciones EF Core
├── Program.cs         # Configuración de servicios y pipeline
```


## 🔧 Instalación y Configuración del Frontend

1. Clona este repositorio:


```bash
git clone https://github.com/Fra46/KairosPWA
```

2. Instala las dependencias:


```bash
npm install react-router-dom axios bootstrap
npm install
```

3. Configura el proxy en `vite.config.js` (ya configurado por defecto):


```javascript
proxy: {
  '/api': {
    target: 'https://localhost:7299',
    changeOrigin: true,
    secure: false
  }
}
```

4. Ejecuta el frontend:


```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Estructura del Frontend

```plaintext
kairos-frontend/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   └── TurnoCard.jsx
│   ├── pages/           # Páginas/Vistas
│   │   ├── Home.jsx
│   │   ├── SolicitarTurno.jsx
│   │   ├── PanelAdmin.jsx
│   │   ├── Servicios.jsx
│   │   └── Usuarios.jsx
│   ├── services/        # Servicios API
│   │   ├── api.js
│   │   ├── turnoService.js
│   │   ├── servicioService.js
│   │   └── usuarioService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── vite.config.js
└── package.json
```

## Uso

1. **Crear Usuarios**: Accede a la sección "Usuarios" para registrar clientes
2. **Crear Servicios**: En "Servicios" puedes agregar los servicios disponibles (comedor, atencion, etc.)
3. **Solicitar Turno**: Los usuarios pueden solicitar turnos seleccionando un servicio
4. **Panel Admin**: Los administradores pueden ver y avanzar los turnos en tiempo real
5. **Visualización**: La página de inicio muestra el turno actual en pantalla grande


## API Endpoints

### Turnos

- `GET /api/Turnos`: Obtener todos los turnos
- `GET /api/Turnos/pendientes`: Obtener turnos pendientes
- `GET /api/Turnos/actual`: Obtener turno actual
- `POST /api/Turnos`: Crear nuevo turno
- `POST /api/Turnos/siguiente`: Avanzar al siguiente turno


### Servicios

- `GET /api/Servicios`: Obtener todos los servicios
- `POST /api/Servicios`: Crear servicio
- `PUT /api/Servicios/{id}`: Actualizar servicio
- `DELETE /api/Servicios/{id}`: Eliminar servicio


### Usuarios

- `GET /api/Usuarios`: Obtener todos los usuarios
- `POST /api/Usuarios`: Crear usuario
- `PUT /api/Usuarios/{id}`: Actualizar usuario
- `DELETE /api/Usuarios/{id}`: Eliminar usuario


### Autenticación
- `POST /api/Users/Login`: Login usuario, retorno token JWT.


### Seguridad
- Validación de roles y permisos usando JWT y middleware/autorización estándar ASP.NET Core.
- Protección de endpoints con atributos `[Authorize]` y validación de roles por claim.


## Autores

Andres Zapata
- GitHub: [@Fra46](https://github.com/Fra46)

Maira Torres
- GitHub: [@22MAT11](https://github.com/22MAT11)
