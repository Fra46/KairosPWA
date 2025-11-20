import React, { useState } from 'react';
import { userService } from '../services/userService';

function LoginForm() {
  const [credenciales, setCredenciales] = useState({ name: '', password: '' });
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setCredenciales(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const data = await userService.Login(credenciales);
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("name", data.user.name);
      setUser(data.user.name);
      setCredenciales({ name: '', password: '' });

    } catch (err) {
      setError(err.response?.data?.message || "Credenciales incorrectas");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inicio de sesión</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!user && (
        <>
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={credenciales.username}
            onChange={handleChange}
          /><br />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={credenciales.password}
            onChange={handleChange}
          /><br />
          <button type="submit">Iniciar sesion</button>
        </>
      )}
      {user && <p>Sesion activa como <strong>{user}</strong></p>}
    </form>
  );
}

export default LoginForm;
