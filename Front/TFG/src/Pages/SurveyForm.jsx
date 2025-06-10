import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReorderableQuestions from "../components/ReorderableQuestions";
import useSurveys from "../hooks/useSurveys";
import { useSelector } from "react-redux";

/**
 * Component that represents the form for creating or editing a survey.
 * It uses react-hook-form to manage the form state and
 * react-hook-form/field-array to manage the array of questions.
 * If a surveyId parameter is provided in the URL, it shows the form
 * for editing the corresponding survey.
 */
const SurveyForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      questions: [],
      order: 0,
    },
  });

  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "questions",
  });

  const {
    createNewSurvey,
    updateExistingSurvey,
    loadSurveyById,
    deleteSurveyById,
  } = useSurveys();

  const navigate = useNavigate();
  const { surveyId } = useParams();
  const survey = useSelector((state) => state.surveys.currentSurvey);
  const loading = useSelector((state) => state.surveys.loading);
  const error = useSelector((state) => state.surveys.error);
  const instanceCount = useSelector(
    (state) => state.surveys.currentSurvey?.instances_count ?? 0
  );

  useEffect(() => {
    if (surveyId) {
      loadSurveyById(surveyId);
    }
  }, []);

  useEffect(() => {
    if (surveyId && survey) {
      reset({
        title: survey.title,
        description: survey.description,
        questions: survey.questions.map((q) => ({
          content: q.content,
          type: q.type,
          options: q.options || [],
          order: q.order,
        })),
      });
    }
  }, [survey]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Estado para manejar errores de validación personalizados
  const [customErrors, setCustomErrors] = useState({});

  const questions = watch("questions");

  // Función para validar una pregunta específica
  const validateQuestion = (question, index) => {
    const errors = {};

    // Validar contenido
    if (!question.content?.trim()) {
      errors.content = "La pregunta debe tener contenido.";
    }

    // Validar opciones si es pregunta de elección
    if (["single", "multiple"].includes(question.type)) {
      const options = question.options || [];
      const validOptions = options.filter((opt) => opt?.content?.trim() !== "");
      const emptyOptions = options.filter((opt) => opt?.content?.trim() === "");

      if (emptyOptions.length > 0) {
        errors.options =
          "Hay opción(es) vacía(s). Complete o elimine las opciones vacías.";
      } else if (validOptions.length < 2) {
        errors.options = "Debe tener al menos dos opciones válidas.";
      }
    }

    return errors;
  };

  // Validación en tiempo real
  useEffect(() => {
    const newErrors = questions.map((q, i) => validateQuestion(q, i));
    setCustomErrors(newErrors);
  }, [questions]);

  const onSubmit = async (data) => {
    const finalErrors = data.questions.map((q, i) => validateQuestion(q, i));
    const hasError = finalErrors.some((err) => Object.keys(err).length > 0);

    const formattedQuestions = data.questions.map((q, index) => ({
      content: q.content,
      type: q.type,
      options: ["single", "multiple"].includes(q.type)
        ? q.options
            .filter((opt) => opt?.content?.trim() !== "")
            .map((opt) => ({ content: opt.content }))
        : [],
      order: index,
    }));

    if (hasError) {
      setCustomErrors(finalErrors);
      setServerError("Algunas preguntas no tienen un formato válido.");
      return;
    }

    const payload = {
      ...data,
      questions: formattedQuestions,
    };

    // Si tiene instancias, no enviar aún: mostrar modal
    if (surveyId && instanceCount > 0) {
      setPendingPayload(payload);
      setShowConflictModal(true);
      return;
    }

    // flujo normal
    await submitSurvey(payload);
  };

const submitSurvey = async (payload, shouldDelete = false) => {
  setIsSubmitting(true);
  setServerError("");

  try {
    let resultAction;

    if (surveyId) {
      resultAction = await updateExistingSurvey(surveyId, payload);
    } else {
      resultAction = await createNewSurvey(payload);
    }

    if (resultAction.meta.requestStatus === "fulfilled") {
      const newSurveyId = resultAction.payload.id;

      // Si se debe eliminar la encuesta original
      if (shouldDelete && surveyId) {
        await deleteSurveyById(surveyId);
        alert("Se ha creado una nueva encuesta y eliminado la original.");
        navigate("/mis-encuestas");
      } else {
        alert(`Encuesta ${surveyId ? "actualizada" : "creada"} con éxito`);
        navigate(`/encuesta/${newSurveyId}`);
      }
    } else {
      setServerError(resultAction.payload || "Error desconocido");
    }
  } catch (err) {
    setServerError("Error de red");
  } finally {
    setIsSubmitting(false);
    setShowConflictModal(false);
    setPendingPayload(null);
  }
};


  if (loading) return <p>Cargando encuesta...</p>;

  return (
    <div className="container mt-4">
      <h2>{surveyId ? "Editar Encuesta" : "Crear Encuesta"}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label" htmlFor="title">
            Título
          </label>
          <Controller
            name="title"
            control={control}
            rules={{ required: "El título es obligatorio" }}
            render={({ field, fieldState }) => (
              <>
                <input {...field} className="form-control" id="title" />
                {fieldState.error && (
                  <p style={{ color: "red" }}>{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="description">
            Descripción
          </label>
          <Controller
            name="description"
            control={control}
            rules={{ required: "La descripción es obligatoria" }}
            render={({ field, fieldState }) => (
              <>
                <textarea
                  {...field}
                  className="form-control"
                  id="description"
                />
                {fieldState.error && (
                  <p style={{ color: "red" }}>{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <h4>Preguntas</h4>
        <ReorderableQuestions
          control={control}
          fields={fields}
          move={move}
          remove={remove}
          watch={watch}
          errors={customErrors}
        />

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => append({ content: "", type: "text", options: [] })}
        >
          Agregar pregunta
        </button>

        {serverError && (
          <p style={{ color: "red", marginTop: "10px" }}>{serverError}</p>
        )}

        <div className="mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? surveyId
                ? "Actualizando..."
                : "Creando..."
              : surveyId
              ? "Actualizar Encuesta"
              : "Crear Encuesta"}
          </button>
        </div>
              {/* Modal Bootstrap 5 correctamente estructurado */}
<div
  className={`modal fade ${showConflictModal ? "show d-block" : ""}`}
  tabIndex="-1"
  role="dialog"
  style={{
    backgroundColor: "rgba(0,0,0,0.5)",
  }}
>
  <div className="modal-dialog modal-dialog-centered" role="document">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Encuesta con instancias registradas</h5>
        <button
          type="button"
          className="btn-close"
          onClick={() => setShowConflictModal(false)}
        />
      </div>
      <div className="modal-body">
        <p>No se puede modificar directamente. ¿Qué desea hacer?</p>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowConflictModal(false)}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => submitSurvey(pendingPayload, false)}
        >
          Crear Nueva Encuesta
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => submitSurvey(pendingPayload, true)}
        >
          Crear Nueva y Borrar Actual
        </button>
      </div>
    </div>
  </div>
</div>

      </form>

    </div>
  );
};

export default SurveyForm;
