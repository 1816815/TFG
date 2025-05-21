import React, { useState, useContext } from 'react';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const { login, register } = useAuth();
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rol: ''
  });


  const toggleMode = () => {
    setIsRegistered(!isRegistered);
    setMessage('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    isRegistered ? await register(formData) : await login(formData);
  };

  return (
    <div className="auth-form">
      <h2>{isRegistered ? 'Registro' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {isRegistered && (
          <>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </>
        )}
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {isRegistered ? 'Registrarse' : 'Iniciar sesión'}
        </button>
      </form>
      <p style={{ marginTop: '10px' }}>{message}</p>
      <button onClick={toggleMode}>
        Cambiar a {isRegistered ? 'Login' : 'Registro'}
      </button>
    </div>
  );
};

export default Login;
