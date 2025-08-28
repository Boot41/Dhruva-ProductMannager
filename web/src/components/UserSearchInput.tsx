import { useState } from 'react';
import { searchEmployees } from '../Api/user';
import type { User } from '../Api/auth';

interface UserSearchInputProps {
  companyName: string;
  onSelectUser: (user: User) => void;
}

export default function UserSearchInput({ companyName, onSelectUser }: UserSearchInputProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = () => {
    if (query.length === 0) {
        setUsers([]);
        setShowDropdown(false);
        return;
    }
    setLoading(true);
    searchEmployees(companyName, query)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => {
        setLoading(false);
        setShowDropdown(true);
      });
  };

  const handleSelectUser = (user: User) => {
    setQuery(user.name || user.username);
    onSelectUser(user);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Enter username to search"
          className="w-full px-3 py-2 border border-r-0 border-[color:var(--color-secondary-300)] rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 border border-[color:var(--color-secondary-300)] bg-gray-50 hover:bg-gray-100 rounded-r-md disabled:opacity-50"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>
      {showDropdown && (
        <ul className="absolute z-10 w-full bg-white border border-[color:var(--color-secondary-300)] rounded-md mt-1 max-h-60 overflow-y-auto">
          {users.length > 0 ? (
            users.map((user) => (
              <li
                key={user.id}
                onMouseDown={() => handleSelectUser(user)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {user.name} ({user.email})
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">No users found.</li>
          )}
        </ul>
      )}
    </div>
  );
}
