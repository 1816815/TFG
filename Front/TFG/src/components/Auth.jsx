import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Auth = () => {
  const { login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    rol: "",
  });

  // Decide action based on URL
  const isRegisterMode = location.pathname === "/register";
  const isLoginMode = location.pathname === "/login";

  // Clean message on URL change
  useEffect(() => {
    setMessage("");
    // Reset form on change
    setFormData({
      username: "",
      email: "",
      password: "",
      rol: "",
    });
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegisterMode) {
        await register(formData);
        await login({ username: formData.username, password: formData.password });
      } else if (isLoginMode) {
        await login(formData);
      }

      // Redirect to home after succesful action
      navigate("/");
    } catch (error) {
      // Handle errors
      if (error == "Error: No active account found with the given credentials") {
      setMessage("Usuario o contraseña incorrectos.");
      console.log(error);
      } else {
         setMessage("Error en la operación. Por favor, intenta de nuevo.");
         console.log(error);
      }


    }
  };

  const toggleMode = () => {
    // Navigate between login and register
    if (isRegisterMode) {
      navigate("/login");
    } else {
      navigate("/register");
    }
  };

  // Fallback message
  if (!isRegisterMode && !isLoginMode) {
    return <div>Página no encontrada</div>;
  }

  return (
    <div className="auth-form">
      <h2>{isRegisterMode ? "Registro" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {isRegisterMode && (
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />
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
          {isRegisterMode ? "Registrarse" : "Iniciar sesión"}
        </button>
      </form>
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      <button onClick={toggleMode}>
        Cambiar a {isRegisterMode ? "Login" : "Registro"}
      </button>
    </div>
  );
};

export default Auth;
