import {
  fetchInstanceById,
  fetchInstances,
  createInstance,
  updateInstance,
  updateInstanceState,
  duplicateInstance,
  closeInstance,
  reopenInstance,
  fetchInstanceStatistics,
  fetchInstanceConfiguration,
  fetchInstanceQuestions,
  fetchPublicUrl,
  fetchPublicInstances,
  fetchInstancesBySurvey,
  clearError,
  clearCurrentInstance,
  clearStatistics,
  setPagination,
} from "../Redux/slices/instanceSlice";
import { useDispatch, useSelector } from "react-redux";

export const useInstance = () => {
  const dispatch = useDispatch();
  const {
    items,
    currentInstance,
    questions,
    statistics,
    publicUrl,
    loading,
    error,
    operationLoading,
    pagination,
  } = useSelector((state) => state.instances);

  const loadInstances = (params = {}) => {
    dispatch(fetchInstances(params));
  };

  const loadInstanceById = (id) => {
    dispatch(fetchInstanceById(id));
  };

  const createNewInstance = (data) => {
    return dispatch(createInstance(data));
  };

  const updateExistingInstance = (id, data) => {
    return dispatch(updateInstance({ id, data }));
  };

  const updateState = (id, state, closureDate = null) => {
    return dispatch(updateInstanceState({ id, state, closureDate }));
  };

  const duplicateExistingInstance = (id) => {
    return dispatch(duplicateInstance(id));
  };

  const closeExistingInstance = (id) => {
    return dispatch(closeInstance(id));
  };

  const reopenExistingInstance = (id) => {
    return dispatch(reopenInstance(id));
  };

  const loadStatistics = (id) => {
    dispatch(fetchInstanceStatistics(id));
  };

  const loadConfiguration = (id) => {
    dispatch(fetchInstanceConfiguration(id));
  };

  const loadQuestions = (id) => {
    dispatch(fetchInstanceQuestions(id));
  };

  const loadPublicUrl = (id) => {
    dispatch(fetchPublicUrl(id));
  };

  const loadInstancesBySurvey = (surveyId) => {
    dispatch(fetchInstancesBySurvey(surveyId));
  };

  const clearInstanceError = () => {
    dispatch(clearError());
  };

  const clearCurrent = () => {
    dispatch(clearCurrentInstance());
  };

  const clearStats = () => {
    dispatch(clearStatistics());
  };

  const updatePagination = (paginationData) => {
    dispatch(setPagination(paginationData));
  };
  const loadPublicInstances = () => {
    dispatch(fetchPublicInstances());
  };


  return {
    instances: items,
    currentInstance,
    questions,
    statistics,
    publicUrl,
    loading,
    error,
    operationLoading,
    pagination,
    loadInstances,
    loadPublicInstances,
    loadInstanceById,
    createNewInstance,
    updateExistingInstance,
    updateState,
    duplicateExistingInstance,
    closeExistingInstance,
    reopenExistingInstance,
    loadStatistics,
    loadConfiguration,
    loadQuestions,
    loadPublicUrl,
    loadInstancesBySurvey,
    clearInstanceError,
    clearCurrent,
    clearStats,
    updatePagination,
  };
};

export default useInstance;
