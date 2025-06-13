import apiClient from "./apiClient";

export const participationService = {
  async getByInstance(instanceId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/survey-configuration/${instanceId}/participations/?${queryString}`
      : `/survey-configuration/${instanceId}/participations/`;
    return await apiClient.get(endpoint);
  },

  async getResults(participationId) {
    return await apiClient.get(`/participations/${participationId}/results/`, {
      credentials: "include",
    });
  },

  async delete(instanceId, participationId) {
    return await apiClient.delete(
      `/survey-configuration/${instanceId}/participations/${participationId}/`,
      {
        credentials: "include",
      }
    );
  },

  async exportData(instanceId) {
    return await apiClient.get(
      `/survey-configuration/${instanceId}/export-data/`,
      {
        credentials: "include",
      }
    );
  },
};
