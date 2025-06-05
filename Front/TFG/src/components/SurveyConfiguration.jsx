import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const SurveyConfiguration = () => {
  const { surveyId, instanceId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [exportData, setExportData] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const headers = {
    'Content-Type': 'application/json',
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys/${surveyId}/configuration/${surveyId}/questions`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error cargando preguntas:', error);
    }
  };

  const fetchParticipations = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/surveys/${surveyId}/configuration/${surveyId}/participations?page=${pageNum}&page_size=${pageSize}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      setParticipations(data.results);
      setPage(data.page);
      setTotal(data.total);
    } catch (error) {
      console.error('Error cargando participaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportResponses = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys/${surveyId}/configuration/${surveyId}/export-data`, {
        method: 'GET',
        headers,
      });
      const data = await res.json();
      setExportData(data);
    } catch (error) {
      console.error('Error exportando datos:', error);
    }
  };

  const deleteParticipation = async (participationId) => {
    try {
      await fetch(`${API_URL}/surveys/${surveyId}/configuration/${surveyId}/participations/${participationId}`, {
        method: 'DELETE',
        headers,
      });
      fetchParticipations(page);
    } catch (error) {
      console.error('Error eliminando participación:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchParticipations();
  }, [surveyId]);

  return (
    <div className="container mt-4">
      <h2>Configuración de Encuesta</h2>

      <section className="mt-4">
        <h4>Preguntas</h4>
        <ul className="list-group">
          {questions.map(q => (
            <li key={q.id} className="list-group-item">
              <strong>{q.content}</strong>
              {q.options?.length > 0 && (
                <ul>
                  {q.options.map(opt => (
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
        {loading ? (
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
                {participations.map(p => (
                  <tr key={p.id}>
                    <td>{p.user?.username || 'Anónimo'}</td>
                    <td>{new Date(p.date).toLocaleString()}</td>
                    <td><span className="badge bg-info">{p.state}</span></td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteParticipation(p.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <nav>
              <ul className="pagination">
                {[...Array(Math.ceil(total / pageSize)).keys()].map(i => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => fetchParticipations(i + 1)}>
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
        <button className="btn btn-outline-primary" onClick={exportResponses}>
          Exportar
        </button>

        {exportData && (
          <div className="mt-3">
            <h5>{exportData.survey_title}</h5>
            <p>Exportado: {exportData.export_date}</p>
            <p>Total respuestas: {exportData.total_responses}</p>
            <pre style={{ maxHeight: 300, overflowY: 'auto', backgroundColor: '#f8f9fa', padding: 10 }}>
              {JSON.stringify(exportData.data, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default SurveyConfiguration;
