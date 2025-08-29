
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { createProject, type ProjectCreate, createUserProject } from '../Api/projects';
import { createSystemDesign } from '../Api/systemDesign';
import { getUserProfile } from '../Api/user';
import UserSearchInput from '../components/UserSearchInput';
import type { User } from '../Api/auth';
import { createTaskAssignment } from '../Api/tasks';

export default function AddProject() {
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState<string>('Loading...');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Project core fields (what backend actually accepts)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('development');
  const [lead, setLead] = useState<User | undefined>(undefined);

  // Extra context fields (not yet stored by backend schema, collected for future use)
  const [features, setFeatures] = useState('');
  const [expectedUsers, setExpectedUsers] = useState('');
  const [geography, setGeography] = useState('');
  const [techStack, setTechStack] = useState('');

  useEffect(() => {
    // Fetch current user to show as the owner (owner is set server-side from token)
    getUserProfile()
      .then((u) => {
        setUser(u);
        setOwnerName(u.name || u.email);
      })
      .catch(() => setOwnerName('Current user'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a project description');
      return;
    }

    try {
      setLoading(true);
      const payload: ProjectCreate = { name, description, status, lead: lead?.username };
      const project = await createProject(payload);

      // Fire-and-forget system design generation/store (non-blocking UX)
      if (features || expectedUsers || geography || techStack) {
        createSystemDesign({
          features,
          expected_users: expectedUsers,
          geography,
          tech_stack: techStack || undefined,
          project_id: project.id,
        }).catch((e) => {
          // Swallow error but surface minimally to console; project creation already succeeded
          console.error('System design generation failed:', e);
        });
      }

      // Add lead to project
      if (lead && lead.id) {
        await createUserProject(lead.id, project.id, 'lead');
      }

      console.log('Lead object:', lead);
      console.log('Project object:', project);
      // Fire-and-forget task assignment for "Approve Design"
      if (lead && lead.id) { // Ensure lead is a User object with an ID
        createTaskAssignment({
          description: 'Approve Design',
          user_id: lead.id,
          project_id: project.id,
          status: 'todo', // Assuming initial status is 'todo'
          type: 'design', // Assuming type 'design'
        }).catch((e) => {
          console.error('Task assignment failed:', e);
        });
      }

      navigate('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-[color:var(--color-secondary-900)] mb-8">Add New Project</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-500">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Owner
            </label>
            <input
              type="text"
              value={ownerName}
              disabled
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] bg-gray-50 text-[color:var(--color-secondary-700)] rounded-md"
            />
            <p className="text-xs text-[color:var(--color-secondary-500)] mt-1">Owner is automatically set to the logged-in user.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Growth Analytics Platform"
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Briefly describe the project goals and scope"
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Project Lead
            </label>
            {user?.company ? (
              <UserSearchInput
                companyName={user.company}
                onSelectUser={(user) => setLead(user)}
              />
            ) : (
              <input
                type="text"
                placeholder="Enter lead username"
                className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md"
                onChange={(e) => setLead(undefined)} // Set lead to undefined if manually typed
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Features
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={3}
              placeholder="Key features or a feature list"
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Expected User Base
            </label>
            <textarea
              value={expectedUsers}
              onChange={(e) => setExpectedUsers(e.target.value)}
              rows={3}
              placeholder="User types, scale, and usage patterns"
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Where will this project be used? (Geography)
            </label>
            <textarea
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              rows={2}
              placeholder="Regions, countries, data residency, latency needs"
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Tech Stack (optional)
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g., React, FastAPI, Postgres, Redis, GCP"
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-secondary-700)] mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-[color:var(--color-secondary-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="development">Development</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
