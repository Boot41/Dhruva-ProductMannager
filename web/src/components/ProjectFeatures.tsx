import React, { useEffect, useState } from 'react';
import { getProject, type Project } from '../Api/projects';
import type { Milestone } from '../Api/projects';

interface ProjectFeaturesProps {
  projectId: number;
}

const ProjectFeatures: React.FC<ProjectFeaturesProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [openMilestoneIndex, setOpenMilestoneIndex] = useState<number | null>(null);

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

  if (!project || !project.progress || !project.progress.milestones) {
    return <div className="text-gray-600 text-center py-4">No milestones found for this project.</div>;
  }

  const progressPercent = project.progress.percent || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Project Milestones</h3>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-medium text-gray-700">Overall Progress</span>
          <span className="text-lg font-semibold text-blue-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Milestones List */}
      <ul className="space-y-4">
        {project.progress.milestones.map((milestone: Milestone, index: number) => (
          <li key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className={`flex items-center justify-between w-full p-3 text-left font-medium
                ${openMilestoneIndex === index ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 text-gray-700'}
                hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              onClick={() => setOpenMilestoneIndex(openMilestoneIndex === index ? null : index)}
            >
              <span>{milestone.name}</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200
                  ${openMilestoneIndex === index ? 'rotate-180' : 'rotate-0'}
                `}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {openMilestoneIndex === index && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Features (Dummy):</span>
                    <ul className="list-disc list-inside ml-4">
                      <li>Feature X</li>
                      <li>Feature Y</li>
                      <li>Feature Z</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold">Progress (Dummy):</span> 75%
                  </div>
                  <div>
                    <span className="font-semibold">Status (Dummy):</span> In Progress
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectFeatures;
