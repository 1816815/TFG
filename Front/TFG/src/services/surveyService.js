import apiClient from "./apiClient";

export const surveyService = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/surveys/?${queryString}` : '/surveys/';
    return await apiClient.get(endpoint);
  },

  async getById(id) {
    return await apiClient.get(`/surveys/${id}/`);
  },

  async create(data) {
    return await apiClient.post('/surveys/', data);
  },

  async update(id, data) {
    return await apiClient.patch(`/surveys/${id}/`, data);
  },

  async delete(id) {
    return await apiClient.delete(`/surveys/${id}/`);
  }
};