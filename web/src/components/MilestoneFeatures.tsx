import React, { useEffect, useState } from 'react';
import { getFeaturesByMilestoneId, type Feature } from '../Api/features';

interface MilestoneFeaturesProps {
  milestoneId: number;
}

const MilestoneFeatures: React.FC<MilestoneFeaturesProps> = ({ milestoneId }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [milestoneId]);

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
      <div className="grid grid-cols-5 gap-4 text-sm font-semibold mb-2">
        <div>Feature Name</div>
        <div>Assigned To</div>
        <div>ETA</div>
        <div>Dependent On</div>
        <div>Status</div>
      </div>
      {features.map((feature) => (
        <div key={feature.id} className="grid grid-cols-5 gap-4 text-sm py-1 border-b border-gray-100 items-center">
          <div className="text-gray-700">{feature.name}</div>
          <div className="text-gray-600">Placeholder User</div>
          <div className="text-gray-600">2025-12-31</div>
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
        </div>
      ))}
    </div>
  );
};

export default MilestoneFeatures;