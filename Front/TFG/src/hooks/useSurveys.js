
import { fetchSurveys,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    fetchSurveyById,
    clearError,
    clearCurrentSurvey,
    setPagination
 } from '../Redux/slices/surveySlice';
import { useDispatch, useSelector } from 'react-redux';

export const useSurveys = () => {
  const dispatch = useDispatch();
  const { items, currentSurvey, loading, error, pagination } = useSelector(
    (state) => state.surveys
  );

  const loadSurveys = (params = {}) => {
    dispatch(fetchSurveys(params));
  };

  const loadSurveyById = (id) => {
    dispatch(fetchSurveyById(id));
  };

  const createNewSurvey = (data) => {
    return dispatch(createSurvey(data));
  };

  const updateExistingSurvey = (id, data) => {
    return dispatch(updateSurvey({ id, data }));
  };

  const deleteSurveyById = (id) => {
    return dispatch(deleteSurvey(id));
  };

  const clearSurveyError = () => {
    dispatch(clearError());
  };

  const clearCurrent = () => {
    dispatch(clearCurrentSurvey());
  };

  const updatePagination = (paginationData) => {
    dispatch(setPagination(paginationData));
  };

  return {
    surveys: items,
    currentSurvey,
    loading,
    error,
    pagination,
    loadSurveys,
    loadSurveyById,
    createNewSurvey,
    updateExistingSurvey,
    deleteSurveyById,
    clearSurveyError,
    clearCurrent,
    updatePagination,
  };
};

export default useSurveys;
