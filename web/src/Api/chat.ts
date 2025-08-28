import axios from 'axios';
import { getAuthToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const chatWithAgent = async (query: string): Promise<string> => {
  try {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post(`${API_BASE_URL}/chat/agent_query`, { query }, { headers });
    return response.data.response;
  } catch (error) {
    console.error('Error chatting with agent:', error);
    throw error;
  }
};
