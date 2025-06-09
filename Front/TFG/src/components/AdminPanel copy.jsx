import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import useUser from "../hooks/useUser";
import { useSelector } from "react-redux";

function AdminPanel() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { getAllUsers } = useUser();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const userList = useSelector((state) => state.user.users);


  const {
    handleSubmit,
    control,
    reset,
    setValue,
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

  useEffect( ()=>{
   getAllUsers();
  }, []);

  useEffect(()=>{
    console.log(userList);
    
  }, [userList]);



  const headers = {
    "Content-Type": "application/json",
  };

  const fetchData = async (endpoint, setter) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) throw new Error(JSON.stringify(await res.json()));
      const data = await res.json();
      setter(data);
    } catch (err) {
      setError(`Error cargando ${endpoint}: ${err.message}`);
    }
  };

  const fetchUsers = async () => {
    await fetchData("/admin/users/", (data) => {
      const normalized = data.map((u) => ({
        ...u,
        is_active: u.is_active !== undefined ? u.is_active : true,
      }));
      setUsers(normalized);
    });
  };

  const fetchRoles = () => fetchData("/roles", setRoles);

  useEffect(() => {
    fetchUsers();
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
        `¿Estás seguro de ${user.is_active ? "desactivar" : "activar"} este usuario?`
      )
    )
      return;
    try {
      const res = await fetch(
        `${API_URL}/admin/users/${user.id}/${action}/`,
        {
          method: "POST",
          headers,
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(JSON.stringify(await res.json()));
      fetchUsers();
    } catch (err) {
      setError(`Error al ${action} usuario: ${err.message}`);
    }
  };

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    const isEdit = editingUser && !editingUser.isNewUser;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `${API_URL}/admin/users/${editingUser.id}/`
      : `${API_URL}/admin/users/`;

    const payload = {
      username: formData.username,
      email: formData.email,
      role_id: parseInt(formData.role_id),
      is_active: formData.is_active,
      ...(editingUser?.isNewUser && formData.password
        ? { password: formData.password }
        : {}),
    };

    try {
      const res = await fetch(url, {
        method,
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(JSON.stringify(await res.json()));
      setEditingUser(null);
      reset();
      fetchUsers();
    } catch (err) {
      setError(`Error al guardar usuario: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = showInactive
    ? users
    : users.filter((u) => u.is_active);

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>

      {error && (
        <div className="alert alert-danger">
          <p>{error}</p>
          <button className="btn btn-sm btn-danger" onClick={() => setError(null)}>
            Cerrar
          </button>
        </div>
      )}

      {!editingUser ? (
        <div className="d-flex gap-3 mb-3">
          <button className="btn btn-primary" onClick={handleCreate}>
            Crear Nuevo Usuario
          </button>
          <label className="form-check-label">
            <input
              type="checkbox"
              name="showInactive"
              id="showInactive"
              className="form-check-input"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
            />
            Mostrar inactivos
          </label>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-4 mb-4">
          <h4>{editingUser.isNewUser ? "Crear Usuario" : "Editar Usuario"}</h4>

          <div className="mb-3">
            <label htmlFor="username" className="form-label">Nombre de usuario</label>
            <Controller
              name="username"
              control={control}
              rules={{ required: "El nombre de usuario es obligatorio" }}
              render={({ field }) => (
                <input {...field} className="form-control" id="username" />
              )}
            />
            {errors.username && <p className="text-danger">{errors.username.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
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
            {errors.email && <p className="text-danger">{errors.email.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="role_id" className="form-label">Rol</label>
            <Controller
              name="role_id"
              control={control}
              rules={{ required: "El rol es obligatorio" }}
              render={({ field }) => (
                <select {...field} className="form-select" id="role_id">
                  <option value="">Seleccionar rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.role_id && <p className="text-danger">{errors.role_id.message}</p>}
          </div>

          {editingUser.isNewUser && (
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
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
            <button type="submit" className="btn btn-success" disabled={isSubmitting}>
              {isSubmitting
                ? editingUser.isNewUser
                  ? "Creando..."
                  : "Actualizando..."
                : editingUser.isNewUser
                ? "Crear"
                : "Actualizar"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <ul className="list-group">
        {filteredUsers.length === 0 ? (
          <p className="mt-3">No hay usuarios {showInactive ? "" : "activos"}.</p>
        ) : (
          filteredUsers.map((u) => (
            <li
              key={u.id}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                !u.is_active ? "list-group-item-secondary" : ""
              }`}
            >
              <div>
                <strong>{u.username}</strong> ({u.email}) - {u.role?.name || "Sin rol"}
                {!u.is_active && <span className="text-muted"> (Inactivo)</span>}
              </div>
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(u)}>
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
