import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import useSurveys from '../hooks/useSurveys';
import useInstance from '../hooks/useInstance';

const SetInstance = () => {
  const { surveyId } = useParams();
  const { loadSurveyById } = useSurveys();
  const { createNewInstance } = useInstance();

  const survey = useSelector(state => state.surveys.currentSurvey);
  const { loading, error } = useSelector(state => state.instances);

  const [instanceData, setInstanceData] = useState({
    closure_date: '',
    state: 'open',
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSurveyById(surveyId);
  }, [surveyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInstanceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de fecha de cierre
    if (
      instanceData.state === 'open' &&
      instanceData.closure_date &&
      new Date(instanceData.closure_date) <= new Date()
    ) {
      setMessage({ type: 'error', text: 'La fecha de cierre debe ser futura' });
      return;
    }

    // Preparar los datos a enviar
    const payload = {
      survey_id: surveyId,
      state: instanceData.state,
    };

    if (instanceData.state === 'open' && instanceData.closure_date) {
      payload.closure_date = instanceData.closure_date;
    }

    // Llamada al hook que hace dispatch de la acción de Redux
    createNewInstance(payload)
      .then(() => {
        setMessage({
          type: 'success',
          text: `Instancia de "${survey.title}" creada exitosamente.`,
        });
        setInstanceData({ closure_date: '', state: 'open' });
      })
      .catch((err) => {
        setMessage({
          type: 'error',
          text: err?.message || 'Error al crear la instancia.',
        });
      });
  };

  return (
    <div className="container py-5">
      <h1 className="mb-3">Lanzar Instancia de Encuesta</h1>
      <p className="text-muted mb-4">Configura y lanza una nueva instancia de encuesta</p>

      {/* Mensaje de error o éxito */}
      {message.text && (
        <div
          className={`alert d-flex align-items-center ${
            message.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
          role="alert"
        >
          {message.type === 'success' ? (
            <CheckCircle className="me-2" size={20} />
          ) : (
            <AlertCircle className="me-2" size={20} />
          )}
          {message.text}
        </div>
      )}

      {/* Si la encuesta se carga, mostrar el formulario */}
      {survey ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h5>Información de la Encuesta</h5>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{survey.title}</h5>
                <p className="card-text">
                  <strong>Descripción:</strong> {survey.description || 'Sin descripción'}
                </p>
              </div>
            </div>
          </div>

          {/* Selección de estado de la instancia */}
          <div className="mb-3">
            <label htmlFor="state" className="form-label">
              Estado de la Instancia
            </label>
            <select
              id="state"
              name="state"
              className="form-select"
              value={instanceData.state}
              onChange={handleInputChange}
            >
              <option value="open">Abierta</option>
              <option value="draft">Borrador</option>
            </select>
          </div>

          {/* Campo de fecha de cierre solo si el estado es "open" */}
          {instanceData.state === 'open' && (
            <div className="mb-3">
              <label htmlFor="closure_date" className="form-label">
                Fecha de Cierre
              </label>
              <input
                type="datetime-local"
                id="closure_date"
                name="closure_date"
                className="form-control"
                value={instanceData.closure_date}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}

          <div className="alert alert-warning">
            <strong>Nota:</strong> La fecha de creación se asignará automáticamente.
          </div>

          {/* Botón de submit con spinner si está cargando */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Creando...
              </>
            ) : (
              <>
                <Send className="me-2" size={18} />
                Lanzar Instancia
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="spinner-border text-secondary" role="status" />
          <p className="mt-3">Cargando datos de la encuesta...</p>
        </div>
      )}
    </div>
  );
};

export default SetInstance;
