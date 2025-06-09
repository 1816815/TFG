import React, { useState } from "react";

export const SurveyResponseForm = ({ surveyInstance, onSubmit }) => {
  const [answers, setAnswers] = useState({});

  // Mapear tipos para facilitar
  // type: 'open' (texto), 'single_choice', 'multiple_choice'
  // Aquí gestionamos el estado de respuestas parecido a como en creación manejas options

  const handleSingleChoiceChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { question_id: questionId, selected_option: optionId }
    }));
  };

  const handleMultipleChoiceChange = (questionId, optionId) => {
    setAnswers(prev => {
      const selectedOptions = prev[questionId]?.selected_options || [];
      let newSelectedOptions;
      if (selectedOptions.includes(optionId)) {
        newSelectedOptions = selectedOptions.filter(id => id !== optionId);
      } else {
        newSelectedOptions = [...selectedOptions, optionId];
      }
      return {
        ...prev,
        [questionId]: { question_id: questionId, selected_options: newSelectedOptions }
      };
    });
  };

  const handleOpenChange = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { question_id: questionId, content: text }
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const answersArray = Object.values(answers);
    onSubmit(answersArray);
  };

  return (
    <form onSubmit={handleSubmit}>
      {surveyInstance.survey.questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "1rem" }}>
          <p><strong>{q.content}</strong></p>

          {q.type === "single_choice" && q.options && q.options.map(option => (
            <label key={option.id} style={{ display: "block" }}>
              <input
                type="radio"
                name={`question_${q.id}`}
                value={option.id}
                checked={answers[q.id]?.selected_option === option.id}
                onChange={() => handleSingleChoiceChange(q.id, option.id)}
              />
              {option.content}
            </label>
          ))}

          {q.type === "multiple_choice" && q.options && q.options.map(option => (
            <label key={option.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                value={option.id}
                checked={answers[q.id]?.selected_options?.includes(option.id) || false}
                onChange={() => handleMultipleChoiceChange(q.id, option.id)}
              />
              {option.content}
            </label>
          ))}

          {q.type === "open" && (
            <textarea
              value={answers[q.id]?.content || ""}
              onChange={(e) => handleOpenChange(q.id, e.target.value)}
              rows={3}
              style={{ width: "100%" }}
            />
          )}
        </div>
      ))}

      <button type="submit">Enviar respuestas</button>
    </form>
  );
};

export default SurveyResponseForm;