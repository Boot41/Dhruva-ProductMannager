import { getAuthToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\\\/$/, '') || 'http://127.0.0.1:8000';

async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export type Milestone = {
  id: number;
  project_id: number;
  name: string;
  done: boolean;
  progress: number;
};

export type MilestoneCreatePayload = {
  project_id: number;
  name: string;
  done?: boolean; // Optional, as backend defaults to false
};

export async function createMilestone(milestoneData: MilestoneCreatePayload): Promise<Milestone> {
  return makeAuthenticatedRequest('/milestones/db', {
    method: 'POST',
    body: JSON.stringify(milestoneData),
  });
}

export async function getMilestonesByProjectId(projectId: number): Promise<Milestone[]> {
  return makeAuthenticatedRequest(`/milestones/project/${projectId}`);
}

export async function getProjectMilestones(projectId: number): Promise<Milestone[]> {
  return makeAuthenticatedRequest(`/milestones/project/${projectId}`);
}