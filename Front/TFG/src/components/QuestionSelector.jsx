

export const QuestionSelector = ({questions, formAnswers, setCurrentStep}) => {
  return (
    <div
              className="me-md-4 mb-4 mb-md-0 selector"
              
            >
              <h6 className="text-muted mb-2">Preguntas</h6>
              <div
                className="d-grid gap-2"
                style={{
                  gridTemplateColumns: "1fr",
                }}
              >
                {questions.map((question, index) => {
                  const answer = formAnswers[question.id];
                  const isAnswered =
                    (answer?.content && answer.content.trim() !== "") ||
                    answer?.selectedOption !== undefined ||
                    (answer?.selectedOptions &&
                      answer.selectedOptions.length > 0);

                  const buttonClass = isAnswered
                    ? "btn-success"
                    : "btn-secondary";

                  return (
                    <button
                      key={question.id}
                      className={`btn btn-sm ${buttonClass}`}
                      onClick={() => setCurrentStep(index)}
                      title={question.title}
                      style={{ width: "100%" }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
  )
}

export default QuestionSelector