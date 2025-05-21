import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';

function AdminPanel() {
  const { accessToken, API_URL } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

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
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/roles/`, {
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUsers();
      fetchRoles();
    }
  }, [accessToken]);

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await fetch(`${API_URL}/admin/users/${id}/`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEdit = Boolean(editingUser.id);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `${API_URL}/admin/users/${editingUser.id}/`
      : `${API_URL}/admin/users/`;

    const payload = {
      username: editingUser.username,
      email: editingUser.email,
       role: { name: editingUser.role?.name },
    };

    if (!isEdit) {
      payload.password = 'default123';
    }

    try {
      await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      setEditingUser(null);
      fetchUsers();
      console.log(payload);
      
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  return (
    <div>
      <h2>Gestión de Usuarios</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={editingUser?.username || ''}
          onChange={(e) =>
            setEditingUser({ ...editingUser, username: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={editingUser?.email || ''}
          onChange={(e) =>
            setEditingUser({ ...editingUser, email: e.target.value })
          }
        />
        <select
          value={editingUser?.role?.name || ''}
          onChange={(e) =>
            setEditingUser({
              ...editingUser,
              role: { name: e.target.value },
            })
          }
        >
          <option value="">Select role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        <button type="submit">
          {editingUser?.id ? 'Update' : 'Create'}
        </button>
      </form>

      <hr />

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.username}</strong> ({user.email}) — {user.role?.name}
            <button onClick={() => handleEdit(user)}>Edit</button>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;

