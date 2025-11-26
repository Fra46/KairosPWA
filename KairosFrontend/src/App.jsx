import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import ProtectedRoute from './components/protectedRoute';

// Vistas cliente
import Home from './clientsViews/home';
import IngresarDocumento from './clientsViews/ingresarDocumento';
import RegistroCliente from './clientsViews/registroCliente';
import SeleccionarServicio from './clientsViews/seleccionarServicio';
import ConfirmacionTurno from './clientsViews/confirmacionTurno';
import Display from './clientsViews/display';

// Vistas de personal
import Login from './views/login';
import Recover from './views/recover';
import RegistroStaff from './staffViews/registroStaff';
import ListarUsuarios from './staffViews/listarUsuarios';
import AdminServices from './staffViews/adminServices';
import EmpleadoNextTurn from './staffViews/empleadoNextTurn';
import EmpleadoClientes from './staffViews/empleadoClientes';

import './App.css';

function App() {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <div className="container-fluid">
          <Routes>
            {/* Flujo público */}
            <Route path="/" element={<Home />} />
            <Route path="/ingresar-documento" element={<IngresarDocumento />} />
            <Route path="/registro-cliente" element={<RegistroCliente />} />
            <Route path="/seleccionar-servicio" element={<SeleccionarServicio />} />
            <Route path="/confirmacion-turno" element={<ConfirmacionTurno />} />
            <Route path="/pantalla" element={<Display />} />

            {/* Acceso personal */}
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar" element={<Recover />} />

            {/* SOLO ADMIN — Registro de nuevos empleados/usuarios */}
            <Route
              path="/registro"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <RegistroStaff />
                </ProtectedRoute>
              }
            />

            {/* SOLO ADMIN — Gestión de usuarios */}
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <ListarUsuarios />
                </ProtectedRoute>
              }
            />

            {/* SOLO ADMIN — Gestión de servicios */}
            <Route
              path="/admin/servicios"
              element={
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <AdminServices />
                </ProtectedRoute>
              }
            />

            {/* EMPLEADO + ADMIN — Siguiente turno */}
            <Route
              path="/empleado/siguiente-turno"
              element={
                <ProtectedRoute allowedRoles={["Administrador", "Empleado"]}>
                  <EmpleadoNextTurn />
                </ProtectedRoute>
              }
            />

            {/* EMPLEADO + ADMIN — Consultar cliente */}
            <Route
              path="/empleado/clientes"
              element={
                <ProtectedRoute allowedRoles={["Administrador", "Empleado"]}>
                  <EmpleadoClientes />
                </ProtectedRoute>
              }
            />

            {/* Cualquier otra ruta → Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <footer className="bg-dark text-light py-3 mt-auto">
        <div className="container small text-center">
          &copy; {new Date().getFullYear()} Kairos - Sistema de Gestion de Turnos
        </div>
      </footer>
    </div>
  );
}

export default App;
