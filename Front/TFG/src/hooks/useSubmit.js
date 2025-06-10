import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  submitSurvey,
  getParticipationResults,
  getSurveyStats,
  updateAnswer,
  setCurrentStep,
  setFormProgress,
  resetForm,
  resetSubmitState,
  clearSubmitError,
  clearParticipationResults,
  clearSurveyStats,
  resetAllStates,
  selectSubmitState,
  selectParticipationResults,
  selectSurveyStats,
  selectFormState,
  selectIsSubmitting,
  selectSubmitSuccess,
  selectSubmitError,
  selectParticipationId,
  selectFormAnswers,
  selectCurrentStep,
  selectFormProgress,
  selectFormIsDirty
} from '../Redux/slices/submitSlice';


export const useSurveySubmit = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const submitState = useSelector(selectSubmitState);
  const participationResults = useSelector(selectParticipationResults);
  const surveyStats = useSelector(selectSurveyStats);
  const formState = useSelector(selectFormState);
  
  // Specific selectors
  const isSubmitting = useSelector(selectIsSubmitting);
  const submitSuccess = useSelector(selectSubmitSuccess);
  const submitError = useSelector(selectSubmitError);
  const participationId = useSelector(selectParticipationId);
  const formAnswers = useSelector(selectFormAnswers);
  const currentStep = useSelector(selectCurrentStep);
  const formProgress = useSelector(selectFormProgress);
  const formIsDirty = useSelector(selectFormIsDirty);

  // Actions
  const handleSubmitSurvey = useCallback((instanceId, data) => {
    return dispatch(submitSurvey({ instanceId, data }));
  }, [dispatch]);

  const handleGetParticipationResults = useCallback((participationId) => {
    return dispatch(getParticipationResults(participationId));
  }, [dispatch]);

  const handleGetSurveyStats = useCallback((surveyId, instanceId) => {
    return dispatch(getSurveyStats({ surveyId, instanceId }));
  }, [dispatch]);

  const handleUpdateAnswer = useCallback((questionId, answerData) => {
    dispatch(updateAnswer({ questionId, answerData }));
  }, [dispatch]);

  const handleSetCurrentStep = useCallback((step) => {
    dispatch(setCurrentStep(step));
  }, [dispatch]);

  const handleSetFormProgress = useCallback((progress) => {
    dispatch(setFormProgress(progress));
  }, [dispatch]);


  // Reset actions
  const handleResetForm = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  const handleResetSubmitState = useCallback(() => {
    dispatch(resetSubmitState());
  }, [dispatch]);

  const handleClearSubmitError = useCallback(() => {
    dispatch(clearSubmitError());
  }, [dispatch]);

  const handleClearParticipationResults = useCallback(() => {
    dispatch(clearParticipationResults());
  }, [dispatch]);

  const handleClearSurveyStats = useCallback(() => {
    dispatch(clearSurveyStats());
  }, [dispatch]);

  const handleResetAllStates = useCallback(() => {
    dispatch(resetAllStates());
  }, [dispatch]);

  // Utility functions
  const formatAnswersForSubmit = useCallback((questions) => {
    return Object.entries(formAnswers).map(([questionId, answerData]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      
      
      const baseAnswer = {
        question_id: parseInt(questionId)
      };

      switch (question?.type) {
        case 'single':
          return {
            ...baseAnswer,
            option_id: answerData.selectedOption
          };

        case 'multiple':
          return {
            ...baseAnswer,
            option_ids: answerData.selectedOptions || []
          };


        case 'text':
      return {
            ...baseAnswer,
            content: answerData.content || ''
          };

        default:
          return baseAnswer;
      }
    });
  }, [formAnswers]);


  const calculateProgress = useCallback((questions) => {
    const answeredQuestions = Object.keys(formAnswers).length;
    const totalQuestions = questions.length;
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    
    handleSetFormProgress(progress);
    return progress;
  }, [formAnswers, handleSetFormProgress]);

  // Navigation helpers
  const goToNextStep = useCallback((totalSteps) => {
    if (currentStep < totalSteps - 1) {
      handleSetCurrentStep(currentStep + 1);
    }
  }, [currentStep, handleSetCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      handleSetCurrentStep(currentStep - 1);
    }
  }, [currentStep, handleSetCurrentStep]);

  const goToStep = useCallback((step, totalSteps) => {
    if (step >= 0 && step < totalSteps) {
      handleSetCurrentStep(step);
    }
  }, [handleSetCurrentStep]);


  return {
    // State
    submitState,
    participationResults,
    surveyStats,
    formState,
    
    // Specific state values
    isSubmitting,
    submitSuccess,
    submitError,
    participationId,
    formAnswers,
    currentStep,
    formProgress,
    formIsDirty,
    
    // Actions
    submitSurvey: handleSubmitSurvey,
    getParticipationResults: handleGetParticipationResults,
    getSurveyStats: handleGetSurveyStats,
    updateAnswer: handleUpdateAnswer,
    setCurrentStep: handleSetCurrentStep,
    setFormProgress: handleSetFormProgress,

    
    // Reset actions
    resetForm: handleResetForm,
    resetSubmitState: handleResetSubmitState,
    clearSubmitError: handleClearSubmitError,
    clearParticipationResults: handleClearParticipationResults,
    clearSurveyStats: handleClearSurveyStats,
    resetAllStates: handleResetAllStates,
    
    // Utility functions
    formatAnswersForSubmit,
    calculateProgress,
    
    // Navigation helpers
    goToNextStep,
    goToPreviousStep,
    goToStep,
    
    // Computed values
    isFirstStep: currentStep === 0,
    isLastStep: (totalSteps) => currentStep === totalSteps - 1,
    hasUnsavedChanges: formIsDirty
  };
};