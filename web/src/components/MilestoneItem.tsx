import React from 'react';
import type { Milestone } from '../Api/milestones';

interface MilestoneItemProps {
  milestone: Milestone;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone }) => {
  const progressPercentage = `${milestone.progress}%`; // Convert progress to string with percentage for CSS

  return (
    <li
      key={milestone.id}
      className="relative flex items-center justify-between p-2 border rounded-md overflow-hidden"
    >
      {/* Green fill for progress */}
      <div
        className="absolute inset-0 bg-green-200 opacity-50"
        style={{ width: progressPercentage }}
      ></div>
      <span
        className={`relative z-10 ${milestone.done ? 'line-through text-gray-500' : 'text-gray-800'}`}
      >
        {milestone.name}
      </span>
      {/* You can add more controls here, e.g., a checkbox for 'done' status */}
    </li>
  );
};

export default MilestoneItem;
