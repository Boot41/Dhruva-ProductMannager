import axios from 'axios';

export interface DependencyAnalysisOutput {
  new_feature: string;
  depends_on: number[];
  reasoning: string;
}

export interface DependencyAnalysisRequest {
  project_id: number;
  new_feature: string; // This maps to new_feature_description in backend
}

export const analyzeFeatureDependencies = async (data: DependencyAnalysisRequest): Promise<DependencyAnalysisOutput> => {
  const response = await axios.post<DependencyAnalysisOutput>('/features/analyze-dependencies', data);
  return response.data;
};
