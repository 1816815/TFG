import { useEffect, useState } from 'react';
import useUser from '../hooks/useUser';


function AdminPanel() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, accessToken }=useUser();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const fetchData = async (endpoint, setter) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { headers, credentials: 'include' });
      if (!res.ok) throw new Error(JSON.stringify(await res.json()));
      const data = await res.json();
      setter(data);
    } catch (err) {
      console.error(`Error loading ${endpoint}:`, err);
      setError(`Error cargando datos: ${err.message}`);
    }
  };

  const fetchUsers = async () => {
    await fetchData('/admin/users/', data => {
      const normalizedUsers = data.map(user => ({
        ...user,
        is_active: user.is_active !== undefined ? user.is_active : true,
      }));
      setUsers(normalizedUsers);
    });
  };

  const fetchRoles = () => fetchData('/roles', setRoles);

  useEffect(() => {
      fetchUsers();
      fetchRoles();
    
  }, []);

  const handleEdit = (user) => {
    setEditingUser({
      ...user,
      role_id: user.role?.id || '',
      isNewUser: false,
    });
  };

  const handleCreate = () => {
    setEditingUser({
      username: '',
      email: '',
      role_id: '',
      password: '',
      is_active: true,
      isNewUser: true,
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setError(null);
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`¿Estás seguro de ${user.is_active ? 'desactivar' : 'activar'} este usuario?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}/${action}/`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(JSON.stringify(await res.json()));
      fetchUsers();
      setError(null);
    } catch (err) {
      console.error(`Error al ${action} usuario:`, err);
      setError(`Error al ${action === 'activate' ? 'activar' : 'desactivar'} usuario: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const isEdit = Boolean(editingUser.id);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_URL}/admin/users/${editingUser.id}/` : `${API_URL}/admin/users/`;
    const selectedRole = roles.find(r => r.id === parseInt(editingUser.role_id));

    const payload = {
      username: editingUser.username,
      email: editingUser.email,
      role_id: selectedRole?.id || null,
      is_active: editingUser.is_active ?? true,
      ...(editingUser.isNewUser && editingUser.password ? { password: editingUser.password } : {}),
    };

    try {
      const res = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(JSON.stringify(await res.json()));
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setError(`Error al guardar usuario: ${err.message}`);
    }
  };

  const filteredUsers = showInactive ? users : users.filter(u => u.is_active);

  return (
    <div className="admin-panel">
      <h2>Gestión de Usuarios</h2>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}

      {!editingUser ? (
        <div className="panel-actions">
          <button onClick={handleCreate}>Crear Nuevo Usuario</button>
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
            />
            Mostrar inactivos
          </label>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{editingUser.isNewUser ? 'Crear Usuario' : 'Editar Usuario'}</h3>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={editingUser.username}
            onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={editingUser.email}
            onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
            required
          />
          <select
            value={editingUser.role_id}
            onChange={e => setEditingUser({ ...editingUser, role_id: e.target.value })}
            required
          >
            <option value="">Seleccionar rol</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {editingUser.isNewUser && (
            <input
              type="password"
              placeholder="Contraseña"
              value={editingUser.password}
              onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
              required
            />
          )}
          {!editingUser.isNewUser && (
            <label>
              <input
                type="checkbox"
                checked={editingUser.is_active}
                onChange={e => setEditingUser({ ...editingUser, is_active: e.target.checked })}
              />
              Usuario activo
            </label>
          )}
          <button type="submit">{editingUser.isNewUser ? 'Crear' : 'Actualizar'}</button>
          <button type="button" onClick={handleCancel}>Cancelar</button>
        </form>
      )}

      <hr />

      <ul className="users-list">
        {filteredUsers.length === 0 ? (
          <p>No hay usuarios {showInactive ? '' : 'activos'}.</p>
        ) : (
          filteredUsers.map(user => (
            <li key={user.id} className={user.is_active ? '' : 'inactive'}>
              <strong>{user.username}</strong> ({user.email}) - {user.role?.name || 'Sin rol'}
              {!user.is_active && <span> (Inactivo)</span>}
              <button onClick={() => handleEdit(user)}>Editar</button>
              <button onClick={() => handleToggleActive(user)}>
                {user.is_active ? 'Desactivar' : 'Activar'}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default AdminPanel;
