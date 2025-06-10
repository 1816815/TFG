import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";


/**
 * Auth component handles user authentication by providing login and registration functionality.
 *
 * It uses `useAuth` to access login and register methods, `useLocation` to determine the current
 * route, and `useNavigate` for navigation. React Hook Form is used for form handling.
 *
 * The component switches between login and registration modes based on the URL path (`/login` or `/register`).
 * If the URL is not either of these, it displays a "Page not found" message.
 *
 * On form submission, it attempts to log in or register the user, then navigates to the home page
 * if successful, or displays an error message on failure.
 *
 * A button allows toggling between login and registration modes.
 *
 * @returns {JSX.Element} - The authentication form with inputs for username, email (on registration),
 * and password. Displays error messages and a toggle button.
 */

const Auth = () => {
  const {login ,register: registerUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const isRegisterMode = location.pathname === "/register";
  const isLoginMode = location.pathname === "/login";

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm();

  // Clean message and reset form on URL change
  useEffect(() => {
    setMessage("");
    reset();
  }, [location.pathname, reset]);

const onSubmit = async (data) => {
  try {
    if (isRegisterMode) {
      await registerUser(data);
      await login({ username: data.username, password: data.password });
    } else if (isLoginMode) {
      await login(data);
    }
    navigate("/");
  } catch (err) {
    
    if (err.detail) {
      setError('username', {
        type: 'server',
        message: err.detail,
      });
      return;
    }

    // Si err es un objeto con errores por campo (registro)
    Object.entries(err).forEach(([field, messages]) => {
      setError(field, {
        type: 'server',
        message: Array.isArray(messages) ? messages.join(', ') : messages,
      });
    });

    setError('root', {
      type: 'server',
      message: 'Ocurrieron errores al registrar el usuario.',
    });
  }
};

  const toggleMode = () => {
    navigate(isRegisterMode ? "/login" : "/register");
  };

  if (!isRegisterMode && !isLoginMode) {
    return <div>Página no encontrada</div>;
  }

  return (
    <div className="auth-form">
      <h2>{isRegisterMode ? "Registro" : "Login"}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Usuario"
          {...register("username", { required: "El usuario es obligatorio" })}
        />
        {errors.username && <p>{errors.username.message}</p>}

        {isRegisterMode && (
          <>
            <input
              type="email"
              placeholder="Correo electrónico"
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" }
              })}
            />
            {errors.email && <p>{errors.email.message}</p>}
          </>
        )}

        <input
          type="password"
          placeholder="Contraseña"
          {...register("password", { required: "La contraseña es obligatoria" })}
        />
        {errors.password && <p>{errors.password.message}</p>}

        <button type="submit">{isRegisterMode ? "Registrarse" : "Iniciar sesión"}</button>
      </form>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

      <button onClick={toggleMode}>
        Cambiar a {isRegisterMode ? "Login" : "Registro"}
      </button>
    </div>
  );
};

export default Auth;
