import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Users,
  FileText,
  Calendar,
  AlertCircle,
} from "lucide-react";

const InstanceSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [exportData, setExportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    hasNext: false,
  });

  const { instanceId, surveyId } = useParams();

  useEffect(() => {
    if (instanceId && surveyId) {
      if (activeTab === "questions") {
        fetchQuestions(surveyId);
      } else if (activeTab === "participations") {
        fetchParticipations(instanceId);
      }
    }
  }, [instanceId, activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/surveys/${surveyId}/configuration`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
    } catch (error) {}
  };

  // Función para obtener participaciones
  const fetchParticipations = async (instanceId, page = 1, pageSize = 20) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/${instanceId}/participations/?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar las participaciones");
      }

      const data = await response.json();
      setParticipations(data.results);
      setPagination({
        page: data.page,
        pageSize: data.page_size,
        total: data.total,
        hasNext: data.has_next,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar datos
  const handleExportData = async () => {
    if (!instanceId) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/${instanceId}/export-data/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al exportar los datos");
      }

      const data = await response.json();
      setExportData(data);

      // Crear y descargar archivo CSV
      const csvContent = generateCSV(data.data, data.headers);
      downloadCSV(csvContent, `${data.survey_title}_${data.export_date}.csv`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar participación
  const handleDeleteParticipation = async (participationId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta participación?"
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/${instanceId}/participations/${participationId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la participación");
      }

      // Recargar participaciones
      fetchParticipations(instanceId, pagination.page, pagination.pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generar CSV
  const generateCSV = (data, headers) => {
    const csvHeaders = headers.join(",");
    const csvRows = data.map((row) =>
      headers.map((header) => `"${row[header] || ""}"`).join(",")
    );
    return [csvHeaders, ...csvRows].join("\n");
  };

  // Descargar CSV
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manejar cambio de tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-ES");
  };

  // Renderizar tipo de pregunta
  const renderQuestionType = (type) => {
    const types = {
      single_choice: "Opción única",
      multiple_choice: "Opción múltiple",
      text: "Texto libre",
    };
    return types[type] || type;
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="mb-4">
            <h1 className="h3 mb-2">Configuración de Encuesta</h1>
            <p className="text-muted">
              Gestiona las preguntas, participaciones y exporta datos de la
              encuesta
            </p>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "questions" ? "active" : ""
                }`}
                onClick={() => handleTabChange("questions")}
                type="button"
                role="tab"
              >
                <FileText size={16} className="me-2" />
                Preguntas
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "participations" ? "active" : ""
                }`}
                onClick={() => handleTabChange("participations")}
                type="button"
                role="tab"
              >
                <Users size={16} className="me-2" />
                Participaciones
              </button>
            </li>
          </ul>

          {/* Botón de exportar */}
          <div className="mb-4">
            <button
              onClick={handleExportData}
              disabled={loading}
              className="btn btn-success"
            >
              <Download size={16} className="me-2" />
              Exportar Datos
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="alert alert-danger d-flex align-items-center mb-4"
              role="alert"
            >
              <AlertCircle size={20} className="me-2" />
              <div>{error}</div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="tab-content">
            {/* Tab de Preguntas */}
            {activeTab === "questions" && !loading && (
              <div className="tab-pane fade show active">
                {questions.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No hay preguntas disponibles</p>
                  </div>
                ) : (
                  <div className="row">
                    {questions.map((question) => (
                      <div key={question.id} className="col-12 mb-4">
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h5 className="card-title mb-0">
                                {question.content}
                              </h5>
                              <div className="d-flex gap-2">
                                <span className="badge bg-primary">
                                  {renderQuestionType(question.question_type)}
                                </span>
                                {question.required && (
                                  <span className="badge bg-danger">
                                    Obligatoria
                                  </span>
                                )}
                              </div>
                            </div>

                            {question.options &&
                              question.options.length > 0 && (
                                <div>
                                  <h6 className="text-muted mb-2">Opciones:</h6>
                                  <ul className="list-unstyled">
                                    {question.options.map((option) => (
                                      <li key={option.id} className="mb-1">
                                        <small className="text-muted">
                                          • {option.content}
                                        </small>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab de Participaciones */}
            {activeTab === "participations" && !loading && (
              <div className="tab-pane fade show active">
                {participations.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      No hay participaciones disponibles
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th scope="col">Usuario</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participations.map((participation) => (
                            <tr key={participation.id}>
                              <td>
                                {participation.user?.username || "Anónimo"}
                              </td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(participation.date)}
                                </small>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    participation.state === "completed"
                                      ? "bg-success"
                                      : "bg-warning"
                                  }`}
                                >
                                  {participation.state === "completed"
                                    ? "Completada"
                                    : participation.state}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() =>
                                    handleDeleteParticipation(participation.id)
                                  }
                                  className="btn btn-outline-danger btn-sm"
                                  title="Eliminar participación"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginación */}
                    {pagination.total > pagination.pageSize && (
                      <nav aria-label="Paginación de participaciones">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="text-muted small">
                            Mostrando{" "}
                            {(pagination.page - 1) * pagination.pageSize + 1} a{" "}
                            {Math.min(
                              pagination.page * pagination.pageSize,
                              pagination.total
                            )}{" "}
                            de {pagination.total} resultados
                          </div>
                          <ul className="pagination mb-0">
                            <li
                              className={`page-item ${
                                pagination.page === 1 ? "disabled" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() =>
                                  fetchParticipations(
                                    instanceId,
                                    pagination.page - 1,
                                    pagination.pageSize
                                  )
                                }
                                disabled={pagination.page === 1}
                              >
                                Anterior
                              </button>
                            </li>
                            <li className="page-item active">
                              <span className="page-link">
                                {pagination.page}
                              </span>
                            </li>
                            <li
                              className={`page-item ${
                                !pagination.hasNext ? "disabled" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() =>
                                  fetchParticipations(
                                    instanceId,
                                    pagination.page + 1,
                                    pagination.pageSize
                                  )
                                }
                                disabled={!pagination.hasNext}
                              >
                                Siguiente
                              </button>
                            </li>
                          </ul>
                        </div>
                      </nav>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceSettings;
