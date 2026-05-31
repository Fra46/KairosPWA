import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import ProtectedRoute from './components/protectedRoute';

// Vistas cliente
import Home from './clientsViews/home';
import IngresarDocumento from './clientsViews/ingresarDocumento';
import RegistroCliente from './clientsViews/registroCliente';
import SeleccionarServicio from './clientsViews/seleccionarServicio';
import ConfirmacionTurno from './clientsViews/confirmacionTurno';
import TurnoDetalle from './clientsViews/turnoDetalle';
import Display from './clientsViews/display';
import PoliticaDatos from './clientsViews/politicaDatos';

// Vistas de personal
import Login from './views/login';
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
            <Route path="/politica-datos" element={<PoliticaDatos />} />
            <Route path="/seleccionar-servicio" element={<SeleccionarServicio />} />
            <Route path="/confirmacion-turno" element={<ConfirmacionTurno />} />
            <Route path="/turno-detalle" element={<TurnoDetalle />} />
            <Route path="/pantalla" element={<Navigate to="/pantalla/atencion" replace />} />
            <Route path="/pantalla/atencion" element={<Display mode="atencion" />} />
            <Route path="/pantalla/proximos" element={<Display mode="proximos" />} />

            {/* Flujo kiosko (tablet/pantalla) */}
            <Route path="/kiosko" element={<Navigate to="/kiosko/home" replace />} />
            <Route path="/kiosko/home" element={<Home />} />
            <Route path="/kiosko/ingresar-documento" element={<IngresarDocumento />} />
            <Route path="/kiosko/registro-cliente" element={<RegistroCliente />} />
            <Route path="/kiosko/seleccionar-servicio" element={<SeleccionarServicio />} />
            <Route path="/kiosko/confirmacion-turno" element={<ConfirmacionTurno />} />

            {/* Acceso personal */}
            <Route path="/login" element={<Login />} />

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
          &copy; {new Date().getFullYear()} Kairos Banco - Sistema de Gestión de Turnos para Banco
        </div>
      </footer>
    </div>
  );
}

export default App;
