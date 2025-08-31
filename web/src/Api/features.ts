import { getAuthToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\\$/, '') || 'http://127.0.0.1:8000';

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

  if (response.status === 204) {
    return; // No content for 204 No Content
  }

  return response.json();
}

export type Feature = {
  id: number;
  project_id: number;
  milestone_id: number | null;
  name: string;
  status: string;
  assigned_to?: { id: number; name: string };
  eta?: string;
};

export type FeatureCreate = {
  project_id: number;
  milestone_id: number | null;
  name: string;
  status?: string;
};

export async function createFeature(featureData: FeatureCreate): Promise<Feature> {
  return makeAuthenticatedRequest('/features/', {
    method: 'POST',
    body: JSON.stringify(featureData),
  });
}

export async function getFeaturesByMilestoneId(milestoneId: number): Promise<Feature[]> {
  return makeAuthenticatedRequest(`/features/milestone/${milestoneId}`);
}

export async function deleteFeature(featureId: number): Promise<void> {
  return makeAuthenticatedRequest(`/features/${featureId}`, {
    method: 'DELETE',
  });
}