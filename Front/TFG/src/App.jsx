import { useEffect, useState, useContext, use } from "react";
import useAuth from "./hooks/useAuth.js";
import ChartGenerator from "./components/Chart";
import Login from "./components/Login.jsx";
import Logout from "./components/Logout.jsx";
import AdminPanel from "./components/AdminPanel.jsx";


function App() {
  const [message, setMessage] = useState(null);
  const { API_URL, isAuthenticated } = useAuth();

  const holaMundoDesdeDjango = async () => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setMessage("Hubo un error al cargar el mensaje");
    }
  };

  useEffect(() => {
    holaMundoDesdeDjango();
  }, []);

  return (
    <>
      <h1>Trabajo de Fin de Grado</h1>

      {message ? <p>{message}</p> : <p>Cargando...</p>}
      <ChartGenerator />
      {isAuthenticated ? <Logout /> : <Login />}

      {isAuthenticated ? <AdminPanel /> : ''}
      
    </>
  );
}

export default App;
