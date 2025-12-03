import { useState } from "react";
import {
  Users,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { apiClient } from "../../lib/api";

interface TeamMember {
  team_member_id: string;
  role_in_team: string;
  user: {
    user_id: string;
    username: string;
    email: string;
    role: string;
  };
}

interface Team {
  team_id: string;
  team_name: string;
  description?: string;
  manager_id: string;
  created_at: string;
  manager: {
    user_id: string;
    username: string;
    email: string;
  };
  team_members: TeamMember[];
}

interface TeamListProps {
  teams: Team[];
  onRefresh: () => void;
}

export const TeamList = ({ teams, onRefresh }: TeamListProps) => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({ team_name: "", description: "" });
  const [addingMember, setAddingMember] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("DEVELOPER");
  const [loading, setLoading] = useState(false);

  const toggleTeam = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const handleEditClick = (team: Team) => {
    setEditingTeam(team);
    setEditForm({
      team_name: team.team_name,
      description: team.description || "",
    });
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    try {
      setLoading(true);
      await apiClient.put(`/teams/${editingTeam.team_id}`, editForm);
      setEditingTeam(null);
      onRefresh();
    } catch (error) {
      console.error("Error updating team:", error);
      alert("Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"?`)) return;

    try {
      setLoading(true);
      await apiClient.delete(`/teams/${teamId}`);
      onRefresh();
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemberClick = async (teamId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get("/teams/available-users");
      setAvailableUsers(response.users || []);
      setAddingMember(teamId);
      setSelectedUserId("");
      setSelectedRole("DEVELOPER");
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load available users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (teamId: string) => {
    if (!selectedUserId) {
      alert("Please select a user");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(`/teams/${teamId}/members`, {
        userId: selectedUserId,
        roleInTeam: selectedRole,
      });
      setAddingMember(null);
      onRefresh();
    } catch (error: any) {
      console.error("Error adding member:", error);
      alert(error.response?.data?.error || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (
    teamId: string,
    userId: string,
    username: string
  ) => {
    if (!confirm(`Remove ${username} from this team?`)) return;

    try {
      setLoading(true);
      await apiClient.delete(`/teams/${teamId}/members/${userId}`);
      onRefresh();
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MANAGER":
        return "bg-purple-500/20 text-purple-300 border-purple-500/50";
      case "LEAD_DEVELOPER":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "DEVELOPER":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  if (teams.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
        <p className="opacity-70 mb-4">
          Create your first team to start collaborating
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <div key={team.team_id} className="glass rounded-xl overflow-hidden">
          {/* Team Header */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                    <Users
                      className="w-5 h-5"
                      style={{ color: "var(--brand)" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{team.team_name}</h3>
                    <p className="text-sm opacity-70">
                      Manager: {team.manager.username}
                    </p>
                  </div>
                </div>
                {team.description && (
                  <p className="text-sm opacity-70 mt-2">{team.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="opacity-70">
                    {team.team_members?.length || 0} members
                  </span>
                  <span className="opacity-50">
                    Created {new Date(team.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditClick(team)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit team"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTeam(team.team_id, team.team_name)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                  title="Delete team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleTeam(team.team_id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {expandedTeam === team.team_id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Team Members */}
          {expandedTeam === team.team_id && (
            <div className="border-t border-white/10 p-6 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Team Members</h4>
                <button
                  onClick={() => handleAddMemberClick(team.team_id)}
                  className="btn-ghost text-sm"
                  disabled={loading}
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
              </div>

              {/* Add Member Form */}
              {addingMember === team.team_id && (
                <div className="glass-soft p-4 rounded-lg mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select User
                      </label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="input w-full"
                      >
                        <option value="">Choose a user...</option>
                        {availableUsers.map((user) => (
                          <option key={user.user_id} value={user.user_id}>
                            {user.username} ({user.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Role in Team
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="input w-full"
                      >
                        <option value="DEVELOPER">Developer</option>
                        <option value="LEAD_DEVELOPER">Lead Developer</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAddingMember(null)}
                      className="btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddMember(team.team_id)}
                      className="btn-primary flex-1"
                      disabled={loading}
                    >
                      Add Member
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {team.team_members?.map((member) => (
                  <div
                    key={member.team_member_id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold">
                        {member.user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.user.username}
                        </div>
                        <div className="text-xs opacity-70">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${getRoleBadgeColor(
                          member.role_in_team
                        )}`}
                      >
                        {member.role_in_team.replace("_", " ")}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded border ${getRoleBadgeColor(
                          member.user.role
                        )}`}
                      >
                        {member.user.role}
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveMember(
                            team.team_id,
                            member.user.user_id,
                            member.user.username
                          )
                        }
                        className="p-1 hover:bg-white/10 rounded text-red-400"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingTeam(null)}
          />
          <div className="relative glass rounded-xl p-6 w-full max-w-md animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">Edit Team</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editForm.team_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, team_name: e.target.value })
                  }
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="input w-full h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTeam(null)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTeam}
                className="btn-primary flex-1"
                disabled={loading}
              >
                Update Team
              </button>
            </div>
          </div>
        </div>
      )}

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
