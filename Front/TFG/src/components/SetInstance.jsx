import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Send, AlertCircle, CheckCircle } from 'lucide-react';

const SetInstance = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { surveyId } = useParams();

  const [survey, setSurvey] = useState(null);
  const [instanceData, setInstanceData] = useState({
    closure_date: '',
    state: 'open'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });





  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`${API_URL}/surveys/${surveyId}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSurvey(data);
      } else {
        setMessage({ type: 'error', text: 'Error al cargar los datos de la encuesta' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al cargar la encuesta' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInstanceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (instanceData.state === 'open' && instanceData.closure_date && new Date(instanceData.closure_date) <= new Date()) {
      setMessage({ type: 'error', text: 'La fecha de cierre debe ser futura' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        survey_id: surveyId,
        state: instanceData.state
      };

      if (instanceData.state === 'open' && instanceData.closure_date) {
        payload.closure_date = instanceData.closure_date;
      }

      const response = await fetch(`${API_URL}/surveys/${surveyId}/instances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: `Instancia de "${survey.title}" creada exitosamente.` });

        setInstanceData({ closure_date: '', state: 'open' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Error al crear la instancia' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-3">Lanzar Instancia de Encuesta</h1>
      <p className="text-muted mb-4">Configura y lanza una nueva instancia de encuesta</p>

      {message.text && (
        <div className={`alert d-flex align-items-center ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
          {message.type === 'success' ? <CheckCircle className="me-2" size={20} /> : <AlertCircle className="me-2" size={20} />}
          {message.text}
        </div>
      )}
      {survey ? (
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h5>Información de la Encuesta</h5>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{survey.title}</h5>
                <p className="card-text"><strong>Descripción:</strong> {survey.description || 'Sin descripción'}</p>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="state" className="form-label">Estado de la Instancia</label>
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

          {instanceData.state === 'open' && (
            <div className="mb-3">
              <label htmlFor="closure_date" className="form-label">Fecha de Cierre</label>
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
