import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ExportButton from "../components/ExportButton";
import useInstance from "../hooks/useInstance";
import useParticipation from "../hooks/useParticipations";
import { useParams } from "react-router-dom";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

const SurveyConfiguration = () => {
  const { surveyId, instanceId } = useParams();
  const { loadInstanceById, closeExistingInstance } = useInstance();
  const { loadParticipations, removeParticipation, loadExportData } =
    useParticipation();

  const instance = useSelector((state) => state.instances.currentInstance);
  const { navigateWithFlash } = useFlashRedirect();
  const questions = instance?.survey_questions || [];
  const loadingInstances = useSelector((state) => state.instances.loading);
  const loadingExport = useSelector((state) => state.participations.loading);
  const error = useSelector((state) => state.instances.error);
  const exportData = useSelector((state) => state.participations.exportData);

  // Estado para el modal de confirmación de eliminación de participación
  const [participationToDelete, setParticipationToDelete] = useState(null);

  useEffect(() => {
    if (instanceId) {
      loadInstanceById(instanceId);
      loadExportData(instanceId);
    }
  }, [instanceId]);

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { pagination } = useSelector((state) => state.participations);
  const total = pagination.total;

  useEffect(() => {
    if (instanceId) {
      loadParticipations(instanceId, { page, page_size: pageSize });
    }
  }, [instanceId, page]);

  const participations = useSelector((state) => state.participations.items);

  const handleDeleteParticipation = (participationId) => {
    setParticipationToDelete(participationId);
  };

  const confirmDeleteParticipation = () => {
    if (participationToDelete) {
      removeParticipation(instanceId, participationToDelete).then(() =>
        loadParticipations(instanceId, {
          page,
          page_size: pageSize,
        })
      );
      navigateWithFlash(
        `/encuesta/${surveyId}/configuracion/${instanceId}`,
        "Participación eliminada",
        "error"
      );
      setParticipationToDelete(null);
    }
  };

  const handleCloseInstance = (instanceId) => {
    closeExistingInstance(instanceId)
      .then(() => {
        navigateWithFlash(
          `/encuesta/${surveyId}/lista`,
          "La instancia fue eliminada correctamente.",
          "success"
        );
      })
      .catch(() => {
        navigateWithFlash(
          `/encuesta/${surveyId}/configuracion/${instanceId}`,
          "Error al eliminar la instancia.",
          "error"
        );
      });
  };

const copyLink = () => {
  const link = `https://cuestamarket.duckdns.org/encuestas/${instanceId}/responder`;

  navigator.clipboard.writeText(link)
    .then(() => {
      const toastEl = document.getElementById('copyToast');
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    })
    .catch((err) => {
      console.error('Error al copiar el enlace:', err);
    });
};


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mt-4">
        <h2>Configuración de Encuesta</h2>
        {instance?.state === "open" && (
          <button className="btn btn-primary" onClick={copyLink}>
            Copiar Link a la Encuesta
          </button>
        )}

        <button
          className="btn btn-outline-danger"
          data-bs-toggle="modal"
          data-bs-target="#deleteInstanceModal"
        >
          Eliminar Instancia
        </button>
      </div>

      <section className="mt-5">
        <h4>Participaciones</h4>
        {loadingInstances ? (
          <p>Cargando...</p>
        ) : (
          <>
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {participations.map((p) => (
                  <tr key={p.id}>
                    <td>{p.user?.username || "Anónimo"}</td>
                    <td>{new Date(p.date).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-info">{p.state}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteParticipation(p.id)}
                        data-bs-toggle="modal"
                        data-bs-target="#deleteParticipationModal"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <nav>
              <ul className="pagination">
                {[...Array(Math.ceil(total / pageSize)).keys()].map((i) => (
                  <li
                    key={i}
                    className={`page-item ${page === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
      </section>

      <section className="mt-5">
        <h4>Exportar Respuestas</h4>
        {error && <p className="text-danger">{error}</p>}
        {loadingExport && <p>Cargando datos para exportar...</p>}

        {!loadingExport && exportData && instance && (
          <ExportButton exportData={exportData} instance={instance} />
        )}
      </section>

      <section className="mt-4">
        <h4>Preguntas</h4>
        <ul className="list-group">
          {questions.map((q) => (
            <li key={q.id} className="list-group-item">
              <strong>{q.content}</strong>
              {q.options?.length > 0 && (
                <ul>
                  {q.options.map((opt) => (
                    <li key={opt.id}>{opt.content}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Modal para eliminar instancia */}
      <div
        className="modal fade"
        id="deleteInstanceModal"
        tabIndex="-1"
        aria-labelledby="deleteInstanceModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteInstanceModalLabel">
                Confirmar eliminación
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              ¿Estás seguro de que deseas eliminar esta instancia? Esta acción
              no se puede deshacer.
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleCloseInstance(instanceId)}
                data-bs-dismiss="modal"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para eliminar participación */}
      <div
        className="modal fade"
        id="deleteParticipationModal"
        tabIndex="-1"
        aria-labelledby="deleteParticipationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteParticipationModalLabel">
                Confirmar eliminación
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              ¿Estás seguro de que deseas eliminar esta participación? Esta
              acción no se puede deshacer.
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setParticipationToDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDeleteParticipation}
                data-bs-dismiss="modal"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Toast para copiar enlace */}
      <div className="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div
          id="copyToast"
          className="toast align-items-center text-bg-success border-0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">¡Enlace copiado al portapapeles!</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Cerrar"
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyConfiguration;
