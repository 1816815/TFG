import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

const Auth = () => {
  const { validatePassword, login, register: registerUser } = useAuth();
  const { navigateWithFlash } = useFlashRedirect();
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
        try {
          await validatePassword(data.password);
        } catch (error) {
          setError('password', {
            type: 'validation',
            message: error.message || 'La contraseña no cumple con los requisitos.',
          });
          return;
        }

        await registerUser(data);
        navigateWithFlash("/", "Se ha enviado un correo electrónico a su dirección para confirmar el registro.", "info");
      } else if (isLoginMode) {
        await login(data);
        navigateWithFlash("/", "Se ha iniciado sesión con éxito.", "success");
      }


    } catch (err) {
      if (err.detail) {
        setError('username', {
          type: 'server',
          message: err.detail,
        });
        return;
      }

      if (typeof err === 'object') {
        Object.entries(err).forEach(([field, messages]) => {
          setError(field, {
            type: 'server',
            message: Array.isArray(messages) ? messages.join(', ') : messages,
          });
        });
      }

      setError('root', {
        type: 'server',
        message: 'Ocurrieron errores al procesar la solicitud.',
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
          autoComplete={isRegisterMode ? "new-password" : "current-password"}
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

