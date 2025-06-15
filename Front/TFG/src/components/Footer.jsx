import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="pt-5 pb-3 footer">
      <div className="container">
        <div className="row">
          {/* Marca y descripción */}
          <div className="col-md-4 mb-4">
            <h4 className="fw-bold text-primary">CuestaMarket</h4>
            <p>
              Plataforma de encuestas para estudios de mercado. Recoge datos
              reales y toma decisiones informadas.
            </p>
          </div>

          {/* Enlaces */}
          <div className="col-md-4 mb-4">
            <h5>Navegación</h5>
            <ul className="list-unstyled">
              <li>
                <Link className="text-light text-decoration-none" to="/">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  className="text-light text-decoration-none"
                  to="/register"
                >
                  Registrarse
                </Link>
              </li>
              <li>
                <Link className="text-light text-decoration-none" to="/login">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="col-md-4 mb-4">
            <h5>Síguenos</h5>
            <div className="d-flex gap-3">
              <a
                href="https://x.com"
                className="text-light"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="1em"
                  height="1em"
                  style={{ verticalAlign: "middle" }}
                  className="fs-4"
                >
                  <path d="M17.53 2H21.5l-7.19 8.19L22 22h-7.25l-5.11-6.68L2.47 22H-1.5l7.64-8.73L2 2h7.39l4.73 6.17L17.53 2zm-2.03 17.5h2.16L8.62 4.5H6.36z" />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                className="text-light"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a
                href="https://linkedin.com"
                className="text-light"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-linkedin fs-4"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-secondary" />

        <div className="text-center small ">
          © {new Date().getFullYear()} CuestaMarket. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
