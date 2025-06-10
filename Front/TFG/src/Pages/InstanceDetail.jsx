import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useInstance from "../hooks/useInstance";

const InstanceDetail = () => {
  const { instanceId } = useParams();
  const { loadInstanceById, updateExistingInstance } = useInstance();
  const [desiredState, setDesiredState] = useState("draft");
  const [closureDate, setClosureDate] = useState("");
  const { loading, error } = useSelector(state => state.instances);
  const [message, setMessage] = useState("");

  const instance = useSelector((state) => state.instances.currentInstance);
  const questions = instance?.survey_questions || [];

  useEffect(() => {
    loadInstanceById(instanceId);
  }, [instanceId]);

  const getTomorrowMinDateTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const pad = (n) => n.toString().padStart(2, "0");

    const year = tomorrow.getFullYear();
    const month = pad(tomorrow.getMonth() + 1);
    const day = pad(tomorrow.getDate());
    const hours = pad(tomorrow.getHours());
    const minutes = pad(tomorrow.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getStateFromDate = (dateStr) => {
    if (!dateStr) return "Borrador";
    const now = new Date();
    const closure = new Date(dateStr);
    return now >= closure ? "Cerrada" : "Abierta";
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {};

    if (desiredState === "draft") {
      
      payload.closure_date = null;
    } else if (desiredState === "closed") {
      payload.closure_date = new Date().toISOString();
    } else if (desiredState === "open") {
      const chosenDate = new Date(closureDate);
      if (isNaN(chosenDate.getTime()) || chosenDate <= new Date()) {
        setMessage("Debe elegir una fecha futura para abrir la encuesta.");
        return;
      }
      payload.closure_date = chosenDate.toISOString();
    }
    
    const resultAction = updateExistingInstance(instanceId, payload);

    if (resultAction?.type?.endsWith("/fulfilled")) {
      setMessage("Instancia actualizada correctamente.");
    } else if (resultAction?.type?.endsWith("/rejected")) {
      setMessage(resultAction.payload || "Error al actualizar la instancia.");
    } else {
      setMessage("Respuesta inesperada del servidor.");
    }
  } catch (err) {
    console.error("Error inesperado al actualizar:", err);
    setMessage("Ocurrió un error inesperado.");
  }
};


  if (!instance) return <p>Cargando...</p>;


  return (
    <div className="container mt-4">
      <h2>Detalle de Instancia</h2>

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
      <div className="card mt-3">
        <div className="card-body">
          <h5 className="card-title">{instance.survey?.title}</h5>
          <p>
            <strong>Estado actual:</strong>{" "}
            {getStateFromDate(instance.closure_date)}
          </p>
          <p>
            <strong>Fecha de creación:</strong>{" "}
            {new Date(instance.creation_date).toLocaleString()}
          </p>
          <p>
            <strong>Fecha de cierre:</strong>{" "}
            {instance.closure_date
              ? new Date(instance.closure_date).toLocaleString()
              : "—"}
          </p>

          <div className="form-group mt-3">
            <label htmlFor="desired_state">Nuevo estado</label>
            <select
              className="form-select"
              value={desiredState}
              onChange={(e) => setDesiredState(e.target.value)}
              disabled={loading}
              name="desired_state"
              id="desired_state"
              
            >
              <option value="draft">Borrador</option>
              <option value="open">Abierta</option>
              <option value="closed">Cerrada</option>
            </select>
          </div>

          {desiredState === "open" && (
            <div className="form-group mt-3">
              <label htmlFor="closure_date">Fecha de cierre (futura)</label>
              <input
                type="datetime-local"
                name="closure_date"
                id="closure_date"
                className="form-control"
                min={getTomorrowMinDateTime()}
                value={closureDate}
                onChange={(e) => setClosureDate(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <button
            className="btn btn-primary mt-3"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>

          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default InstanceDetail;
