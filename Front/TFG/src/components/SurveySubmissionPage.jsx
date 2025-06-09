import React, { useEffect, useState } from 'react';
import SurveyResponseForm from './SurveyResponseForm';

export const SurveySubmissionPage = ({ instanceId }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [surveyInstance, setSurveyInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchInstance = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/survey-instances/${instanceId}/configuration/`);
        if (!response.ok) throw new Error('Error al cargar la encuesta');
        const data = await response.json();
        setSurveyInstance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInstance();
  }, [instanceId]);

  const handleSubmitAnswers = async (answers) => {
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_URL}/survey-submission/${instanceId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.message || 'Respuestas enviadas correctamente');
      } else {
        setError(data.message || 'Error al enviar respuestas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  if (loading) return <p>Cargando encuesta...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (successMsg) return <p style={{ color: 'green' }}>{successMsg}</p>;

  if (!surveyInstance) return null;

  return (
    <div>
      <h2>{surveyInstance.survey.title}</h2>
      <SurveyResponseForm surveyInstance={surveyInstance} onSubmit={handleSubmitAnswers} />
    </div>
  );
};
