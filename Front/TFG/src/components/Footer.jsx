import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto footer">
      <div className="container">
        <div className="row">

          {/* Marca y descripción */}
          <div className="col-md-4 mb-4">
            <h4 className="fw-bold text-primary">Cuestamarket</h4>
            <p>
              Plataforma de encuestas para estudios de mercado. Recoge datos reales y toma decisiones informadas.
            </p>
          </div>

          {/* Enlaces */}
          <div className="col-md-4 mb-4">
            <h5>Navegación</h5>
            <ul className="list-unstyled">
              <li><Link className="text-light text-decoration-none" to="/">Inicio</Link></li>
              <li><Link className="text-light text-decoration-none" to="/register">Registrarse</Link></li>
              <li><Link className="text-light text-decoration-none" to="/login">Iniciar sesión</Link></li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="col-md-4 mb-4">
            <h5>Síguenos</h5>
            <div className="d-flex gap-3">
              <a href="https://twitter.com" className="text-light" target="_blank" rel="noreferrer">
                <i className="bi bi-twitter fs-4"></i>
              </a>
              <a href="https://facebook.com" className="text-light" target="_blank" rel="noreferrer">
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a href="https://linkedin.com" className="text-light" target="_blank" rel="noreferrer">
                <i className="bi bi-linkedin fs-4"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-secondary" />

        <div className="text-center small text-muted">
          © {new Date().getFullYear()} Cuestamarket. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
