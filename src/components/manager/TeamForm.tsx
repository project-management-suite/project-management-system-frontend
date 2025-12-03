import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { X, Users, Loader } from "lucide-react";

interface TeamFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  user_id: string;
  username: string;
  email: string;
  role: string;
}

export const TeamForm = ({ onClose, onSuccess }: TeamFormProps) => {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiClient.get("/teams/available-users");
      setAvailableUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load available users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    try {
      setLoading(true);

      // Create the team
      const response = await apiClient.post("/teams", {
        team_name: teamName,
        description: description || undefined,
      });

      const teamId = response.team.team_id;

      // Add members to the team
      if (selectedMembers.length > 0) {
        await Promise.all(
          selectedMembers.map((userId) =>
            apiClient.post(`/teams/${teamId}/members`, {
              userId,
              roleInTeam: "DEVELOPER",
            })
          )
        );
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error creating team:", error);
      setError(
        error.response?.data?.error ||
          "Failed to create team. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
              <Users className="w-5 h-5" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Create New Team</h3>
              <p className="text-sm opacity-70">
                Build your team and assign members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Team Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="input w-full"
              placeholder="e.g., Frontend Team, Backend Team"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full h-24 resize-none"
              placeholder="Brief description of the team's role and responsibilities"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Team Members (Optional)
            </label>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="glass-soft p-4 rounded-lg text-center opacity-70">
                No users available to add
              </div>
            ) : (
              <div className="glass-soft rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {availableUsers.map((user) => (
                  <label
                    key={user.user_id}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.user_id)}
                      onChange={() => toggleMember(user.user_id)}
                      className="w-4 h-4 rounded border-white/20"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs opacity-70">{user.email}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                      {user.role}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {selectedMembers.length > 0 && (
              <div className="mt-2 text-sm opacity-70">
                {selectedMembers.length} member
                {selectedMembers.length > 1 ? "s" : ""} selected
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
