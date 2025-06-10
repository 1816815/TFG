import { useForm } from "react-hook-form";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

const ForgotPassword = () => {
  const { requestNewPassword } = useAuth();
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await requestNewPassword(email);
      setMessage("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
    } catch (err) {
      setMessage("Error al enviar el enlace. Intenta de nuevo.");
    }
  };

  return (
    <div className="auth-form">
      <h2>¿Olvidaste tu contraseña?</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Correo electrónico"
          {...register("email", { required: "El correo es obligatorio" })}
        />
        {errors.email && <p>{errors.email.message}</p>}
        <button type="submit">Enviar enlace</button>
      </form>
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
