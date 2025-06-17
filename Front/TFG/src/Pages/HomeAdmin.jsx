import { useSelector } from "react-redux";
import useSurveys from "../hooks/useSurveys";
import useInstance from "../hooks/useInstance";
import { useEffect } from "react";
import useUser from "../hooks/useUser";

export const HomeAdmin = () => {
  const user = useSelector((state) => state.user.user);
  const { loadPublicInstances } = useInstance();
  const { loadSurveys } = useSurveys();
  const { getAllUsers } = useUser();

  const users = useSelector((state) => state.user.users);
  const surveys = useSelector((state) => state.surveys.items);
  const publicInstances = useSelector((state) => state.instances.publicInstances);

  useEffect(() => {
    loadPublicInstances();
    loadSurveys();
    getAllUsers();
  }, []);

  const loading = !users || !surveys || !publicInstances;

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Cargando datos del panel de administración...</p>
      </div>
    );
  }

  const activeUsersCount = users.filter((u) => u.is_active).length;
  const totalSurveysCount = surveys.length;
  const openInstancesCount = publicInstances.length;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Panel de Administración</h1>

      <div className="row g-4">
        {/* Usuarios activos */}
        <div className="col-md-4">
          <div className="card text-white bg-primary h-100 shadow-sm">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-people-fill fs-1 me-3"></i>
              <div>
                <h5 className="card-title">Usuarios Activos</h5>
                <p className="card-text fs-4 fw-bold mb-0">{activeUsersCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Encuestas totales */}
        <div className="col-md-4">
          <div className="card text-white bg-success h-100 shadow-sm">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-ui-checks fs-1 me-3"></i>
              <div>
                <h5 className="card-title">Encuestas Totales</h5>
                <p className="card-text fs-4 fw-bold mb-0">{totalSurveysCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instancias abiertas */}
        <div className="col-md-4">
          <div className="card text-white bg-warning h-100 shadow-sm">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-bar-chart-line-fill fs-1 me-3"></i>
              <div>
                <h5 className="card-title">Instancias Abiertas</h5>
                <p className="card-text fs-4 fw-bold mb-0">{openInstancesCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 export default HomeAdmin