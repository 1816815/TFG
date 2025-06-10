import apiClient from "./apiClient";

export const submitService = {
    async submit(instanceId, data) {
        return await apiClient.post(`/surveys/${instanceId}/submit/`, data);

    },
    async getParticipationResults(participationId) {
        return await apiClient.get(`/participations/${participationId}/results/`);
    },
    async getStats(surveyId, instanceId){
        return await apiClient.get(`/surveys/${surveyId}/instances/${instanceId}/stats/`);
    },
};