import { useState, useEffect } from 'react'
import { getCurrentUser } from '../Api/auth'
import { updateUserSkills } from '../Api/user'
import type { User } from '../Api/auth'

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [skills, setSkills] = useState<Record<string, any>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const userData = await getCurrentUser()
      if (userData) {
        setUser(userData)
        setSkills(userData.skills || {})
      }
    } catch (err) {
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSkills = async () => {
    setSaving(true)
    setError(null)
    try {
      const updatedUser = await updateUserSkills(skills)
      setUser(updatedUser)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skills')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    const skillName = prompt('Enter skill name:')
    const skillLevel = prompt('Enter skill level (1-10):')
    if (skillName && skillLevel) {
      setSkills(prev => ({
        ...prev,
        [skillName]: {
          level: parseInt(skillLevel),
          category: 'general'
        }
      }))
    }
  }

  const removeSkill = (skillName: string) => {
    setSkills(prev => {
      const newSkills = { ...prev }
      delete newSkills[skillName]
      return newSkills
    })
  }

  const updateSkillLevel = (skillName: string, level: number) => {
    setSkills(prev => ({
      ...prev,
      [skillName]: {
        ...prev[skillName],
        level
      }
    }))
  }

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="px-4 py-8">
        <div className="text-center text-red-500">Failed to load user profile</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <p className="mt-1 text-sm text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900">{user.role || 'User'}</p>
            </div>
            {user.company && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <p className="mt-1 text-sm text-gray-900">{user.company}</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
            <div className="space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Skills
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSkills(user.skills || {})
                      setError(null)
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSkills}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          {Object.keys(skills).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Added</h3>
              <p className="text-gray-500 mb-4">Add your skills to showcase your expertise</p>
              {isEditing && (
                <button
                  onClick={addSkill}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Skill
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {isEditing && (
                <button
                  onClick={addSkill}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  + Add Skill
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(skills).map(([skillName, skillData]) => (
                  <div key={skillName} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{skillName}</h4>
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skillName)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Level</span>
                        <span>{skillData?.level || 0}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${((skillData?.level || 0) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {isEditing && (
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={skillData?.level || 1}
                        onChange={(e) => updateSkillLevel(skillName, parseInt(e.target.value))}
                        className="w-full"
                      />
                    )}

                    {skillData?.category && (
                      <div className="mt-2">
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {skillData.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
