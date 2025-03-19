import { useEffect, useState } from "react";
import ChartGenerator from "./components/Chart";

function App() {
  const [message, setMessage] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const holaMundoDesdeDjango = async () => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setMessage(data.message);

    } catch (error) {
      console.error("Error al obtener datos:", error);
      setMessage('Hubo un error al cargar el mensaje'); 
    }
  };

  useEffect(() => {
    holaMundoDesdeDjango();
  }, []);





  return (
    <>
      <h1>Trabajo de Fin de Grado</h1>

      { message ? <p>{message}</p> : <p>Cargando...</p> }
      <ChartGenerator />
    </>
  );
}

export default App;
