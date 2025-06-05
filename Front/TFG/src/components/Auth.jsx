import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import useUser from "../hooks/useUser";

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
  const { register: registerUser } = useAuth();
  const {login} = useUser();
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
    } catch (error) {
      if (error == "Error: No active account found with the given credentials") {
        setMessage("Usuario o contraseña incorrectos.");
      } else {
        setMessage("Error en la operación. Por favor, intenta de nuevo.");
      }
      console.log(error);
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
