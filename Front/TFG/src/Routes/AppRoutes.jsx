import { Routes, Route } from "react-router-dom";
import ChartDemo from "../components/Chart";
import Crono from "../components/Crono";
import Auth from "../Pages/Auth";
import AdminPanel from "../Pages/AdminPanel";
import Profile from "../Pages/Profile";
import RoleProtectedRoute from "./RoleProtectedRoute";
import AuthProtectedRoute from "./AuthProtectedRoute";
import Logout from "../components/Logout";
import SurveyForm from "../Pages/SurveyForm";
import SurveyList from "../Pages/SurveyList";
import SurveyDetail from "../Pages/SurveyDetail";
import SetInstance from "../Pages/SetInstance";
import InstancesList from "../Pages/InstancesList";
import SurveyConfiguration from "../Pages/SurveyConfiguration";
import InstanceDetail from "../Pages/InstanceDetail";
import PublicSurveyList from "../Pages/PublicSurveyList";
import AnswerForm from "../Pages/AnswerForm";
import Activate from "../components/Activate";
import ForgotPassword from "../Pages/ForgotPassword";
import ResetPassword from "../Pages/ResetPassword";
import ChangePassword from "../Pages/ChangePassword";
import Layout from "./Layout";
import LandingPage from "../Pages/LandingPage";
import NotFound from "../components/NotFound";
import { SurveyStats } from "../Pages/SurveyStats";
import { HomeVoter } from "../Pages/HomeVoter";



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
      <Route element={<Layout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/crono" element={<Crono />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
       <Route path="/logout" element={<Logout />} />
       <Route path="/activar/:uid/:token" element={<Activate />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />



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
          <Route path="/encuesta/:surveyId/estadisticas/:instanceId" element={<SurveyStats />} />
         <Route path="/encuesta/:surveyId/instancia/:instanceId" element={<InstanceDetail />} />
    </Route>
    <Route element={<RoleProtectedRoute allowedRoles={["admin","voter"]} />}>
    <Route path="/home-voter" element={<HomeVoter />} />
    </Route>

    <Route element={<RoleProtectedRoute allowedRoles={["admin", "client", "voter"]} />} >
    <Route path="/encuestas" element={<PublicSurveyList />} />
    <Route path="/encuestas/:instanceId/responder" element={<AnswerForm />} />
    </Route>

      <Route element={<AuthProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />

      </Route>

    </Route>
    </Routes>
  );
};

export default AppRoutes;
