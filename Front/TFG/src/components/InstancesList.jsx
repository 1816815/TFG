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
import DateStatusFilter from "./DateStatusFilter";

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
    navigate(`/encuesta/${surveyId}/instancia/${instanceId}/resultados`);
  };

  const handleCreateInstance = () => {
    navigate(`/encuesta/${surveyId}/instanciar`);
  };

  const handleBackToSurvey = () => {
    navigate(`/encuesta/${surveyId}`);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <Loader2
          className="me-2"
          size={32}
          style={{ animation: "spin 1s linear infinite" }}
        />
        <span className="text-muted">Cargando instancias...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 shadow-sm">
        <div className="d-flex align-items-center">
          <AlertCircle className="me-2" size={20} />
          <h5 className="alert-heading mb-0">Error al cargar las instancias</h5>
        </div>
        <p className="mt-2 mb-3">{error}</p>
        <button onClick={fetchInstances} className="btn btn-danger">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Breadcrumb y Header */}
      <div className="mb-4">
        <button
          onClick={handleBackToSurvey}
          className="btn btn-link text-decoration-none p-0 d-flex align-items-center text-muted"
        >
          <ArrowLeft className="me-2" size={16} />
          Volver a la encuesta
        </button>
      </div>

      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8">
          <h2 className="h3 mb-1">Instancias</h2>
          <p className="text-muted mb-0">
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
            {filteredInstances.length === 0
              ? "No se encontraron instancias con los filtros aplicados."
              : "Aún no se han creado instancias para esta encuesta."}
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredInstances.map((instance) => (
            <div className="col-12 col-lg-6 col-xl-4" key={uuid()}>
              <div
                className="card h-100 shadow-sm border-0 hover-shadow"
                style={{ transition: "all 0.2s ease-in-out" }}
              >
                <div className="card-header bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 me-3">
                      <h6 className="card-title mb-1 fw-bold text-dark">
                        {instance.survey.title || `Instancia #${instance.id}`}
                      </h6>
                      {instance.survey.description && (
                        <p
                          className="text-muted small mb-0"
                          style={{ fontSize: "0.85rem" }}
                        >
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
                      className={`${getStatusColor(instance.state)} fs-7`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {instance.state === "open" && "Abierta"}
                      {instance.state === "closed" && "Cerrada"}
                      {instance.state === "draft" && "Borrador"}
                      {!["open", "closed", "draft"].includes(instance.state) &&
                        (instance.state || "Desconocido")}
                    </span>
                  </div>
                </div>

                <div className="card-body py-3">
                  {/* Estadísticas en formato compacto */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded p-2 me-2">
                          <Calendar className="text-primary" size={14} />
                        </div>
                        <div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Creada
                          </div>
                          <div
                            className="fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {formatDate(instance.creation_date).split(" ")[0]}
                          </div>
                          {instance.closure_date && (
                            <>
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {instance.state === "open" && "Se cierra en"}
                                {instance.state === "closed" && "Cerrada el"}
                              </div>
                              <div
                                className="fw-semibold"
                                style={{ fontSize: "0.8rem" }}
                              >
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
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Participantes
                          </div>
                          <div
                            className="fw-bold text-success"
                            style={{ fontSize: "1.1rem" }}
                          >
                            {instance.total_participations || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="border-top pt-3">
                    <div
                      className="d-flex justify-content-between align-items-center text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <span>ID: #{instance.id}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-white border-top-0 pt-0 pb-3">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center"
                      onClick={() => handleViewInstance(instance.id)}
                      style={{ fontSize: "0.8rem" }}
                    >
                      <Eye className="me-1" size={12} />
                      Ver
                    </button>

                    <button
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
                      onClick={() => handleEditInstance(instance.id)}
                      style={{ fontSize: "0.8rem", minWidth: "40px" }}
                    >
                      <Settings size={12} />
                    </button>

                    <button
                      className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center"
                      onClick={() => handleViewResults(instance.id)}
                      style={{ fontSize: "0.8rem", minWidth: "40px" }}
                    >
                      <BarChart3 size={12} />
                    </button>
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

export default InstancesList;
