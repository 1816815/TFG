import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ExportButton from "../components/ExportButton";
import useInstance from "../hooks/useInstance";
import useParticipation from "../hooks/useParticipations";
import { useParams } from "react-router-dom";
import { useFlashRedirect } from "../hooks/useFlashRedirect";


const SurveyConfiguration = () => {
  const { surveyId, instanceId } = useParams();
  const { loadInstanceById } = useInstance();
  const { loadParticipations, removeParticipation, loadExportData } =
    useParticipation();

  const instance = useSelector((state) => state.instances.currentInstance);
  const {navigateWithFlash} = useFlashRedirect();
  const questions = instance?.survey_questions || [];
  const loadingInstances = useSelector((state) => state.instances.loading);
  const loadingExport = useSelector((state) => state.participations.loading);
  const error = useSelector((state) => state.instances.error);
  const exportData = useSelector((state) => state.participations.exportData);

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
  if (window.confirm("¿Estás seguro de que deseas eliminar esta participación?")) {
    removeParticipation(instanceId, participationId).then(() =>
      loadParticipations(instanceId, {
        page,
        page_size: pageSize,
      })
    );
    navigateWithFlash(`/encuesta/${surveyId}/configuracion/${instanceId}`, "Participación eliminada", "error");
  }
};

  return (
    <div className="container mt-4">
      <h2>Configuración de Encuesta</h2>

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

        {!loadingExport && exportData && (
          <ExportButton
            data={exportData.data}
            headers={exportData.headers}
            surveyTitle={exportData.surveyTitle}
            exportDate={exportData.exportDate}
          />
        )}
      </section>
    </div>
  );
};

export default SurveyConfiguration;
