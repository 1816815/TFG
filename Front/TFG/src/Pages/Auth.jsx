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

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm();

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
          setError("password", {
            type: "validation",
            message:
              error.message || "La contraseña no cumple con los requisitos.",
          });
          return;
        }

        await registerUser(data);
        navigateWithFlash(
          "/",
          "Se ha enviado un correo para confirmar el registro.",
          "info"
        );
      } else if (isLoginMode) {
        await login(data);
        navigateWithFlash("/", "Sesión iniciada con éxito.", "success");
      }
    } catch (err) {
      if (err.detail) {
        setError("username", {
          type: "server",
          message: err.detail,
        });
        return;
      }

      if (typeof err === "object") {
        Object.entries(err).forEach(([field, messages]) => {
          setError(field, {
            type: "server",
            message: Array.isArray(messages) ? messages.join(", ") : messages,
          });
        });
      }

      setError("root", {
        type: "server",
        message: "Ocurrieron errores al procesar la solicitud.",
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
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="card shadow-sm"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="card-body">
          <h2 className="card-title text-center mb-4">
            {isRegisterMode ? "Registro" : "Iniciar sesión"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Usuario</label>
              <input
                type="text"
                className={`form-control ${
                  errors.username ? "is-invalid" : ""
                }`}
                placeholder="Nombre de usuario"
                {...register("username", {
                  required: "El usuario es obligatorio",
                })}
              />
              {errors.username && (
                <div className="invalid-feedback">
                  {errors.username.message}
                </div>
              )}
            </div>

            {isRegisterMode && (
              <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Correo electrónico"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Correo inválido",
                    },
                  })}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Contraseña"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100">
              {isRegisterMode ? "Registrarse" : "Iniciar sesión"}
            </button>

            {errors.root && (
              <div className="alert alert-danger mt-3">
                {errors.root.message}
              </div>
            )}

            {message && <div className="alert alert-info mt-3">{message}</div>}
          </form>

          <div className="text-center mt-3">
            <span className="text-muted">
              {isRegisterMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
              <span
                className="text-primary text-decoration-underline"
                role="button"
                onClick={toggleMode}
                style={{ cursor: "pointer" }}
              >
                {isRegisterMode ? "Inicia sesión" : "Regístrate"}
              </span>
            </span>

            {isLoginMode && (
              <div className="mt-2">
                <a
                  href="/forgot-password"
                  className="text-decoration-none text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
