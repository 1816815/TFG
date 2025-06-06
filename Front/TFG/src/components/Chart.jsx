import { useState } from 'react';


/**
 * Component that shows a button to generate a chart 
 * with the test data and shows the generated chart
 */
const ChartDemo = () => {
    
    const [chartImage, setChartImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    const generateChart = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/generar-grafica`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: [
                        { "x": 1, "y": 10 },
                        { "x": 2, "y": 15 },
                        { "x": 3, "y": 7 },
                        { "x": 4, "y": 20 }
                    ]
                }),
            });

            const result = await response.json();

            if (response.ok) {

                setChartImage(result.image);

            } else {
                
                setError(result.error || "Error desconocido");
            }
        } catch (error) {
            
            setError("Error al generar el gráfico: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={generateChart} disabled={loading}>
                {loading ? "Generando..." : "Generar Gráfico"}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {chartImage && (
                <div>
                    <h3>Gráfico generado:</h3>
                    <img src={chartImage} alt="Gráfico generado" />
                </div>
            )}
        </div>
    );
};

export default ChartDemo;
