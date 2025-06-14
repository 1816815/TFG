import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const { confirmNewPassword } = useAuth();
  const { navigateWithFlash } = useFlashRedirect();
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      await confirmNewPassword(uid, token, password);
      navigateWithFlash("/login", "Contraseña restablecida. Ya puede iniciar sesión.", "success");
    } catch (err) {
      setMessage("Error al restablecer la contraseña. Intenta con un nuevo enlace o solicita uno nuevo.");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-sm" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Restablecer contraseña</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Nueva contraseña</label>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="Nueva contraseña"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 8,
                    message: "Debe tener al menos 8 caracteres"
                  }
                })}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100">Restablecer</button>
          </form>

          {message && (
            <div className="alert alert-danger mt-3">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
