import { useForm } from "react-hook-form";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

const ChangePassword = () => {
  const { validatePassword, editPassword: changePassword } = useAuth();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setMessage(null);
    setError(null);

    try {
      await validatePassword(data.newPassword);
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setMessage("Contraseña actualizada correctamente.");
      reset();
    } catch (err) {
      const errMsg = Array.isArray(err)
        ? err.join(" ")
        : err.error || "Error al cambiar la contraseña.";
      setError(errMsg);
    }
  };

  return (
    <div className="mt-4">
      <h5 className="mb-3">Cambiar contraseña</h5>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Contraseña actual</label>
          <input
            type="password"
            className="form-control"
            {...register("currentPassword", { required: "Campo obligatorio" })}
          />
          {errors.currentPassword && (
            <div className="text-danger">{errors.currentPassword.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            {...register("newPassword", { required: "Campo obligatorio" })}
          />
          {errors.newPassword && (
            <div className="text-danger">{errors.newPassword.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Confirmar nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            {...register("confirmPassword", {
              required: "Campo obligatorio",
              validate: (value) =>
                value === watch("newPassword") || "Las contraseñas no coinciden",
            })}
          />
          {errors.confirmPassword && (
            <div className="text-danger">{errors.confirmPassword.message}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
