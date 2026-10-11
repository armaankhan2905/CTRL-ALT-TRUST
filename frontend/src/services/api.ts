import axios from 'axios';
import {
  User, UserRole, Device, SCADAAsset, SCADACommandResponse,
  SecurityEvent, SecurityAlert, AttackSimulationResponse,
  MLMetrics, Vulnerability, DashboardSummary
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trust_grid_token') || localStorage.getItem('scada_sentinel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  signup: async (data: { full_name: string; email: string; password: string; organization?: string; role?: string }) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const scadaAPI = {
  getState: async (): Promise<SCADAAsset[]> => {
    const res = await api.get('/scada/state');
    return res.data;
  },
  refreshTelemetry: async (): Promise<SCADAAsset[]> => {
    const res = await api.post('/scada/telemetry/refresh');
    return res.data;
  },
  sendCommand: async (cmd: {
    target_asset: string;
    command_type: string;
    device_name?: string;
    ip_address?: string;
    override_time?: string;
    force_unknown_device?: boolean;
    force_external_ip?: boolean;
    secondary_confirmation?: boolean;
  }): Promise<SCADACommandResponse> => {
    const res = await api.post('/scada/command', cmd);
    return res.data;
  }
};

export const attackAPI = {
  simulate: async (attackType: string, targetAsset = 'PUMP-01'): Promise<AttackSimulationResponse> => {
    const res = await api.post('/attacks/simulate', { attack_type: attackType, target_asset: targetAsset });
    return res.data;
  }
};

export const devicesAPI = {
  list: async (): Promise<Device[]> => {
    const res = await api.get('/devices');
    return res.data;
  },
  create: async (data: Partial<Device>): Promise<Device> => {
    const res = await api.post('/devices', data);
    return res.data;
  },
  isolate: async (id: number): Promise<Device> => {
    const res = await api.post(`/devices/${id}/isolate`);
    return res.data;
  },
  update: async (id: number, data: Partial<Device>): Promise<Device> => {
    const res = await api.patch(`/devices/${id}`, data);
    return res.data;
  }
};

export const usersAPI = {
  list: async (): Promise<User[]> => {
    const res = await api.get('/users');
    return res.data;
  },
  approve: async (id: number): Promise<User> => {
    const res = await api.post(`/users/${id}/approve`);
    return res.data;
  },
  reject: async (id: number): Promise<User> => {
    const res = await api.post(`/users/${id}/reject`);
    return res.data;
  },
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
  reactivate: async (id: number): Promise<User> => {
    const res = await api.post(`/users/${id}/reactivate`);
    return res.data;
  }
};

export const logsAPI = {
  getEvents: async (): Promise<SecurityEvent[]> => {
    const res = await api.get('/security/events');
    return res.data;
  },
  getAlerts: async (): Promise<SecurityAlert[]> => {
    const res = await api.get('/security/alerts');
    return res.data;
  }
};

export const mlAPI = {
  getMetrics: async (): Promise<MLMetrics> => {
    const res = await api.get('/ml/metrics');
    return res.data;
  },
  selectModel: async (modelName: string) => {
    const res = await api.post('/ml/model/select', null, { params: { model_name: modelName } });
    return res.data;
  }
};

export const vulnAPI = {
  list: async (): Promise<Vulnerability[]> => {
    const res = await api.get('/vulnerabilities');
    return res.data;
  }
};

export const cryptoAPI = {
  getDemoKeys: async () => {
    const res = await api.get('/crypto/demo');
    return res.data;
  },
  encrypt: async (payload: string) => {
    const res = await api.post('/crypto/encrypt', null, { params: { payload } });
    return res.data;
  },
  decrypt: async (ciphertext: string) => {
    const res = await api.post('/crypto/decrypt', null, { params: { ciphertext_base64: ciphertext } });
    return res.data;
  }
};

export const dashboardAPI = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  }
};

export default api;
