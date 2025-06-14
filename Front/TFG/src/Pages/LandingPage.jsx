import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing-page bg-light text-dark">
 
      <section className="landing text-white text-center py-5">
        <div className="container">
          <h1 className="display-4 fw-bold">CuestaMarket</h1>
          <p className="lead">Estudios de mercado a través de encuestas digitales</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Empezar ahora
          </Link>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="text-center mb-4">¿Qué puedes hacer con Cuestamarket?</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <i className="bi bi-bar-chart-fill display-4 text-primary"></i>
            <h4 className="mt-3">Estudios precisos</h4>
            <p>Obtén insights reales a partir de respuestas de votantes segmentados.</p>
          </div>
          <div className="col-md-4 mb-4">
            <i className="bi bi-clipboard-check display-4 text-primary"></i>
            <h4 className="mt-3">Crea encuestas fácilmente</h4>
            <p>Interfaz simple para diseñar tus propios formularios en minutos.</p>
          </div>
          <div className="col-md-4 mb-4">
            <i className="bi bi-people-fill display-4 text-primary"></i>
            <h4 className="mt-3">Accede a votantes reales</h4>
            <p>Alcanza públicos objetivos y recibe respuestas rápidamente.</p>
          </div>
        </div>
      </section>

      <section className="bg-white border-top py-5">
        <div className="container text-center">
          <h3 className="mb-3">¿Listo para conocer mejor tu mercado?</h3>
          <Link to="/register" className="btn btn-primary btn-lg">
            Crear cuenta gratuita
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
