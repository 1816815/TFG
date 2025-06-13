import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useInstance from "../hooks/useInstance";

const PublicSurveyList = () => {
  const { loadPublicInstances } = useInstance();
  const publicInstances = useSelector((state) => state.instances.publicInstances);
  const loading = useSelector((state) => state.instances.loading);
  const error = useSelector((state) => state.instances.error);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPublicInstances();
  }, []);

  const filteredInstances = Array.isArray(publicInstances)
    ? publicInstances.filter((instance) => {
        const title = instance.survey?.title?.toLowerCase() || "";
        const description = instance.survey?.description?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return title.includes(term) || description.includes(term);
      })
    : [];

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Encuestas Disponibles</h2>
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

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && filteredInstances.length === 0 && (
        <div className="text-center text-muted py-5">
          <i className="fas fa-search fa-2x mb-3"></i>
          <p>No se encontraron encuestas que coincidan con los términos de búsqueda.</p>
        </div>
      )}

      <div className="row">
        {filteredInstances.map((instance) => (
          <div key={instance.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{instance.survey?.title}</h5>
                <p className="card-text text-muted flex-grow-1">
                  {instance.survey?.description?.length > 100
                    ? instance.survey.description.substring(0, 100) + "..."
                    : instance.survey?.description}
                </p>

                <ul className="list-unstyled text-muted small mb-3">
                  <li>
                    <i className="fas fa-calendar-alt me-1"></i>
                    Creada el:{" "}
                    {new Date(instance.creation_date).toLocaleDateString()}
                  </li>
                  <li>
                    <i className="fas fa-hourglass-end me-1"></i>
                    Cierre:{" "}
                    {instance.closure_date
                      ? new Date(instance.closure_date).toLocaleDateString()
                      : "Sin fecha de cierre"}
                  </li>
                </ul>

                <a
                  href={`/encuestas/${instance.id}/responder`}
                  className="btn btn-outline-primary w-100 mt-auto"
                >
                  <i className="fas fa-pencil-alt me-2"></i>
                  Responder encuesta
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicSurveyList;
