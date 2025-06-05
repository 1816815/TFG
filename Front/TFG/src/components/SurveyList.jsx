import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { accessToken, user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

    const fetchSurveyInstances = async () => {
    try {
      const response = await fetch(
        `${API_URL}/surveys/${surveyId}/instances/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInstances(data);
      }
    } catch (error) {
      console.error("Error al cargar instancias:", error);
    }
  };



  useEffect(() => {
    fetchSurveys();
  }, []);
  


  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/surveys/`, {
        headers: {
         'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      } else {
        setError('Error al cargar las encuestas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Encuestas</h2>
        <Link to="/nueva-encuesta" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Nueva Encuesta
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="fas fa-poll fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted">No tienes encuestas creadas</h4>
          <p className="text-muted">Crea tu primera encuesta para comenzar</p>
          <Link to="/nueva-encuesta" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Crear Primera Encuesta
          </Link>
        </div>
      ) : (
        <div className="row">
          {surveys.map((survey) => (
            <div key={survey.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{survey.title}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {survey.description.length > 100 
                      ? `${survey.description.substring(0, 100)}...` 
                      : survey.description
                    }
                  </p>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">
                        <i className="fas fa-question-circle me-1"></i>
                        {survey.questions?.length || 0} preguntas
                      </small>
                      <small className="text-muted">
                        <i className="fas fa-copy me-1"></i>
                        {survey.instances_count || 0} instancias
                       
                      </small>
                    </div>
                    
                    <Link 
                      to={`/encuesta/${survey.id}`} 
                      className="btn btn-outline-primary w-100"
                    >
                      <i className="fas fa-eye me-2"></i>
                      Ver Detalles
                    </Link>
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

export default SurveyList;