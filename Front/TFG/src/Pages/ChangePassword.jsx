import { useForm } from "react-hook-form";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

const ChangePassword = () => {
  const { editPassword: changePassword } = useAuth();
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
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setMessage("Contraseña actualizada correctamente.");
      reset();
    } catch (err) {
      setError(err.error || "Error al cambiar la contraseña.");
    }
  };

  return (
    <div className="change-password-form">
      <h2>Cambiar contraseña</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="password"
          placeholder="Contraseña actual"
          {...register("currentPassword", { required: "Campo obligatorio" })}
        />
        {errors.currentPassword && <p>{errors.currentPassword.message}</p>}

        <input
          type="password"
          placeholder="Nueva contraseña"
          {...register("newPassword", { required: "Campo obligatorio" })}
        />
        {errors.newPassword && <p>{errors.newPassword.message}</p>}

        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          {...register("confirmPassword", {
            required: "Campo obligatorio",
            validate: (value) =>
              value === watch("newPassword") || "Las contraseñas no coinciden",
          })}
        />
        {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}

        <button type="submit">Actualizar contraseña</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ChangePassword;
