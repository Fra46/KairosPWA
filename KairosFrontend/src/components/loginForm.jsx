import React, { useState } from 'react';
import axios from 'axios';

const API_URL = "https://localhost:7142/api/login";

function LoginForm() {
  const [credenciales, setCredenciales] = useState({ username: '', password: '' });
  const [user, setUser] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setCredenciales(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, credenciales);
      const data = response.data;
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("username", data.user.username);
      setUser(data.user.username);
      setCredenciales({ username: '', password: '' });
      // Aquí navegas al dashboard con React Router según tu app
    } catch (error) {
      alert(error.response?.data?.message || "Credenciales incorrectas");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inicio de sesión</h2>
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
          <button type="submit">Iniciar sesión</button>
        </>
      )}
      {user && <p>Sesión activa como <strong>{user}</strong></p>}
    </form>
  );
}

export default LoginForm;
