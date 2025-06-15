import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFlashRedirect } from "../hooks/useFlashRedirect";
import useSurveys from "../hooks/useSurveys";
import useInstance from "../hooks/useInstance";
import { useSelector } from "react-redux";

const SurveyDetail = () => {
  const survey = useSelector((state) => state.surveys.currentSurvey);
  const { navigateWithFlash } = useFlashRedirect();
  const instances = useSelector((state) => state.instances.instances);
  const loading = useSelector((state) => state.surveys.loading);
  const error = useSelector((state) => state.surveys.error);
  const [actionLoading, setActionLoading] = useState(false);
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { deleteSurveyById, loadSurveyById, loadSurveys } = useSurveys();
  const { loadInstancesBySurvey } = useInstance();
  const modalRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadSurveyById(surveyId);
    loadInstancesBySurvey(surveyId);
  }, [surveyId]);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    if (showDeleteModal) {
      // Crear o obtener la instancia del modal
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement, {
        backdrop: "static",
        keyboard: false,
      });
      
      modal.show();
      
      const handleHidden = () => {
        setShowDeleteModal(false);
        modalElement.removeEventListener("hidden.bs.modal", handleHidden);
      };
      
      modalElement.addEventListener("hidden.bs.modal", handleHidden);
      
      return () => {
        modalElement.removeEventListener("hidden.bs.modal", handleHidden);
      };
    }
  }, [showDeleteModal]);

  const handleDeleteSurvey = async () => {
    setActionLoading(true);

    try {
      await deleteSurveyById(surveyId);
      
      await loadSurveys();
      
      forceCloseModal();
      
      navigateWithFlash("/mis-encuestas", "Encuesta eliminada", "success");
      
    } catch (error) {
      console.error("Error deleting survey:", error);
      
      forceCloseModal();
      
      navigateWithFlash("/mis-encuestas", "Error de conexión", "error");
      
    } finally {
      setActionLoading(false);
    }
  };

  const forceCloseModal = () => {

    setShowDeleteModal(false);
    
    const modalElement = modalRef.current;
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
      }
      
    }, 50);
  };

  const handleInstances = () => {
    navigate(`/encuesta/${surveyId}/lista`);
  };

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

  if (error || !survey) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error || "Encuesta no encontrada"}
        </div>
        <Link to="/mis-encuestas" className="btn btn-secondary">
          <i className="fas fa-arrow-left me-2"></i>
          Volver a Mis Encuestas
        </Link>
      </div>
    );
  }

  const recentInstances = [...instances]
    .sort((a, b) => b.id - a.id )
    .slice(0, 5);

  return (
    <div className="container mt-4">
      {/* Header con navegación */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/mis-encuestas" className="btn btn-outline-secondary me-3">
            <i className="fas fa-arrow-left me-2"></i>
            Volver
          </Link>
        </div>
        <div className="btn-group" role="group">
          <Link
            to={`/editar-encuesta/${surveyId}`}
            className="btn btn-outline-primary"
          >
            <i className="fas fa-edit me-2"></i>
            Editar
          </Link>
          <button
            className="btn btn-outline-success"
            onClick={handleInstances}
            disabled={actionLoading}
          >
            Instancias
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Eliminando...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-2"></i>
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Información de la encuesta */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">{survey.title}</h3>
            </div>
            <div className="card-body">
              <p className="card-text">{survey.description}</p>

              <div className="row text-center">
                <div className="col-4">
                  <div className="border-end">
                    <h5 className="text-primary">
                      {survey.questions?.length || 0}
                    </h5>
                    <small className="text-muted">Preguntas</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border-end">
                    <h5 className="text-success">{instances.length}</h5>
                    <small className="text-muted">Instancias</small>
                  </div>
                </div>
                <div className="col-4">
                  <h5 className="text-info">
                    {instances.filter((i) => i.state === "open").length}
                  </h5>
                  <small className="text-muted">Activas</small>
                </div>
              </div>
            </div>
          </div>

          {/* Preguntas */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-question-circle me-2"></i>
                Preguntas
              </h5>
            </div>
            <div className="card-body">
              {survey.questions?.length > 0 ? (
                survey.questions.map((question, index) => (
                  <div key={index} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-2">
                          <span className="badge bg-primary me-2">
                            {index + 1}
                          </span>
                          {question.content}
                        </h6>
                        <span className="badge bg-secondary me-2">
                          {question.type === "text"
                            ? "Respuesta abierta"
                            : question.type === "single"
                            ? "Opción única"
                            : "Opción múltiple"}
                        </span>
                      </div>
                    </div>

                    {question.options?.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">Opciones:</small>
                        <ul className="list-unstyled ms-3 mt-1">
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex} className="mb-1">
                              <i className="fas fa-circle fa-xs text-muted me-2"></i>
                              {option.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted">No hay preguntas definidas</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar con instancias */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-copy me-2"></i>
                Últimas Instancias
              </h5>
            </div>
            <div className="card-body">
              {recentInstances.length > 0 ? (
                recentInstances.map((instance, index) => (
                  <div key={instance.id} className="mb-3 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Instancia #{index + 1}</h6>
                      <span
                        className={`badge ${
                          instance.state === "open"
                            ? "bg-success"
                            : instance.state === "closed"
                            ? "bg-danger"
                            : instance.state === "draft"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {instance.state === "open" && "Abierta"}
                        {instance.state === "closed" && "Cerrada"}
                        {instance.state === "draft" && "Borrador"}
                        {!["open", "closed", "draft"].includes(
                          instance.state
                        ) &&
                          (instance.state || "Desconocido")}
                      </span>
                    </div>
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      {new Date(instance.creation_date).toLocaleDateString()}
                    </small>
                    {instance.closure_date && (
                      <div>
                        <small className="text-muted">
                          <i className="fas fa-calendar-times me-1"></i>
                          Cerrada:{" "}
                          {new Date(instance.closure_date).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                    <div className="mt-2">
                      <Link
                        to={`/encuesta/${survey.id}/instancia/${instance.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No hay instancias creadas</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <div
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">
                Confirmar eliminación
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Cerrar"
                disabled={actionLoading}
              ></button>
            </div>
            <div className="modal-body">
              ¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no
              se puede deshacer.
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteSurvey}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyDetail;