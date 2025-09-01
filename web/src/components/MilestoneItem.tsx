import React, { useState } from 'react';
import type { Milestone } from '../Api/milestones';
import type { Feature } from '../Api/features'; // Import Feature type
import MilestoneFeatures from './MilestoneFeatures';
import AddFeatureDialog from './AddFeatureDialog';
import AssignFeatureTaskDialog from './AssignFeatureTaskDialog'; // Import the new dialog

interface MilestoneItemProps {
  milestone: Milestone;
  projectId: number; // Add projectId to props
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone, projectId }) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [isAddFeatureDialogOpen, setIsAddFeatureDialogOpen] = useState(false);
  const [isAssignTaskDialogOpen, setIsAssignTaskDialogOpen] = useState(false); // State for assign task dialog
  const [featureToAssign, setFeatureToAssign] = useState<Feature | null>(null); // State to hold feature details for assignment
  const [featuresUpdated, setFeaturesUpdated] = useState(false); // New state to trigger feature refresh
  const progressPercentage = `${milestone.progress}%`;

  const handleClick = () => {
    setShowFeatures(!showFeatures);
  };

  const handleAddFeatureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddFeatureDialogOpen(true);
  };

  const handleFeatureAdded = (feature: Feature) => {
    setIsAddFeatureDialogOpen(false);
    setFeatureToAssign(feature);
    setIsAssignTaskDialogOpen(true);
    setFeaturesUpdated(prev => !prev); // Toggle to trigger refresh in MilestoneFeatures
  };

  const handleTaskAssigned = () => {
    setIsAssignTaskDialogOpen(false);
    setFeatureToAssign(null);
    // Optionally, trigger a refresh of MilestoneFeatures if needed
  };

  return (
    <li
      key={milestone.id}
      className="relative flex flex-col p-2 border rounded-md overflow-hidden cursor-pointer"
    >
      {/* Header with progress background */}
      <div className="relative w-full mb-2" onClick={handleClick}> {/* Make header clickable */}
        <div
          className="absolute top-0 left-0 h-full bg-green-200 opacity-50 rounded-md"
          style={{ width: progressPercentage }}
        ></div>
        <span
          className={`relative z-10 px-1 ${
            milestone.done ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
        >
          {milestone.name}
        </span>
      </div>

      {/* Add New Feature Button */}
      <button
        type="button"
        className="absolute top-2 right-2 px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
        onClick={handleAddFeatureClick}
      >
        Add New Feature
      </button>

      {/* Features only show when expanded */}
      {showFeatures && (
        <div className="mt-2">
          <MilestoneFeatures milestoneId={milestone.id} projectId={projectId} featuresUpdated={featuresUpdated} />
        </div>
      )}

      {/* Add Feature Dialog */}
      <AddFeatureDialog
        open={isAddFeatureDialogOpen}
        onClose={() => setIsAddFeatureDialogOpen(false)}
        onAdd={handleFeatureAdded}
        projectId={projectId}
        milestoneId={milestone.id}
      />

      {/* Assign Feature Task Dialog */}
      {featureToAssign && (
        <AssignFeatureTaskDialog
          isOpen={isAssignTaskDialogOpen}
          onClose={() => setIsAssignTaskDialogOpen(false)}
          onTaskAssigned={handleTaskAssigned}
          projectId={projectId}
          featureId={featureToAssign.id}
          featureName={featureToAssign.name} taskType={'feature'}        />
      )}
    </li>
  );
};

export default MilestoneItem;
