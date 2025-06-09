import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useUser from "../hooks/useUser";

const Profile = () => {
  const { user, updateUserProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
        role: user.role?.name || ""
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const result = await updateUserProfile( data);
    if (result) {
      setIsEditing(false);
      setMessage("Perfil actualizado correctamente");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Error al actualizar el perfil");
    }
  };

  if (!user) return <div>Error: No se pudo cargar el perfil</div>;

  return (
    <div>
      <h2>Mi Perfil</h2>
      {!isEditing ? (
        <>
          <p>Usuario: {user.username}</p>
          <p>Email: {user.email}</p>
          <p>Rol: {user.role?.name || "Sin especificar"}</p>
          <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("username", { required: "Usuario es obligatorio" })}
            placeholder="Usuario"
          />
          {errors.username && <p>{errors.username.message}</p>}

          <input
            type="email"
            {...register("email", {
              required: "Email es obligatorio",
              pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }
            })}
            placeholder="Email"
          />
          {errors.email && <p>{errors.email.message}</p>}


          <button type="submit">Guardar Cambios</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancelar
          </button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Profile;
