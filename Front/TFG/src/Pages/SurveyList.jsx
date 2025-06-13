import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useSurveys from "../hooks/useSurveys";
import { useSelector } from "react-redux";

const SurveyList = () => {
  const { loadSurveys } = useSurveys();

  const error = useSelector((state) => state.surveys.error);
  const loading = useSelector((state) => state.surveys.loading);
  const surveys = useSelector((state) => state.surveys.items);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSurveys();
  }, []);

  // Evita fallos si surveys aún no está definido
  const filteredSurveys = Array.isArray(surveys)
    ? surveys.filter((survey) =>
        (survey.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (survey.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Encuestas</h2>
        <Link to="/nueva-encuesta" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Nueva Encuesta
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por título o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredSurveys.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="fas fa-poll fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted">No se encontraron encuestas</h4>
          <p className="text-muted">Cambia los criterios de búsqueda o crea una nueva encuesta</p>
          <Link to="/nueva-encuesta" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Crear Encuesta
          </Link>
        </div>
      ) : (
        <div className="row">
          {filteredSurveys.map((survey) => (
            <div key={survey.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{survey.title}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {survey.description?.length > 100
                      ? `${survey.description.substring(0, 100)}...`
                      : survey.description}
                  </p>

                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">
                        <i className="fas fa-question-circle me-1"></i>
                        {survey.questions?.length || 0} preguntas
                      </small>
                      <small className="text-muted">
                        <i className="fas fa-copy me-1"></i>
                        {survey.instances_count || 0} instancias
                      </small>
                    </div>

                    <Link
                      to={`/encuesta/${survey.id}`}
                      className="btn btn-outline-primary w-100"
                    >
                      <i className="fas fa-eye me-2"></i>
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyList;
