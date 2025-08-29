import axios from 'axios';
import { getAuthToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export type ChatToolAction = {
  type: 'show_task_status' | string
  task_id?: number
  user_id?: number
}

export type ChatAgentResponse = {
  response: string
  tool_action?: ChatToolAction | null
}

export const chatWithAgent = async (query: string): Promise<ChatAgentResponse> => {
  try {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post(`${API_BASE_URL}/chat/agent_query`, { query }, { headers });
    return response.data as ChatAgentResponse;
  } catch (error) {
    console.error('Error chatting with agent:', error);
    throw error;
  }
};
