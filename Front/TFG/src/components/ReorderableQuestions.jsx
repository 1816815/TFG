import { useState } from "react";
import { Controller } from "react-hook-form";
import OptionsFieldArray from "./OptionsFieldArray";

const ReorderableQuestions = ({
  control,
  fields,
  move,
  remove,
  watch,
  errors = [],
}) => {
  const questions = watch("questions");
  const [openIndexes, setOpenIndexes] = useState(fields.map(() => true));
  const [draggedIndex, setDraggedIndex] = useState(null);

  const toggleOpen = (index) => {
    const updated = [...openIndexes];
    updated[index] = !updated[index];
    setOpenIndexes(updated);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
      const updatedOpen = [...openIndexes];
      const [movedOpen] = updatedOpen.splice(draggedIndex, 1);
      updatedOpen.splice(index, 0, movedOpen);
      setOpenIndexes(updatedOpen);
    }
    setDraggedIndex(null);
  };

  const moveUp = (index) => {
    if (index > 0) {
      move(index, index - 1);
      const updatedOpen = [...openIndexes];
      [updatedOpen[index], updatedOpen[index - 1]] = [updatedOpen[index - 1], updatedOpen[index]];
      setOpenIndexes(updatedOpen);
    }
  };


  const moveDown = (index) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
      const updatedOpen = [...openIndexes];
      [updatedOpen[index], updatedOpen[index + 1]] = [updatedOpen[index + 1], updatedOpen[index]];
      setOpenIndexes(updatedOpen);
    }
  };

  return (
    <>
      {fields.map((question, index) => {
        const contentId = `questions-${index}-content`;
        const typeId = `questions-${index}-type`;
        const isOpen = openIndexes[index];

        const label =
          questions?.[index]?.content?.trim() !== ""
            ? questions[index].content.length > 50
              ? questions[index].content.slice(0, 50) + "..."
              : questions[index].content
            : `Pregunta ${index + 1}`;

        // Revisar errores concretos
        const questionErrors = errors?.[index];
        const hasError =
          questionErrors &&
          (questionErrors.content || questionErrors.type || questionErrors.options);

        return (
          <div
            key={question.id}
            className={`card p-2 mb-2 ${hasError ? "border border-danger" : ""}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
          >
            <div className="d-flex justify-content-between align-items-center">
              <button
                type="button"
                className={`btn btn-sm text-start flex-grow-1 ${
                  hasError
                    ? "btn-outline-danger border-danger text-danger"
                    : "btn-outline-primary"
                }`}
                onClick={() => toggleOpen(index)}
              >
                {isOpen ? "▼" : "▶"} {label}
              </button>

              <div className="d-flex gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  title="Mover hacia arriba"
                >
                  ↑
                </button>
                
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => moveDown(index)}
                  disabled={index === fields.length - 1}
                  title="Mover hacia abajo"
                >
                  ↓
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => remove(index)}
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="mt-2">
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
                          <p className="text-danger">{fieldState.error.message}</p>
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

                {["single", "multiple"].includes(questions?.[index]?.type) && (
                  <>
                    <OptionsFieldArray control={control} nestIndex={index} />
                    {questionErrors?.options && (
                      <div className="text-danger mt-1">{questionErrors.options}</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default ReorderableQuestions;