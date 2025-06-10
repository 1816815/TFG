import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { useState } from "react";

const ResetPassword = () => {
  const { uid, token } = useParams();
 const {confirmNewPassword} = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      await confirmNewPassword( uid, token, password );
      setMessage("Contraseña actualizada correctamente. Serás redirigido...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setMessage("Error al restablecer la contraseña. Intenta con un nuevo enlace.");
    }
  };

  return (
    <div className="auth-form">
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: {
              value: 6,
              message: "Debe tener al menos 6 caracteres"
            }
          })}
        />
        {errors.password && <p>{errors.password.message}</p>}
        <button type="submit">Restablecer</button>
      </form>
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default ResetPassword;
