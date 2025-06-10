import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
/**
 * Component that renders the navigation bar
 *
 * It has two different styles depending on whether the user is authenticated or not.
 * If the user is authenticated, it shows a link to their profile and a button to log out.
 * If the user is not authenticated, it shows links to log in and sign up.
 *
 * @returns {JSX.Element} A JSX element that contains the navigation bar
 */
const Navbar = () => {
  const { user, doLogout, isAuthenticated } = useAuth();
  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          CuestaMarket
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/encuestas">
                Encuestas
              </Link>
            </li>

            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Regístrate
                  </Link>
                </li>
              </>
            ) : (
              <>
                {user?.role.name === "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      Gestión de Usuarios
                    </Link>
                  </li>
                )}
                {(user?.role.name === "client" ||
                  user?.role.name === "admin") && (
                  <li className="nav-item">
                    <Link
                      className={isActive("/mis-encuestas")}
                      to="/mis-encuestas"
                    >
                      <i className="fas fa-list me-1"></i>
                      {user?.role.name === "admin"
                        ? "Gestión de Encuestas"
                        : "Mis Encuestas"}
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Mi Perfil
                  </Link>
                </li>

                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={doLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
