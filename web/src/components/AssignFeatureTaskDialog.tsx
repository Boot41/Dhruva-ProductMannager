import { useEffect, useState, type FormEvent } from 'react';
import { createTaskAssignment, type TaskAssignmentCreate } from '../Api/tasks';
import { getCurrentUser, type User } from '../Api/auth';
import { searchEmployees } from '../Api/user';
import Button from './Button';

interface AssignFeatureTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAssigned?: () => void;
  projectId: number;
  featureId: number;
  featureName: string; // To display in the dialog
}

export default function AssignFeatureTaskDialog({
  isOpen,
  onClose,
  onTaskAssigned,
  projectId,
  featureId,
  featureName,
}: AssignFeatureTaskDialogProps) {
  const [me, setMe] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [assignedUserSearchQuery, setAssignedUserSearchQuery] = useState<string>('');
  const [assignedUserSearchResults, setAssignedUserSearchResults] = useState<User[]>([]);
  const [searchingUsers, setSearchingUsers] = useState<boolean>(false);
  const [assignedUserSearchError, setAssignedUserSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    async function load() {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Not logged in');
        if (mounted) {
          setMe(user);
        }
      } catch (e) {
        // ignore; header will manage login elsewhere
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const handleSearchUsers = async () => {
    if (!me || !me.company || !assignedUserSearchQuery) return;

    setSearchingUsers(true);
    setAssignedUserSearchError(null);
    try {
      const results = await searchEmployees(me.company, assignedUserSearchQuery);
      const filteredResults = results.filter(user => (user.level ?? 10) <= (me?.level || 0));
      setAssignedUserSearchResults(filteredResults);
    } catch (err) {
      setAssignedUserSearchError(err instanceof Error ? err.message : 'Failed to search users');
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleSelectAssignedUser = (user: User) => {
    setAssignedUser(user);
    setAssignedUserSearchResults([]);
    setAssignedUserSearchQuery(user.name);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!me || !assignedUser) {
      setError('Please select a user to assign the task.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const payload: TaskAssignmentCreate = {
        user_id: assignedUser.id,
        project_id: projectId,
        type: 'feature', // Always 'feature' for this dialog
        description: `Implement feature: ${featureName}`, // Default description
        status: 'assigned', // Default status
        feature_id: featureId,
      };
      await createTaskAssignment(payload);

      setAssignedUser(null);
      setAssignedUserSearchQuery('');
      onTaskAssigned && onTaskAssigned();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-[500px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[color:var(--color-secondary-900)]">
            Assign Task for Feature: {featureName}
          </h3>
          <button
            onClick={onClose}
            className="text-[color:var(--color-secondary-500)] hover:text-[color:var(--color-secondary-700)]"
          >
            &times;
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4">{error}</div>
        )}
        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">
              Assign to User
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={assignedUserSearchQuery}
                onChange={(e) => {
                  setAssignedUserSearchQuery(e.target.value);
                  setAssignedUser(null);
                }}
                placeholder="Search user by name..."
                className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
              />
              <Button onClick={handleSearchUsers} type="button" disabled={searchingUsers || !me?.company}>
                {searchingUsers ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {assignedUserSearchError && (
              <div className="text-red-500 text-sm mt-1">{assignedUserSearchError}</div>
            )}
            {assignedUserSearchResults.length > 0 && (
              <ul className="border border-[color:var(--color-secondary-300)] rounded-md mt-2 max-h-40 overflow-y-auto">
                {assignedUserSearchResults.map((user) => (
                  <li
                    key={user.id}
                    className="px-3 py-2 cursor-pointer hover:bg-[color:var(--color-secondary-100)]"
                    onClick={() => handleSelectAssignedUser(user)}
                  >
                    {user.name} ({user.email})
                  </li>
                ))}
              </ul>
            )}
            {assignedUser && (
              <div className="mt-2 text-sm text-[color:var(--color-secondary-700)]">
                Assigned to: {assignedUser.name} ({assignedUser.email})
              </div>
            )}
          </div>

          <div>
            <Button type="submit" disabled={submitting || !assignedUser}>
              {submitting ? 'Assigning...' : 'Assign Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
