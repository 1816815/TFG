import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useUser from "../hooks/useUser";
import ChangePassword from "./ChangePassword";

const Profile = () => {
  const { user, updateUserProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const formatRole = (role) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "client":
        return "Cliente";
      case "voter":
        return "Votante";
      default:
        return "Desconocido";
    }
  };

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
        role: formatRole(user.role?.name) || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const result = await updateUserProfile(data);
    if (result) {
      setIsEditing(false);
      setMessage("Perfil actualizado correctamente");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Error al actualizar el perfil");
    }
  };

  if (!user)
    return (
      <div className="alert alert-danger">No se pudo cargar el perfil</div>
    );

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Mi Perfil</h4>
          {!isEditing && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          )}
        </div>

        <div className="card-body">
          {message && <div className="alert alert-info">{message}</div>}

          {!isEditing ? (
            <>
              <p>
                <strong>Usuario:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Rol:</strong> {formatRole(user.role?.name) || "Sin especificar"}
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <input
                  {...register("username", {
                    required: "Usuario es obligatorio",
                  })}
                  className="form-control"
                />
                {errors.username && (
                  <div className="text-danger">{errors.username.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email es obligatorio",
                    pattern: { value: /^\S+@\S+$/, message: "Email inválido" },
                  })}
                  className="form-control"
                />
                {errors.email && (
                  <div className="text-danger">{errors.email.message}</div>
                )}
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <hr className="my-4" />

          <button
            className="btn btn-outline-dark"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm
              ? "Ocultar Cambio de Contraseña"
              : "Cambiar Contraseña"}
          </button>

          {showPasswordForm && (
            <div className="mt-4">
              <ChangePassword />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
