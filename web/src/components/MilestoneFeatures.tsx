import React, { useEffect, useState } from 'react';
import { getFeaturesByMilestoneId, type Feature, deleteFeature } from '../Api/features';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faWrench, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import AssignFeatureTaskDialog from './AssignFeatureTaskDialog'; // Import the dialog

interface MilestoneFeaturesProps {
  milestoneId: number;
  projectId: number; // Add projectId to props
  featuresUpdated: boolean; // New prop to trigger refresh
}

const MilestoneFeatures: React.FC<MilestoneFeaturesProps> = ({ milestoneId, projectId, featuresUpdated }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignTaskDialogOpen, setIsAssignTaskDialogOpen] = useState(false);
  const [featureToAssign, setFeatureToAssign] = useState<Feature | null>(null);
  const [taskTypeToAssign, setTaskTypeToAssign] = useState<'bug' | 'refactor' | 'research' | 'feature'>('feature');

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        const fetchedFeatures = await getFeaturesByMilestoneId(milestoneId);
        setFeatures(fetchedFeatures);
      } catch (err) {
        setError('Failed to fetch features.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [milestoneId, featuresUpdated]);

  const handleAssignTaskClick = (feature: Feature, type: 'bug' | 'refactor' | 'research') => {
    setFeatureToAssign(feature);
    setTaskTypeToAssign(type);
    setIsAssignTaskDialogOpen(true);
  };

  const handleTaskAssigned = () => {
    setIsAssignTaskDialogOpen(false);
    setFeatureToAssign(null);
    // Optionally, re-fetch features to update the list if needed
  };

  const handleDeleteFeature = async (featureId: number, featureName: string) => {
    if (window.confirm(`Are you sure you want to delete the feature "${featureName}"?`)) {
      try {
        await deleteFeature(featureId);
        setFeatures(features.filter(feature => feature.id !== featureId));
      } catch (err) {
        setError('Failed to delete feature.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading features...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (features.length === 0) {
    return <div className="text-gray-600">No features mapped to this milestone.</div>;
  }

  return (
    <div className="mt-2 p-2 border-t border-gray-200">
      <h4 className="text-md font-semibold mb-2">Mapped Features:</h4>
      <div className="grid grid-cols-7 gap-4 text-sm font-semibold mb-2">
        <div>Feature Name</div>
        <div>Assigned To</div>
        <div>ETA</div>
        <div>Dependent On</div>
        <div>Status</div>
        <div>Assign</div>
        <div>Actions</div>
      </div>
      {features.map((feature) => (
        <div key={feature.id} className="grid grid-cols-7 gap-4 text-sm py-1 border-b border-gray-100 items-center">
          <div className="text-gray-700">{feature.name}</div>
          <div className="text-gray-600">{feature.assigned_to?.name || 'Unassigned'}</div>
          <div className="text-gray-600">{feature.eta ? new Date(feature.eta).toLocaleDateString() : 'No ETA'}</div>
          <div className="text-gray-600">None</div>
          <div className="text-gray-600">
            <select
              value={feature.status}
              onChange={(e) => console.log(`Feature ${feature.id} status changed to: ${e.target.value}`)}
              className="p-1 border rounded-md"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => handleAssignTaskClick(feature, 'bug')} className="text-red-500 hover:text-red-700"><FontAwesomeIcon icon={faBug} title="Create Bug Task" /></button>
            <button onClick={() => handleAssignTaskClick(feature, 'refactor')} className="text-blue-500 hover:text-blue-700"><FontAwesomeIcon icon={faWrench} title="Create Refactor Task" /></button>
            <button onClick={() => handleAssignTaskClick(feature, 'research')} className="text-green-500 hover:text-green-700"><FontAwesomeIcon icon={faSearch} title="Create Research Task" /></button>
          </div>
          <div className="flex items-center">
            <button onClick={() => handleDeleteFeature(feature.id, feature.name)} className="text-gray-500 hover:text-gray-700"><FontAwesomeIcon icon={faTrash} title="Delete Feature" /></button>
          </div>
        </div>
      ))}

      {featureToAssign && (
        <AssignFeatureTaskDialog
          isOpen={isAssignTaskDialogOpen}
          onClose={() => setIsAssignTaskDialogOpen(false)}
          onTaskAssigned={handleTaskAssigned}
          projectId={projectId}
          featureId={featureToAssign.id}
          featureName={featureToAssign.name}
          taskType={taskTypeToAssign}
        />
      )}
    </div>
  );
};

export default MilestoneFeatures;