import axios from 'axios';
import { FeatureFlag, Approval, FlagCreateData } from '../types';

// 根据环境自动切换 API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Feature Flags API
export const flagsApi = {
  getAll: async (status?: string): Promise<FeatureFlag[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/flags/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<FeatureFlag> => {
    const response = await api.get(`/flags/${id}`);
    return response.data;
  },

  create: async (data: FlagCreateData): Promise<FeatureFlag> => {
    const response = await api.post('/flags/', data);
    return response.data;
  },

  toggle: async (id: string): Promise<FeatureFlag> => {
    const response = await api.patch(`/flags/${id}/toggle`);
    return response.data;
  },

  updateRollout: async (id: string, rolloutPercentage: number): Promise<FeatureFlag> => {
    const response = await api.patch(`/flags/${id}/rollout`, null, {
      params: { rollout_percentage: rolloutPercentage }
    });
    return response.data;
  },
};

// Approvals API
export const approvalsApi = {
  getAll: async (status?: string, approverId?: string): Promise<Approval[]> => {
    const params: any = {};
    if (status) params.status = status;
    if (approverId) params.approver_id = approverId;
    
    const response = await api.get('/approvals/', { params });
    return response.data;
  },

  getPendingForUser: async (approverId: string): Promise<Approval[]> => {
    const response = await api.get(`/approvals/pending/${approverId}`);
    return response.data;
  },

  create: async (flagId: string, approverId: string): Promise<Approval> => {
    const response = await api.post('/approvals/', {
      flag_id: flagId,
      approver_id: approverId,
    });
    return response.data;
  },

  update: async (
    id: string,
    status: 'approved' | 'rejected',
    comment: string = ''
  ): Promise<Approval> => {
    const response = await api.patch(`/approvals/${id}`, {
      status,
      comment,
    });
    return response.data;
  },
};

export default api;
