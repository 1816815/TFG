import useAuth from '../hooks/useAuth';

const Logout = () => {
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <button onClick={logout}>
      Cerrar sesión
    </button>
  );
};

export default Logout;
