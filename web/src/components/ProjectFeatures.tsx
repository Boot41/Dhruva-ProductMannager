import React, { useEffect, useState } from 'react';
import { getProject, type Project } from '../Api/projects';
import MilestonesDisplay from './MilestonesDisplay';

interface ProjectFeaturesProps {
  projectId: number;
}

const ProjectFeatures: React.FC<ProjectFeaturesProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [isUpdating, setIsUpdating] = useState<boolean>(false);
  // milestones/progress removed from schema

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const data = await getProject(projectId);
        setProject(data);
      } catch (err) {
        setError('Failed to fetch project details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  

  if (loading) {
    return <div className="text-gray-600 text-center py-4">Loading project features...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!project) {
    return <div className="text-gray-600 text-center py-4">No project data available.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <MilestonesDisplay projectId={projectId} />
    </div>
  );
};

export default ProjectFeatures;
