import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const triggerDeploy = async (version, strategy, canaryWeight, repoUrl, branch) => {
    return axios.post(`${API_BASE}/deploy`, { version, strategy, canaryWeight, repoUrl, branch });
};

export const getDeployments = async () => {
    return axios.get(`${API_BASE}/deployments`);
};

export const getConfig = async () => {
    return axios.get(`${API_BASE}/config`);
};
