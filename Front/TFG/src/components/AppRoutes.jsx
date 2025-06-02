import { Routes, Route } from "react-router-dom";
import ChartDemo from "./Chart";
import Crono from "./Crono";
import Auth from "./Auth";
import AdminPanel from "./AdminPanel";
import Profile from "./Profile";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AuthProtectedRoute from "./AuthProtectedRoute";
import Logout from "./Logout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ChartDemo />} />
      <Route path="/crono" element={<Crono />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
       <Route path="/logout" element={<Logout />} />

      <Route element={<AdminProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      <Route element={<AuthProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
