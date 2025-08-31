import React, { useState, useEffect } from 'react';
import AddMilestoneDialog from './AddMilestoneDialog';
import type { Milestone } from '../Api/milestones';
import { createMilestone, getMilestonesByProjectId } from '../Api/milestones';
import MilestoneItem from './MilestoneItem';

interface MilestonesDisplayProps {
  projectId: number;
}

const MilestonesDisplay: React.FC<MilestonesDisplayProps> = ({ projectId }) => {
  const [isAddMilestoneDialogOpen, setIsAddMilestoneDialogOpen] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedMilestones = await getMilestonesByProjectId(projectId);
      setMilestones(fetchedMilestones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchMilestones();
    }
  }, [projectId]);

  const handleAddMilestone = async (milestoneName: string) => {
    try {
      await createMilestone({
        project_id: projectId,
        name: milestoneName,
        done: false, // Default to false
      });
      setIsAddMilestoneDialogOpen(false);
      fetchMilestones(); // Re-fetch milestones after adding a new one
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add milestone');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-gray-600 text-center py-4">Loading milestones...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Project Milestones</h3>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddMilestoneDialogOpen(true)}
        >
          Add Milestone
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="text-gray-600">No milestones available.</div>
      ) : (
        <ul className="space-y-2">
          {milestones.map((milestone) => (
            <MilestoneItem key={milestone.id} milestone={milestone} projectId={projectId} />
          ))}
        </ul>
      )}

      <AddMilestoneDialog
        open={isAddMilestoneDialogOpen}
        onClose={() => setIsAddMilestoneDialogOpen(false)}
        onAdd={handleAddMilestone}
      />
    </div>
  );
};

export default MilestonesDisplay;