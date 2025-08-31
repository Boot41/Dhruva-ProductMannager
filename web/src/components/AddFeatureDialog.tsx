import React, { useState } from 'react';
import { createFeature, type Feature } from '../Api/features'; // Import the API function and Feature type
import type { FeatureCreate } from '../Api/features';

interface AddFeatureDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (feature: Feature) => void; // Callback for when a feature is added
  projectId: number;
  milestoneId: number;
}

const AddFeatureDialog: React.FC<AddFeatureDialogProps> = ({
  open,
  onClose,
  onAdd,
  projectId,
  milestoneId,
}) => {
  const [featureName, setFeatureName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureName.trim()) {
      setError('Feature name cannot be empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newFeature: FeatureCreate = {
        project_id: projectId,
        milestone_id: milestoneId,
        name: featureName,
        status: 'todo', // Default status
      };
      const result = await createFeature(newFeature);
      onAdd(result); // Notify parent component with the full feature object
      setFeatureName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feature.');
      console.error('Failed to add feature:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-[500px] w-full">
        <h3 className="text-xl font-semibold mb-4">Add New Feature</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="featureName" className="block text-gray-700 text-sm font-bold mb-2">
              Feature Name:
            </label>
            <input
              type="text"
              id="featureName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Feature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFeatureDialog;
