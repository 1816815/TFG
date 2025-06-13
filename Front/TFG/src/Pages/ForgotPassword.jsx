import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useFlashRedirect } from "../hooks/useFlashRedirect";
import { useSelector } from "react-redux";

const ForgotPassword = () => {
  const { requestNewPassword } = useAuth();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user.user);
  const {navigateWithFlash} = useFlashRedirect();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    setMessage(null);
    setError(null);
    try {
      await requestNewPassword(email);
      setMessage(
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
    } catch (err) {
      setError("Error al enviar el enlace. Intenta de nuevo.");
    }
  };

  useEffect(() => {
    if (user) {
      navigateWithFlash("/", "Si ha olvidado su contraseña, solicite una nueva con la sesión cerrada.", "error");
    }
  }, [user]);

  return (
    <div className="auth-form container mt-4" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">¿Olvidaste tu contraseña?</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="Correo electrónico"
            {...register("email", { required: "El correo es obligatorio" })}
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email.message}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Enviar enlace
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
