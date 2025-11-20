import { Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/registro">
          Kairos - Sistema de Turnos
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/registro">Registrarse</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">Inciar Sesion</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/turnos">Solicitar Turno</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/pantalla">Pantalla</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/empleado">Empleado</Link>
            </li>
            <li className="nav-item dropdown">
              <button className="nav-link dropdown-toggle btn btn-link" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Administración
              </button>
            <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to="/admin">Panel Admin</Link></li>
                <li><Link className="dropdown-item" to="/admin/servicios">Servicios</Link></li>
                <li><Link className="dropdown-item" to="/admin/usuarios">Usuarios</Link></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;