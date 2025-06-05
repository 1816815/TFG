import { Routes, Route } from "react-router-dom";
import ChartDemo from "./Chart";
import Crono from "./Crono";
import Auth from "./Auth";
import AdminPanel from "./AdminPanel";
import Profile from "./Profile";
import RoleProtectedRoute from "./RoleProtectedRoute";
import AuthProtectedRoute from "./AuthProtectedRoute";
import Logout from "./Logout";
import SurveyForm from "./SurveyForm";
import SurveyList from "./SurveyList";
import SurveyDetail from "./SurveyDetail";
import SetInstance from "./SetInstance";
import InstancesList from "./InstancesList";
import InstanceSettings from "./InstanceSettings";
import SurveyConfiguration from "./SurveyConfiguration";



/**
 * Component that defines the routes for the application.
 *
 * The routes are as follows:
 *
 * - `/`: Chart demo
 * - `/crono`: Crono
 * - `/login`: Login page
 * - `/register`: Register page
 * - `/logout`: Logout page
 *
 * The following routes are protected by authentication.
 *
 * - `/admin`: Admin panel. Only accessible by users with the role "admin".
 *
 * The following routes are protected by authentication, but do not require a
 * specific role.
 *
 * - `/profile`: User profile page
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ChartDemo />} />
      <Route path="/crono" element={<Crono />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
       <Route path="/logout" element={<Logout />} />

      <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

    <Route element={<RoleProtectedRoute allowedRoles={["admin", "client"]} />}>
      <Route path="/nueva-encuesta" element={<SurveyForm />} />
       <Route path="/editar-encuesta/:surveyId" element={<SurveyForm />} />
        <Route path="/mis-encuestas" element={<SurveyList />} />
         <Route path="/encuesta/:surveyId" element={<SurveyDetail />} />
         <Route path="/encuesta/:surveyId/instanciar" element={<SetInstance />} />
         <Route path="/encuesta/:surveyId/lista" element={<InstancesList />} />
         <Route path="/encuesta/:surveyId/configuracion/:instanceId" element={<SurveyConfiguration />} />

      

    </Route>
      <Route element={<AuthProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
