import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import useUser from "../hooks/useUser";
import { useSelector } from "react-redux";

function AdminPanel() {
  const { getAllUsers, adminUpdate, adminRegister, adminToggle, listRoles } =
    useUser();

  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const users = useSelector((state) => state.user.users);
  let error = "";

  const filteredUsers = (
    showInactive ? users : users.filter((u) => u.is_active)
  )
    .filter((u) => {
      const term = searchTerm.toLowerCase();
      return (
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    })
    .filter((u) => {
      if (!selectedRole) return true;
      return u.role?.id === parseInt(selectedRole);
    });

  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role_id: "",
      is_active: true,
    },
  });

  const fetchRoles = () => {
    listRoles()
      .then((response) => {
        setRoles(response);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  };

  useEffect(() => {
    getAllUsers();
    fetchRoles();
  }, []);

  const handleEdit = (user) => {
    reset({
      username: user.username,
      email: user.email,
      role_id: user.role?.id || "",
      is_active: user.is_active,
    });
    setEditingUser({ ...user, isNewUser: false });
  };

  const handleCreate = () => {
    reset({
      username: "",
      email: "",
      password: "",
      role_id: "",
      is_active: true,
    });
    setEditingUser({ isNewUser: true });
  };

  const handleCancel = () => {
    reset();
    setEditingUser(null);
    setError(null);
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active ? "deactivate" : "activate";
    if (
      !window.confirm(
        `¿Estás seguro de ${
          user.is_active ? "desactivar" : "activar"
        } este usuario?`
      )
    )
      return;
    try {
      await adminToggle(user.id, action);
      getAllUsers();
    } catch (err) {
      setError(`Error al ${action} usuario: ${err.message}`);
    }
  };

  const roleMap = {
    admin: { label: "Administrador", className: "badge bg-danger" },
    client: { label: "Cliente", className: "badge bg-primary" },
    voter: { label: "Votante", className: "badge bg-success" },
  };

  const getRoleDisplay = (roleKey) => {
    const role = roleMap[roleKey?.toLowerCase()];
    return (
      role || {
        label: roleKey || "Desconocido",
        className: "badge bg-secondary",
      }
    );
  };

  const roleLabelMap = {
    admin: "Administrador",
    client: "Cliente",
    voter: "Votante",
  };

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    const isEdit = editingUser && !editingUser.isNewUser;
    const userData = {
      username: formData.username,
      email: formData.email,
      role_id: parseInt(formData.role_id),
      is_active: formData.is_active,
      ...(formData.password ? { password: formData.password } : {}),
    };

    try {
      if (isEdit) {
        await adminUpdate(editingUser.id, userData);
      } else {
        await adminRegister(userData);
      }

      setEditingUser(null);
      reset();
      getAllUsers();
    } catch (err) {
      Object.entries(err).forEach(([field, messages]) => {
        setError(field, {
          type: "server",
          message: messages.join(", "),
        });
      });

      // También puedes poner un error general si quieres:
      setError("root", {
        type: "server",
        message: "Ocurrieron errores al guardar el usuario.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>

      {error && (
        <div className="alert alert-danger">
          <p>{error}</p>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => setError(null)}
          >
            Cerrar
          </button>
        </div>
      )}

      {!editingUser ? (
        <div className="card mb-4 p-3 shadow-sm">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="searchTerm" className="form-label">
                Buscar por nombre o email
              </label>
              <input
                type="text"
                className="form-control"
                id="searchTerm"
                placeholder="juan, ejemplo@correo.com..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="selectedRole" className="form-label">
                Filtrar por rol
              </label>
              <select
                id="selectedRole"
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Todos los roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {roleLabelMap[r.name] || r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <div className="form-check mt-4">
                <input
                  type="checkbox"
                  id="showInactive"
                  className="form-check-input"
                  checked={showInactive}
                  onChange={() => setShowInactive(!showInactive)}
                />
                <label htmlFor="showInactive" className="form-check-label">
                  Mostrar usuarios inactivos
                </label>
              </div>
            </div>

            <div className="col-md-2 text-md-end mt-4">
              <button className="btn btn-primary w-100" onClick={handleCreate}>
                <i className="fas fa-user-plus me-2"></i>
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-4 mb-4">
          <h4>{editingUser.isNewUser ? "Crear Usuario" : "Editar Usuario"}</h4>

          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Nombre de usuario
            </label>
            <Controller
              name="username"
              control={control}
              rules={{ required: "El nombre de usuario es obligatorio" }}
              render={({ field }) => (
                <input {...field} className="form-control" id="username" />
              )}
            />
            {errors.username && (
              <p className="text-danger">{errors.username.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "El correo es obligatorio",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Correo inválido",
                },
              }}
              render={({ field }) => (
                <input {...field} className="form-control" id="email" />
              )}
            />
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="role_id" className="form-label">
              Rol
            </label>
            <Controller
              name="role_id"
              control={control}
              rules={{ required: "El rol es obligatorio" }}
              render={({ field }) => (
                <select {...field} className="form-select" id="role_id">
                  <option value="">Seleccionar rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {roleLabelMap[r.name] || r.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.role_id && (
              <p className="text-danger">{errors.role_id.message}</p>
            )}
          </div>

          {editingUser.isNewUser && (
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "Mínimo 6 caracteres",
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    className="form-control"
                    id="password"
                  />
                )}
              />
              {errors.password && (
                <p className="text-danger">{errors.password.message}</p>
              )}
            </div>
          )}

          {!editingUser.isNewUser && (
            <div className="form-check mb-3">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="checkbox"
                    className="form-check-input"
                    id="is_active"
                    checked={field.value}
                  />
                )}
              />
              <label className="form-check-label" htmlFor="is_active">
                Usuario activo
              </label>
            </div>
          )}

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? editingUser.isNewUser
                  ? "Creando..."
                  : "Actualizando..."
                : editingUser.isNewUser
                ? "Crear"
                : "Actualizar"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <ul className="list-group">
        {filteredUsers.length === 0 ? (
          <p className="mt-3">
            No hay usuarios {showInactive ? "" : "activos"} que coincidan con
            los términos de búsqueda.
          </p>
        ) : (
          filteredUsers.map((u) => (
            <li
              key={u.id}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                !u.is_active ? "list-group-item-secondary" : ""
              }`}
            >
              <div>
                <strong>{u.username}</strong> ({u.email}) -{" "}
                {(u.role?.name &&
                  (() => {
                    const role = getRoleDisplay(u.role.name);
                    return (
                      <span className={`ms-2 ${role.className}`}>
                        {role.label}
                      </span>
                    );
                  })()) ||
                  "Sin rol"}
                {!u.is_active && (
                  <span className="text-muted"> (Inactivo)</span>
                )}
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEdit(u)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleToggleActive(u)}
                >
                  {u.is_active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default AdminPanel;
