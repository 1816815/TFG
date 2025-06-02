import { useEffect, useState } from "react";
import useUser from "../hooks/useUser";

const Profile = () => {
  const { user, doUpdateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });


  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        role: user.role?.name || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = doUpdateUser(user.id, formData);
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
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Ej: Admin, Usuario"
          />
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
