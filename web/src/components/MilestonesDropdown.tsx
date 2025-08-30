import React, { useState } from 'react';
import type { Milestone } from '../Api/projects';

interface MilestonesDropdownProps {
  milestones: Milestone[];
}

const MilestonesDropdown: React.FC<MilestonesDropdownProps> = ({ milestones }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Dummy data for features, progress, and status
  const dummyData = {
    features: ['Feature A', 'Feature B', 'Feature C'],
    progress: ['25%', '50%', '75%', '100%'],
    status: ['Not Started', 'In Progress', 'Completed'],
  };

  const getRandomDummy = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  return (
    <div className="relative inline-block w-full">
      <button
        type="button"
        className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={toggleDropdown}
      >
        <span>Select Milestone Details</span>
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {/* Header for columns */}
            <div className="flex px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200">
              <span className="w-1/4">Milestone</span>
              <span className="w-1/4">Features (Dummy)</span>
              <span className="w-1/4">Progress (Dummy)</span>
              <span className="w-1/4">Status (Dummy)</span>
            </div>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                <span className="w-1/4 font-medium">{milestone.name}</span>
                <span className="w-1/4">{getRandomDummy(dummyData.features)}</span>
                <span className="w-1/4">{getRandomDummy(dummyData.progress)}</span>
                <span className="w-1/4">{getRandomDummy(dummyData.status)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestonesDropdown;
