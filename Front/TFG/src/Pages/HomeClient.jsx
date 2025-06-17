import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const HomeClient = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h2>
          Bienvenido/a, <span>{user && user.username}</span>
        </h2>
        <p className="lead">
          Esta es tu página de inicio como creador/a de encuestas en
          <strong> CuestaMarket</strong>. Aquí se explica cómo funciona la
          plataforma paso a paso.
        </p>
      </div>

      <div className="accordion" id="homeTutorialAccordion">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              1. Accede a tus encuestas
            </button>
          </h2>
          <div
            id="collapseOne"
            className="accordion-collapse collapse show"
            aria-labelledby="headingOne"
            data-bs-parent="#homeTutorialAccordion"
          >
            <div className="accordion-body">
              Dirígete a{" "}
              <a
                href="/mis-encuestas"
                className="text-decoration-none text-primary"
              >
                Mis Encuestas 
              </a>{" "}
              desde la barra de navegación. Verás la lista de todas tus
              encuestas creadas.
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingTwo">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              2. Crear una nueva encuesta
            </button>
          </h2>
          <div
            id="collapseTwo"
            className="accordion-collapse collapse"
            aria-labelledby="headingTwo"
            data-bs-parent="#homeTutorialAccordion"
          >
            <div className="accordion-body">
              <ul>
                <li>
                  Haz clic en <strong>“Nueva Encuesta”</strong>.
                </li>
                <li>
                  Introduce un <strong>título</strong> y una{" "}
                  <strong>descripción</strong>.
                </li>
                <li>
                  Agrega preguntas y selecciona el tipo:
                  <ul>
                    <li>
                      <strong>Selección única</strong>
                    </li>
                    <li>
                      <strong>Selección múltiple</strong>
                    </li>
                    <li>
                      <strong>Texto libre</strong>
                    </li>
                  </ul>
                </li>
                <li>Escribe el contenido de la pregunta (enunciado).</li>
                <li>
                  Si el tipo es de selección, añade mínimo{" "}
                  <strong>2 opciones</strong> con el botón{" "}
                  <em>Agregar opción</em>.
                </li>
                <li>
                  Puedes <strong>reordenar las preguntas</strong> arrastrándolas
                  o con los botones de flechas.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingThree">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseThree"
              aria-expanded="false"
              aria-controls="collapseThree"
            >
              3. Administrar encuestas creadas
            </button>
          </h2>
          <div
            id="collapseThree"
            className="accordion-collapse collapse"
            aria-labelledby="headingThree"
            data-bs-parent="#homeTutorialAccordion"
          >
            <div className="accordion-body">
              En la lista de encuestas, haz clic en cualquiera para ver sus{" "}
              <strong>detalles</strong>. Podrás:
              <ul>
                <li>
                  <strong>Editar</strong>: si la encuesta no tiene. Si las
                  tiene, se creará una nueva encuesta basada en la actual y se
                  te dará la opción de elegir borrar la encuesta previa.
                </li>
                <li>
                  <strong>Ver Instancias</strong>
                </li>
                <li>
                  <strong>Borrar</strong> la encuesta
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingFour">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFour"
              aria-expanded="false"
              aria-controls="collapseFour"
            >
              4. Crear y gestionar instancias
            </button>
          </h2>
          <div
            id="collapseFour"
            className="accordion-collapse collapse"
            aria-labelledby="headingFour"
            data-bs-parent="#homeTutorialAccordion"
          >
            <div className="accordion-body">
              Las <strong>instancias</strong> son ejecuciones activas o
              archivadas de una encuesta.
              <ul>
                <li>
                  Puedes crearlas desde la sección <em>Ver Instancias</em>.
                </li>
                <li>
                  Elige si quieres que sea <strong>Abierta</strong> (con fecha
                  de cierre) o <strong>Borrador</strong>.
                </li>
                <li>
                  Desde <em>Ver</em> puedes cambiar el estado (cerrar, reabrir).
                </li>
                <li>
                  Con el botón de <strong>engranaje</strong> puedes:
                  <ul>
                    <li>Ver participaciones</li>
                    <li>Exportar datos (Excel, CSV, TXT)</li>
                    <li>Borrar instancia</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingFive">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFive"
              aria-expanded="false"
              aria-controls="collapseFive"
            >
              5. Consultar resultados
            </button>
          </h2>
          <div
            id="collapseFive"
            className="accordion-collapse collapse"
            aria-labelledby="headingFive"
            data-bs-parent="#homeTutorialAccordion"
          >
            <div className="accordion-body">
              Si una instancia está <strong>abierta</strong> o{" "}
              <strong>cerrada</strong>, verás un botón de{" "}
              <strong>gráficos</strong>. Al hacer clic:
              <ul>
                <li>
                  Podrás consultar las estadísticas y visualizaciones de
                  resultados.
                </li>
                <li>
                  Los resultados son <strong>provisionales</strong> si la
                  encuesta está abierta.
                </li>
                <li>
                  Serán <strong>definitivos</strong> si la encuesta está
                  cerrada.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeClient;
