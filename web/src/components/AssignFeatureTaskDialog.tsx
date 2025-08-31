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
  taskType: 'bug' | 'refactor' | 'research' | 'feature'; // New prop for task type
}

export default function AssignFeatureTaskDialog({
  isOpen,
  onClose,
  onTaskAssigned,
  projectId,
  featureId,
  featureName,
  taskType,
}: AssignFeatureTaskDialogProps) {
  const [me, setMe] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eta, setEta] = useState<string>('');
  const [description, setDescription] = useState<string>(''); // New state for description

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
    if (!me || !assignedUser || !description || !eta) {
      setError('Please select a user, provide a description, and set an ETA.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const payload: TaskAssignmentCreate = {
        user_id: assignedUser.id,
        project_id: projectId,
        type: taskType, // Use the new taskType prop
        description: description, // Use the description from state
        status: 'assigned', // Default status
        feature_id: featureId,
        eta: eta, // ETA is now required
      };
      await createTaskAssignment(payload);

      setAssignedUser(null);
      setAssignedUserSearchQuery('');
      setDescription(''); // Clear description after submission
      setEta(''); // Clear ETA after submission
      onTaskAssigned && onTaskAssigned();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const dialogTitle = `Assign ${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Task for Feature: ${featureName}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-[500px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[color:var(--color-secondary-900)]">
            {dialogTitle}
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
            <label htmlFor="description" className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
              rows={3}
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="eta" className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-1">
              ETA (e.g., "2025-12-31") <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="eta"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
              required
            />
          </div>

          <div>
            <Button type="submit" disabled={submitting || !assignedUser || !description || !eta}>
              {submitting ? 'Assigning...' : 'Assign Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
