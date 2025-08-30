import React, { useState } from 'react';
import type { Milestone } from '../Api/milestones';
import MilestoneFeatures from './MilestoneFeatures'; // Import the new component

interface MilestoneItemProps {
  milestone: Milestone;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone }) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const progressPercentage = `${milestone.progress}%`;

  const handleClick = () => {
    setShowFeatures(!showFeatures);
  };

  return (
    <li
      key={milestone.id}
      className="relative flex flex-col p-2 border rounded-md overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Header with progress background */}
      <div className="relative w-full mb-2">
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

      {/* Features only show when expanded */}
      {showFeatures && (
        <div className="mt-2">
          <MilestoneFeatures milestoneId={milestone.id} />
        </div>
      )}
    </li>
  );
};

export default MilestoneItem;
