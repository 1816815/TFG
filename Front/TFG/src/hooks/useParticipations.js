import { useDispatch, useSelector } from "react-redux";
import {
  fetchParticipations,
  fetchParticipationResults,
  deleteParticipation,
  exportParticipationData,
  clearError,
  clearCurrentParticipation,
  clearExportData,
  setPagination,
} from "../Redux/slices/participationSlice"

export const useParticipation = () => {
  const dispatch = useDispatch();

  const {
    items,
    currentParticipation,
    exportData,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.participations);

  const loadParticipations = (instanceId, params = {}) => {
    return dispatch(fetchParticipations({ instanceId, params }));
  };

  const loadParticipationResults = (participationId) => {
    return dispatch(fetchParticipationResults(participationId));
  };

  const removeParticipation = (instanceId, participationId) => {
    return dispatch(deleteParticipation({ instanceId, participationId }));
  };

  const loadExportData = (instanceId) => {
    return dispatch(exportParticipationData(instanceId));
  };

  const resetError = () => {
    dispatch(clearError());
  };

  const resetCurrentParticipation = () => {
    dispatch(clearCurrentParticipation());
  };

  const resetExportData = () => {
    dispatch(clearExportData());
  };

  const updatePagination = (paginationData) => {
    dispatch(setPagination(paginationData));
  };

  return {
    participations: items,
    currentParticipation,
    exportData,
    loading,
    error,
    pagination,

    loadParticipations,
    loadParticipationResults,
    removeParticipation,
    loadExportData,

    resetError,
    resetCurrentParticipation,
    resetExportData,
    updatePagination,
  };
};

export default useParticipation;
