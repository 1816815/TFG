import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSurveySubmit } from "../hooks/useSubmit";
import SingleQuestionComponent from "../components/SingleQuestionComponent";
import useInstance from "../hooks/useInstance";
import { useSelector } from "react-redux";
import { useFlashRedirect } from "../hooks/useFlashRedirect";

const AnswerForm = () => {
  const { instanceId } = useParams();
  const {navigateWithFlash} = useFlashRedirect();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.instances);
  const surveyData = useSelector((state) => state.instances.currentInstance);
  
  const instance = surveyData?.instance;
  const questions = surveyData?.questions || [];
  const userStatus = surveyData?.user_status;
  
  const { getPublicSurvey } = useInstance();
  const {
    isSubmitting,
    submitSuccess,
    submitError,
    participationId,
    formAnswers,
    currentStep,
    formProgress,
    formIsDirty,

    submitSurvey,
    savePartialAnswer,
    updateAnswer,
    setCurrentStep,

    formatAnswersForSubmit,
    calculateProgress,

    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,

    resetForm,
    clearSubmitError,
  } = useSurveySubmit();

  useEffect(() => {
    if (instanceId) {
      getPublicSurvey(instanceId);
    }
  }, [instanceId]);

  useEffect(() => {
    if (questions.length > 0) {
      calculateProgress(questions);
    }
  }, [formAnswers, questions]);

  useEffect(() => {
    if (submitSuccess && participationId) {
     navigateWithFlash("/encuestas", "Respuesta procesada, gracias por participar", "success");
    }
  }, [submitSuccess, participationId, navigate]);

  // Verificar si el usuario puede participar
  useEffect(() => {
    if (userStatus && !userStatus.can_participate) {
      // Redirigir o mostrar mensaje si no puede participar
      console.warn("User cannot participate in this survey");
    }
  }, [userStatus]);

  const handleAnswerChange = (questionId, answerData) => {
    updateAnswer(questionId, answerData);
  };

  const handleSubmit = async () => {
    const formattedAnswers = formatAnswersForSubmit(questions);
    
    try {
      console.log("Enviando respuestas al backend:", JSON.stringify(formattedAnswers, null, 2));

      
       submitSurvey(instanceId, { answers: formattedAnswers, completed: true });
    } catch (error) {
      console.error("Error submitting survey:", error);
    }
  };

  const currentQuestion = questions[currentStep];


  // Estado de carga
  if (loading) {
    return <div className="container mt-5">Cargando encuesta...</div>;
  }

  // Estado de error
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Error al cargar la encuesta: {error.message || error}
        </div>
      </div>
    );
  }

  // Verificar que tengamos los datos necesarios
  if (!surveyData || !instance || !questions.length) {
    return <div className="container mt-5">Cargando encuesta...</div>;
  }

  // Verificar si la encuesta está disponible
  if (instance.state !== 'open') {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Esta encuesta no está disponible en este momento.
        </div>
      </div>
    );
  }

  // Verificar si el usuario puede participar
  if (userStatus && !userStatus.can_participate) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          {userStatus.participation_state === 'completed' 
            ? 'Ya has participado en esta encuesta.' 
            : 'No puedes participar en esta encuesta en este momento.'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title">{instance.title}</h2>
          <p className="card-text text-muted">{instance.description}</p>

          {/* Progreso */}
          <div className="mb-4">
            <div className="progress">
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: `${formProgress}%` }}
                aria-valuenow={formProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {Math.round(formProgress)}%
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {submitError && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center">
              <span>{submitError.message}</span>
              <button
                type="button"
                className="btn-close"
                onClick={clearSubmitError}
              ></button>
            </div>
          )}

          {/* Pregunta actual */}
          {currentQuestion && (
            <div className="mb-4">
              <h5 className="mb-3">
                Pregunta {currentStep + 1} de {questions.length}
              </h5>
              <SingleQuestionComponent
                question={currentQuestion}
                answer={formAnswers[currentQuestion.id]}
                onAnswerChange={(answerData) =>
                  handleAnswerChange(currentQuestion.id, answerData)
                }
              />
            </div>
          )}

          {/* Navegación */}
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary"
              onClick={goToPreviousStep}
              disabled={isFirstStep}
            >
              Anterior
            </button>

            {!isLastStep(questions.length) ? (
              <button
                className="btn btn-primary"
                onClick={() => goToNextStep(questions.length)}
              >
                Siguiente
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar encuesta"}
              </button>
            )}
          </div>

          {/* Cambios sin guardar */}
          {formIsDirty && (
            <div className="mt-3 alert alert-warning">
              ⚠️ Tienes cambios sin guardar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerForm;