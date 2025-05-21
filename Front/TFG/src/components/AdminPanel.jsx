import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';

function AdminPanel() {
  const { accessToken, API_URL } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users/`, {
        headers,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(`Error loading users: ${err.message}`);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/roles/`, {
        headers,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError(`Error loading roles: ${err.message}`);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUsers();
      fetchRoles();
    }
  }, [accessToken]);

  const handleEdit = (user) => {
    // Crear una copia para evitar modificar el objeto original
    setEditingUser({
      ...user,
      role_id: user.role?.id || '',
      isNewUser: false // No es un nuevo usuario
    });
  };

  const handleCreate = () => {
    setEditingUser({
      username: '',
      email: '',
      role_id: '',
      password: '',
      is_active: true,
      isNewUser: true // Flag para identificar si es un nuevo usuario
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setError(null);
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    const confirmMessage = user.is_active 
      ? '¿Estás seguro de que quieres desactivar este usuario?' 
      : '¿Estás seguro de que quieres reactivar este usuario?';
      
    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}/${action}/`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      fetchUsers();
      setError(null);
    } catch (err) {
      console.error(`Error ${action} user:`, err);
      setError(`Error al ${action === 'activate' ? 'activar' : 'desactivar'} usuario: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const isEdit = Boolean(editingUser.id);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `${API_URL}/admin/users/${editingUser.id}/`
      : `${API_URL}/admin/users/`;

    // Buscar el objeto role completo basado en el role_id seleccionado
    const selectedRole = roles.find(r => r.id === parseInt(editingUser.role_id));
    
    // Crear el payload según lo que espera Django
    const payload = {
      username: editingUser.username,
      email: editingUser.email,
      role_id: selectedRole ? selectedRole.id : null,
      is_active: editingUser.is_active !== undefined ? editingUser.is_active : true,
    };

    // Añadir password solo para nuevos usuarios
    if (!isEdit && editingUser.password) {
      payload.password = editingUser.password;
    }

    try {
      console.log('Sending payload:', JSON.stringify(payload));
      
      const res = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server response:', errorData);
        throw new Error(JSON.stringify(errorData));
      }
      
      const responseData = await res.json();
      console.log('Success response:', responseData);
      
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(`Error al guardar usuario: ${err.message}`);
    }
  };

  // Filtrar usuarios según el estado de activación si es necesario
  const filteredUsers = showInactive 
    ? users 
    : users.filter(user => user.is_active);

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
          <button onClick={handleCreate} className="create-btn">Crear Nuevo Usuario</button>
          <div className="toggle-container">
            <label>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              />
              Mostrar usuarios inactivos
            </label>
          </div>
        </div>
      ) : (
        <div className="form-container">
          <h3>{editingUser.id ? 'Editar Usuario' : 'Crear Usuario'}</h3>
          {editingUser.isNewUser && (
            <p className="form-info">La contraseña es requerida para nuevos usuarios.</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre de usuario:</label>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={editingUser.username || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, username: e.target.value })
                }
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Email"
                value={editingUser.email || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                required
              />
            </div>
            
            <div className="form-group">
              <label>Rol:</label>
              <select
                value={editingUser.role_id || ''}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role_id: e.target.value,
                  })
                }
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Campo de contraseña visible solo al crear un nuevo usuario */}
            {editingUser.isNewUser && (
              <div className="form-group">
                <label>Contraseña:</label>
                <input
                  type="password"
                  placeholder="Contraseña para el nuevo usuario"
                  value={editingUser.password || ''}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, password: e.target.value })
                  }
                  required
                />
              </div>
            )}
            
            {/* Campo de estado activo/inactivo */}
            {!editingUser.isNewUser && (
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  Usuario activo
                </label>
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit">
                {editingUser.id ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <hr />

      <div className="users-list">
        <h3>Usuarios {!showInactive && "Activos"}</h3>
        {filteredUsers.length === 0 ? (
          <p>No hay usuarios {!showInactive && "activos"} disponibles.</p>
        ) : (
          <ul>
            {filteredUsers.map((user) => (
              <li key={user.id} className={`user-item ${!user.is_active ? 'inactive-user' : ''}`}>
                <div className="user-info">
                  <strong>{user.username}</strong>
                  <span className="user-email">{user.email}</span>
                  <span className="user-role">{user.role?.name || 'Sin rol'}</span>
                  {!user.is_active && <span className="status-badge inactive">Inactivo</span>}
                </div>
                <div className="user-actions">
                  <button onClick={() => handleEdit(user)} className="edit-btn">Editar</button>
                  <button 
                    onClick={() => handleToggleActive(user)} 
                    className={user.is_active ? "deactivate-btn" : "activate-btn"}
                  >
                    {user.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;