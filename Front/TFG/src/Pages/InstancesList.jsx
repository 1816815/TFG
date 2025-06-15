import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  BarChart3,
  Eye,
  Settings,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { v4 as uuid } from "uuid";
import useInstance from "../hooks/useInstance";
import { useSelector } from "react-redux";
import DateStatusFilter from "../components/DateStatusFilter";

const InstancesList = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { loadInstancesBySurvey } = useInstance();

  const instances = useSelector((state) => state.instances.instances);
  const [filteredInstances, setFilteredInstances] = useState(instances);
  const loading = useSelector((state) => state.instances.loading);
  const error = useSelector((state) => state.instances.error);

  useEffect(() => {
    if (surveyId) {
      loadInstancesBySurvey(surveyId);
    } else {
      console.error("ID de encuesta no encontrado en la URL");
    }
  }, [surveyId]);

  if (loading) {
    return <Loader2 className="animate-spin" />;
  }

  if (error) {
    return <AlertCircle className="text-red-500" />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const getStatusColor = (state) => {
    switch (state) {
      case "open":
        return "badge bg-success";
      case "closed":
        return "badge bg-danger";
      case "draft":
        return "badge bg-warning text-dark";
      default:
        return "badge bg-secondary";
    }
  };

  const handleViewInstance = (instanceId) => {
    navigate(`/encuesta/${surveyId}/instancia/${instanceId}`);
  };

  const handleEditInstance = (instanceId) => {
    navigate(`/encuesta/${surveyId}/configuracion/${instanceId}`);
  };

  const handleViewResults = (instanceId) => {
    navigate(`/encuesta/${surveyId}/estadisticas/${instanceId}`);
  };

  const handleCreateInstance = () => {
    navigate(`/encuesta/${surveyId}/instanciar`);
  };

  const handleBackToSurvey = () => {
    navigate(`/encuesta/${surveyId}`);
  };

  return (
    <>
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center text-muted">
          <Loader2
            className="mb-3"
            size={40}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <span className="fs-6">Cargando instancias...</span>
        </div>
      ) : error ? (
        <div
          className="alert alert-danger shadow-sm rounded p-4 my-5 mx-auto"
          style={{ maxWidth: 500 }}
        >
          <div className="d-flex align-items-center mb-2">
            <AlertCircle className="me-2" size={20} />
            <strong className="me-auto">Error al cargar las instancias</strong>
          </div>
          <p className="mb-3 small">{error}</p>
          <button
            onClick={fetchInstances}
            className="btn btn-sm btn-outline-light"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="container-fluid px-3 px-md-5 py-4">
          {/* Volver */}
          <div className="mb-4">
            <button
              onClick={handleBackToSurvey}
              className="btn btn-sm btn-link d-inline-flex align-items-center text-muted"
            >
              <ArrowLeft className="me-2" size={16} />
              Volver a la encuesta
            </button>
          </div>

          {/* Header */}
          <div className="row align-items-center mb-4">
            <div className="col-md-8">
              <h2 className="h4 mb-1 fw-bold">Instancias</h2>
              <p className="text-muted small mb-0">
                {filteredInstances.length} instancia
                {filteredInstances.length !== 1 ? "s" : ""} encontrada
                {filteredInstances.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button
                className="btn btn-primary d-flex align-items-center ms-auto"
                onClick={handleCreateInstance}
              >
                <Users className="me-2" size={16} />
                Nueva Instancia
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="row mb-4 align-items-end">
            <DateStatusFilter
              data={instances}
              dateField="creation_date"
              statusField="state"
              onFilter={setFilteredInstances}
            />
          </div>

          {/* Lista de instancias */}
          {filteredInstances.length === 0 ? (
            <div className="text-center py-5">
              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: "80px", height: "80px" }}
              >
                <Users className="text-muted" size={32} />
              </div>
              <h4 className="mb-2">No hay instancias</h4>
              <p className="text-muted">
                No se encontraron instancias con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredInstances.map((instance) => (
                <div className="col-12 col-lg-6 col-xl-4" key={uuid()}>
                  <div className="card h-100 shadow-sm border-0 rounded-3">
                    <div className="card-header bg-white border-bottom py-3 px-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 me-3">
                          <h6 className="card-title mb-1 fw-bold text-dark">
                            {instance.survey.title ||
                              `Instancia #${instance.id}`}
                          </h6>
                          {instance.survey.description && (
                            <p className="text-muted small mb-0">
                              {instance.survey.description.length > 60
                                ? `${instance.survey.description.substring(
                                    0,
                                    60
                                  )}...`
                                : instance.survey.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`badge ${getStatusColor(
                            instance.state
                          )} text-uppercase`}
                          style={{ fontSize: "0.7rem" }}
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
                    </div>

                    <div className="card-body py-3 px-3">
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded p-2 me-2">
                              <Calendar className="text-primary" size={14} />
                            </div>
                            <div>
                              <div className="text-muted small">Creada</div>
                              <div className="fw-semibold small">
                                {
                                  formatDate(instance.creation_date).split(
                                    " "
                                  )[0]
                                }
                              </div>
                              {instance.closure_date && (
                                <>
                                  <div className="text-muted small">
                                    {instance.state === "open" &&
                                      "Se cierra en"}
                                    {instance.state === "closed" &&
                                      "Cerrada el"}
                                  </div>
                                  <div className="fw-semibold small">
                                    {
                                      formatDate(instance.closure_date).split(
                                        " "
                                      )[0]
                                    }
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded p-2 me-2">
                              <Users className="text-success" size={14} />
                            </div>
                            <div>
                              <div className="text-muted small">
                                Participantes
                              </div>
                              <div className="fw-bold text-success fs-6">
                                {instance.total_participations || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-top pt-3">
                        <div className="d-flex justify-content-between align-items-center text-muted small">
                          <span>ID: #{instance.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer bg-white border-top-0 pt-0 pb-3 px-3">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                          onClick={() => handleViewInstance(instance.id)}
                        >
                          <Eye className="me-1" size={14} />
                          Ver
                        </button>

                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleEditInstance(instance.id)}
                          title="Editar"
                        >
                          <Settings size={14} />
                        </button>
                        {instance.state !== "draft" && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleViewResults(instance.id)}
                            title="Ver resultados"
                          >
                            <BarChart3 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default InstancesList;
