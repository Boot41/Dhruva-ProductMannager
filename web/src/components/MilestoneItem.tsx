import React, { useState } from 'react';
import type { Milestone } from '../Api/milestones';
import MilestoneFeatures from './MilestoneFeatures';
import AddFeatureDialog from './AddFeatureDialog'; // Import the new dialog component

interface MilestoneItemProps {
  milestone: Milestone;
  projectId: number; // Add projectId to props
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone, projectId }) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [isAddFeatureDialogOpen, setIsAddFeatureDialogOpen] = useState(false); // State for dialog
  const progressPercentage = `${milestone.progress}%`;

  const handleClick = () => {
    setShowFeatures(!showFeatures);
  };

  const handleAddFeatureClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent milestone item from expanding/collapsing
    setIsAddFeatureDialogOpen(true);
  };

  const handleFeatureAdded = () => {
    // Logic to refresh features, if necessary.
    // MilestoneFeatures component already fetches its own data, so a simple re-render might be enough
    // or we can add a prop to MilestoneFeatures to trigger a re-fetch.
    // For now, we'll just close the dialog.
    setIsAddFeatureDialogOpen(false);
    // If MilestoneFeatures needs to be explicitly told to re-fetch,
    // we'd need to pass a callback or state update down to it.
    // For simplicity, assuming MilestoneFeatures will re-render with new data if its props change
    // or if it has its own internal refresh mechanism.
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
          <MilestoneFeatures milestoneId={milestone.id} />
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
    </li>
  );
};

export default MilestoneItem;
