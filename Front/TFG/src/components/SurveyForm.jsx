import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import OptionsFieldArray from "./OptionsFieldArray";
import { v4 as uuid} from "uuid";

/**
 * Component that represents the form for creating or editing a survey.
 * It uses react-hook-form to manage the form state and
 * react-hook-form/field-array to manage the array of questions.
 * If a surveyId parameter is provided in the URL, it shows the form
 * for editing the corresponding survey.
 */
const SurveyForm = () => {
  const { control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });
  const API_URL = import.meta.env.VITE_API_URL;
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const { surveyId } = useParams(); // If exists surveyId, is editing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loadingSurvey, setLoadingSurvey] = useState(!!surveyId);

  const questions = watch("questions");

  // if surveyId, load survey
  useEffect(() => {
    if (surveyId) {
      const fetchSurvey = async () => {
        try {
          const response = await fetch(`${API_URL}/surveys/${surveyId}`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            reset({
              title: data.title,
              description: data.description,
              questions: data.questions.map((q) => ({
                content: q.content,
                type: q.type,
                options: q.options || [],
              })),
            });
          } else {
            setServerError("No se pudo cargar la encuesta");
          }
        } catch (error) {
          setServerError("Error de red al cargar encuesta");
        } finally {
          setLoadingSurvey(false);
        }
      };
      fetchSurvey();
    }
  }, [surveyId, API_URL, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError("");
    try {
      const url = surveyId
        ? `${API_URL}/surveys/${surveyId}/`
        : `${API_URL}/surveys/`;
      const method = surveyId ? "PUT" : "POST";
      console.log(url);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          client: user.id,
          title: data.title,
          description: data.description,
          questions: data.questions.map((q) => ({
            content: q.content,
            type: q.type,
            options: ["single", "multiple"].includes(q.type)
              ? q.options.map((opt) => ({ content: opt.content }))
              : [],
          })),
        }),
      });
      if (response.ok) {
        alert(`Encuesta ${surveyId ? "actualizada" : "creada"} con éxito`);
        navigate("/");
      } else {
        const errorData = await response.json();
        setServerError(errorData.detail || "Error desconocido");
      }
    } catch (error) {
      setServerError("Error de red");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSurvey) return <p>Cargando encuesta...</p>;

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
        {fields.map((question, index) => {
          const contentId = `questions-${index}-content`;
          const typeId = `questions-${index}-type`;

          return (
            <div key={question.id} className="card p-3 mb-3">
              <div className="mb-2">
                <label htmlFor={contentId}>Contenido</label>
                <Controller
                  name={`questions.${index}.content`}
                  control={control}
                  rules={{ required: "El contenido es obligatorio" }}
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        {...field}
                        id={contentId}
                        className="form-control"
                      />
                      {fieldState.error && (
                        <p style={{ color: "red" }}>
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <div className="mb-2">
                <label htmlFor={typeId}>Tipo</label>
                <Controller
                  name={`questions.${index}.type`}
                  control={control}
                  render={({ field }) => (
                    <select {...field} id={typeId} className="form-select">
                      <option value="text">Respuesta abierta</option>
                      <option value="single">Opción única</option>
                      <option value="multiple">Opción múltiple</option>
                    </select>
                  )}
                />
              </div>
              {["single", "multiple"].includes(questions[index]?.type) && (
                <OptionsFieldArray control={control} nestIndex={index} />
              )}
            </div>
          );
        })}

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
      </form>
    </div>
  );
};

export default SurveyForm;
