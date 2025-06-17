import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useUser from "../hooks/useUser";
import ChangePassword from "./ChangePassword";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

const Profile = () => {
  const { user, updateUserProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState("");
  const {navigateWithFlash} = useFlashRedirect();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
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
  // Limpiar todos los errores previos
  clearErrors();

  try {
    const result = await updateUserProfile(data);
    
    // Si llegamos aquí sin excepción, es éxito
    setIsEditing(false);
    navigateWithFlash("/profile", "Perfil actualizado correctamente", "success");
    
  } catch (error) {
    // Si updateUserProfile lanza una excepción con los errores del servidor
    const serverErrors = error?.response?.data || error?.data || error;
    
    if (serverErrors && typeof serverErrors === 'object') {
      // Poner errores específicos de campo
      Object.entries(serverErrors).forEach(([field, messages]) => {
        setError(field, {
          type: "server",
          message: Array.isArray(messages) ? messages.join(", ") : messages,
        });
      });
    } else {
      setError("root", {
        type: "server",
        message: "Error inesperado.",
      });
    }
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

              {/* No mostrar error general del servidor cuando hay errores de campo específicos */}

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    clearErrors(); // Limpiar errores al cancelar
                  }}
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