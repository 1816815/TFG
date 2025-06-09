import apiClient from "./apiClient";

export const instanceService = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/survey-instances/?${queryString}`
      : "/survey-instances/";
    return await apiClient.get(endpoint);
  },

  async getById(id) {
    return await apiClient.get(`/survey-instances/${id}/`, {
      credentials: "include",
    });
  },

  async create(data) {
    return await apiClient.post("/survey-instances/", data, {
      credentials: "include",
    });
  },

  async update(id, data) {
    return await apiClient.patch(`/survey-instances/${id}/`, data, {
      credentials: "include",
    });
  },

  async duplicate(id) {
    return await apiClient.post(`/survey-instances/${id}/duplicate/`, {
      credentials: "include",
    });
  },

  async close(id) {
    return await apiClient.post(`/survey-instances/${id}/close/`, {
      credentials: "include",
    });
  },

  async reopen(id) {
    return await apiClient.post(`/survey-instances/${id}/reopen/`, {
      credentials: "include",
    });
  },

  async getStatistics(id) {
    return await apiClient.get(`/survey-instances/${id}/statistics/`, {
      credentials: "include",
    });
  },

  async getConfiguration(id) {
    return await apiClient.get(`/survey-instances/${id}/configuration/`, {
      credentials: "include",
    });
  },

  async getQuestions(id) {
    return await apiClient.get(`/survey-configuration/${id}/questions/`, {
      credentials: "include",
    });
  },

  async getPublicUrl(id) {
    return await apiClient.get(`/survey-instances/${id}/public_url/`, {
      credentials: "include",
    });
  },

  async getBySurvey(surveyId) {
    return await apiClient.get(`/survey-instances/by-survey/${surveyId}/`, {
      credentials: "include",
    });
  },

  async getPublicInstances() {
    return await apiClient.get("/survey-instances/public/open/");
  },

  async getExportData(id) {
    return await apiClient.get(`/survey-configuration/${id}/export-data/`, {
      credentials: "include",
    });
  },
};
