import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useInstance from '../hooks/useInstance';

const PublicSurveyList = () => {
  const dispatch = useDispatch();

  const { loadPublicInstances } = useInstance();
  const publicInstances = useSelector(state => state.instances.publicInstances);
  const loading = useSelector(state => state.instances.loading);
  const error = useSelector(state => state.instances.error);

  useEffect(() => {
    loadPublicInstances();
    
  }, [dispatch]);

  return (
    <div>
      <h2>Encuestas Públicas Abiertas</h2>
      {loading && <p>Cargando encuestas...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && publicInstances.length === 0 && (
        <p>No hay encuestas disponibles.</p>
      )}
      <ul>
        {publicInstances.map((survey) => (
          <li key={survey.id}>
            <strong>{survey.survey.title}</strong> - Creada el:{" "}
            {new Date(survey.creation_date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicSurveyList;
