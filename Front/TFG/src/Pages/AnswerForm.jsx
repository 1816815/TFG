import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSurveySubmit } from "../hooks/useSubmit";
import SingleQuestionComponent from "../components/SingleQuestionComponent";
import useInstance from "../hooks/useInstance";
import { useSelector } from "react-redux";
import { useFlashRedirect } from "../hooks/useFlashRedirect";
import useParticipation from "../hooks/useParticipations";
import QuestionSelector from "../components/QuestionSelector";

const AnswerForm = () => {
  const { instanceId } = useParams();
  const { navigateWithFlash } = useFlashRedirect();
  const navigate = useNavigate();
  const { loadParticipationResults, currentParticipation } = useParticipation();

  const { loading, error } = useSelector((state) => state.instances);
  const surveyData = useSelector((state) => state.instances.currentInstance);
  const [lastSubmitWasFinal, setLastSubmitWasFinal] = useState(false);
  const [participationLoaded, setParticipationLoaded] = useState(false);

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
  console.log("Antes del current");
  console.log(currentParticipation?.answers);

  // Cargar participación existente del usuario cuando se carga la encuesta
  useEffect(() => {
    const loadExistingParticipation = async () => {
      if (userStatus?.participation_id && !participationLoaded) {
        try {
          await loadParticipationResults(userStatus.participation_id);
          setParticipationLoaded(true);
          console.log("Participación cargada");
        } catch (error) {
          console.error("Error cargando participación:", error);
        }
      }
    };

    // Solo cargar si tenemos userStatus y aún no hemos cargado la participación
    if (userStatus && !participationLoaded) {
      loadExistingParticipation();
    }
  }, [userStatus, loadParticipationResults, participationLoaded]);

  // Rellenar formulario con datos de participación cuando se carga
  useEffect(() => {
    if (
      currentParticipation &&
      questions.length > 0 &&
      !Object.keys(formAnswers).length
    ) {
      let maxStepWithAnswer = 0;

      if (currentParticipation.answers) {
        currentParticipation.answers.forEach((answer) => {
          const questionId = answer.question.id;
          const questionType = answer.question.type;

          let answerData = { question_id: questionId };

          switch (questionType) {
            case "text":
              answerData.content = answer.content || "";
              break;
            case "single":
              answerData.selectedOption = answer.selected_options?.[0] || null;
              break;
            case "multiple":
              answerData.selectedOptions = answer.selected_options || [];
              break;
            default:
              console.warn(`Tipo de pregunta desconocido: ${questionType}`);
          }

          updateAnswer(questionId, answerData);

          const questionIndex = questions.findIndex((q) => q.id === questionId);
          if (questionIndex > maxStepWithAnswer) {
            maxStepWithAnswer = questionIndex;
          }
        });

        const targetStep = currentParticipation.completed
          ? maxStepWithAnswer
          : Math.min(maxStepWithAnswer + 1, questions.length - 1);
        setCurrentStep(targetStep);
      }
    }
  }, [
    currentParticipation,
    questions,
    formAnswers,
    updateAnswer,
    setCurrentStep,
  ]);

  useEffect(() => {
    if (questions.length > 0) {
      calculateProgress(questions);
    }
  }, [formAnswers, questions]);

  useEffect(() => {
    if (submitSuccess && participationId && lastSubmitWasFinal) {
      navigateWithFlash(
        "/encuestas",
        "Respuesta procesada, gracias por participar",
        "success"
      );
    }
  }, [submitSuccess, participationId, lastSubmitWasFinal, navigate]);

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
      console.log(
        "Enviando respuestas al backend:",
        JSON.stringify(formattedAnswers, null, 2)
      );

      submitSurvey(instanceId, { answers: formattedAnswers, completed: true });
      setLastSubmitWasFinal(true);
    } catch (error) {
      console.error("Error submitting survey:", error);
    }
  };

  const handleNextStep = async () => {
    const formattedAnswers = formatAnswersForSubmit(questions);
    try {
      await savePartialAnswer(instanceId, formattedAnswers);
      goToNextStep(questions.length);
    } catch (error) {
      console.error("Error al guardar respuestas parciales:", error);
    }
  };

  const handlePrevStep = async () => {
    const formattedAnswers = formatAnswersForSubmit(questions);
    try {
      await savePartialAnswer(instanceId, formattedAnswers);
      goToPreviousStep();
    } catch (error) {
      console.error("Error al guardar respuestas parciales:", error);
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
  if (instance.state !== "open") {
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
          {userStatus.participation_state === "completed"
            ? "Ya has participado en esta encuesta."
            : "No puedes participar en esta encuesta en este momento."}
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
          <div className="d-flex flex-column flex-md-row">
            {/* Sidebar de selector */}
            {questions && questions.length > 0 && (
              <QuestionSelector
                questions={questions}
                formAnswers={formAnswers}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
              />
            )}

            {/* Área de contenido principal */}
            <div className="flex-grow-1">
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

              {/* Navegación */}
              <div className="d-flex justify-content-between mt-4 flex-wrap gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handlePrevStep}
                  disabled={isFirstStep || isSubmitting}
                >
                  Anterior
                </button>

                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-warning"
                    onClick={async () => {
                      const formattedAnswers =
                        formatAnswersForSubmit(questions);
                      try {
                        await savePartialAnswer(instanceId, formattedAnswers);
                      } catch (error) {
                        console.error("Error al guardar manualmente:", error);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    💾 Guardar progreso
                  </button>

                  {!isLastStep(questions.length) ? (
                    <button
                      className="btn btn-primary"
                      onClick={handleNextStep}
                      disabled={isSubmitting}
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      Enviar
                    </button>
                  )}
                </div>
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
      </div>
    </div>
  );
};

export default AnswerForm;
