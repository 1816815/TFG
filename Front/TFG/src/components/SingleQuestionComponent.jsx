

const SingleQuestionComponent = ({ question, answer, onAnswerChange }) => {
  const handleSingleChoiceChange = (optionId) => {
    onAnswerChange({
      question_id: question.id,
      selectedOption: optionId
    });
  };

  const handleMultipleChoiceChange = (optionId) => {
    const selected = answer?.selectedOptions || [];
    const updated = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    onAnswerChange({
      question_id: question.id,
      selectedOptions: updated
    });
  };

  const handleOpenChange = (e) => {
    onAnswerChange({
      question_id: question.id,
      content: e.target.value
    });
  };

  return (
    <div className="mb-4">
      <p className="fw-bold">{question.content}</p>

      {question.type === "single" &&
        question.options.map((option) => (
          <div className="form-check" key={option.id}>
            <input
              className="form-check-input"
              type="radio"
              name={`question_${question.id}`}
              value={option.id}
              id={`option_${option.id}`}
              checked={answer?.selectedOption === option.id}
              onChange={() => handleSingleChoiceChange(option.id)}
            />
            <label className="form-check-label" htmlFor={`option_${option.id}`}>
              {option.content}
            </label>
          </div>
        ))}

      {question.type === "multiple" &&
      
      
        question.options.map((option) => (
          <div className="form-check" key={option.id}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`option_${option.id}`}
              checked={answer?.selectedOptions?.includes(option.id) || false}
              onChange={() => handleMultipleChoiceChange(option.id)}
            />
            <label className="form-check-label" htmlFor={`option_${option.id}`}>
              {option.content}
            </label>
          </div>
        ))}

      {question.type === "text" && (
        <div className="form-group mt-2">
          <textarea
            name={`question_${question.id}`}
            id={`question_${question.id}`}
            className="form-control"
            rows="3"
            value={answer?.content || ""}
            onChange={handleOpenChange}
          />
        </div>
      )}
    </div>
  );
};


export default SingleQuestionComponent;
