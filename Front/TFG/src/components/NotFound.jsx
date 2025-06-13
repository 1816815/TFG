import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: "80vh" }}>
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <p className="fs-4">¡Vaya! La página que buscas no existe.</p>
      <p className="text-muted mb-4">
        Puede que la dirección esté mal escrita o que la página haya sido movida.
      </p>
      <Link to="/" className="btn btn-outline-primary">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
