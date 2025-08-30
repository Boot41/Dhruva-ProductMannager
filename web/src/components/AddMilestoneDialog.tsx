import React, { useState } from 'react';

interface AddMilestoneDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (milestoneName: string) => void;
}

const AddMilestoneDialog: React.FC<AddMilestoneDialogProps> = ({ open, onClose, onAdd }) => {
  const [milestoneName, setMilestoneName] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (milestoneName.trim()) {
      onAdd(milestoneName);
      setMilestoneName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-xl font-bold mb-4">Add New Milestone</h3>
        <input
          type="text"
          className="border border-gray-300 p-2 w-full rounded-md mb-4"
          placeholder="Milestone Name"
          value={milestoneName}
          onChange={(e) => setMilestoneName(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMilestoneDialog;
