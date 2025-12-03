import { useState, useEffect } from "react";
import { apiClient, File, FileShare, User, Project } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Share2,
  Users,
  X,
  Check,
  Plus,
  Trash2,
  Download,
  Search,
  Send,
  Building2,
  Shield,
} from "lucide-react";

interface FileSharingProps {
  file: File;
  onClose: () => void;
  onShareUpdate?: () => void;
}

interface ShareFormData {
  userId: string;
  teamId?: string;
}

interface TeamWithMembers extends Project {
  member_count: number;
}

export const FileSharing = ({
  file,
  onClose,
  onShareUpdate,
}: FileSharingProps) => {
  const { user } = useAuth();
  const [shares, setShares] = useState<FileShare[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userTeams, setUserTeams] = useState<Project[]>([]);
  const [allTeams, setAllTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ShareFormData>({
    userId: "",
    teamId: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFileShares();
    fetchUsers();
    fetchTeamsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.file_id]);

  const fetchTeamsData = async () => {
    try {
      // Fetch user's teams/projects
      const userProjectsResult = await apiClient.getUserProjects();
      setUserTeams(userProjectsResult.projects || []);

      // Fetch all teams if user is admin or manager
      if (user?.role === "ADMIN" || user?.role === "MANAGER") {
        const allTeamsResult = await apiClient.getAllTeams();
        setAllTeams(allTeamsResult.teams || []);
      }
    } catch (error) {
      console.error("Error fetching teams data:", error);
    }
  };

  const fetchFileShares = async () => {
    try {
      const result = await apiClient.getFileShares(file.file_id);
      setShares(result.shares || []);
    } catch (error) {
      console.error("Error fetching file shares:", error);
      setError("Failed to load file shares");
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await apiClient.getUsersForSharing();
      setUsers(result.users || []);
    } catch (error) {
      console.error("Error fetching users for sharing:", error);
      setError("Failed to load users for sharing");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId) {
      setError("Please select a user to share with");
      return;
    }

    if (sharing) return; // Prevent duplicate calls

    setSharing(true);
    setError(null);

    try {
      const result = await apiClient.shareFile(file.file_id, formData.userId);

      if (result.success) {
        setShares((prev) => [...prev, result.share]);
        setFormData({ userId: "", teamId: "" });
        setShowAddForm(false);
        onShareUpdate?.();

        // Show success message for existing shares
        if ((result as any).isExisting) {
          setError("File is already shared with this user");
        }
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to share file";
      setError(errorMessage);

      // Special handling for duplicate share error
      if (errorMessage.includes("already shared")) {
        setError("This file is already shared with the selected user");
      }
    } finally {
      setSharing(false);
    }
  };

  const handleShareWithTeam = async (projectId?: string) => {
    if (sharing) return; // Prevent duplicate calls

    setSharing(true);
    setError(null);

    try {
      const result = await apiClient.shareWithProjectTeam(
        file.file_id,
        projectId
      );

      if (result.success) {
        setShares((prev) => [...prev, ...result.shares]);
        onShareUpdate?.();
      }
    } catch (error) {
      console.error("Error sharing with team:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to share with team";
      setError(errorMessage);

      // Special handling for partial success in team sharing
      if (errorMessage.includes("already shared")) {
        setError("Some team members may already have access to this file");
      }
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!confirm("Are you sure you want to remove this share?")) {
      return;
    }

    try {
      await apiClient.removeShare(shareId);
      setShares((prev) => prev.filter((share) => share.share_id !== shareId));
      onShareUpdate?.();
    } catch (error) {
      console.error("Error removing share:", error);
      setError(
        error instanceof Error ? error.message : "Failed to remove share"
      );
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      !shares.some((share) => share.shared_with_user_id === user.user_id) &&
      (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="neo-tile rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" style={{ color: "var(--brand)" }} />
            <div>
              <h2 className="text-xl font-bold">Share File</h2>
              <p className="text-sm opacity-70 truncate">
                {file.original_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neo-icon hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 opacity-70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--brand)]" />
              Quick Share
            </h3>
            <div className="space-y-3">
              {/* User's Teams */}
              {userTeams.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">
                    My Teams:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {userTeams.map((team) => (
                      <button
                        key={team.project_id}
                        onClick={() => handleShareWithTeam(team.project_id)}
                        disabled={sharing}
                        className="btn-ghost text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        <Building2 className="w-4 h-4" />
                        {team.project_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Teams for Admin/Manager */}
              {(user?.role === "ADMIN" || user?.role === "MANAGER") &&
                allTeams.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">
                      All Teams:
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {allTeams.map((team) => (
                        <button
                          key={team.project_id}
                          onClick={() => handleShareWithTeam(team.project_id)}
                          disabled={sharing}
                          className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Building2 className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {team.project_name}
                            </div>
                            <div className="text-xs opacity-60">
                              {team.member_count || 0} members
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {userTeams.length === 0 && allTeams.length === 0 && (
                <p className="text-sm opacity-50">
                  No teams available for quick sharing
                </p>
              )}
            </div>
          </div>

          {/* Current Shares */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--brand)]" />
                Current Shares ({shares.length})
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Share
              </button>
            </div>

            {/* Add Share Form */}
            {showAddForm && (
              <div className="glass rounded-lg p-4 mb-4">
                <form onSubmit={handleShare} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Search Users
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full"
                      />
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.user_id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, userId: user.user_id });
                            setSearchQuery(user.username);
                          }}
                          className={`w-full text-left p-2 rounded hover:bg-white/5 transition-colors ${
                            formData.userId === user.user_id
                              ? "bg-white/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {user.username}
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                              {user.role}
                            </span>
                          </div>
                          <div className="text-xs opacity-60">{user.email}</div>
                        </button>
                      ))}
                      {filteredUsers.length === 0 && (
                        <p className="text-sm opacity-50 p-2">No users found</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({ userId: "", teamId: "" });
                        setSearchQuery("");
                      }}
                      className="btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.userId || sharing}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {sharing ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Share
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Shares List */}
            {loading ? (
              <div className="glass rounded-lg p-8 text-center">
                <div className="animate-spin neo-icon w-8 h-8 mx-auto mb-3 flex items-center justify-center rounded-lg">
                  <Share2
                    className="w-5 h-5"
                    style={{ color: "var(--brand)" }}
                  />
                </div>
                <p className="opacity-70">Loading shares...</p>
              </div>
            ) : shares.length === 0 ? (
              <div className="glass rounded-lg p-8 text-center">
                <div className="neo-icon w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl">
                  <Share2 className="w-8 h-8 opacity-30" />
                </div>
                <p className="opacity-70 mb-2">No shares yet</p>
                <p className="text-sm opacity-50">
                  Share this file with team members to start collaborating
                </p>
              </div>
            ) : (
              <div className="glass rounded-lg divide-y divide-white/5">
                {shares.map((share) => (
                  <div
                    key={share.share_id}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                          <Download className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {share.shared_with?.first_name}{" "}
                            {share.shared_with?.last_name}
                          </h4>
                          <p className="text-sm opacity-60">
                            {share.shared_with?.email}
                          </p>
                          <p className="text-xs opacity-50">
                            Shared{" "}
                            {new Date(share.shared_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-500/20 text-blue-400">
                          Read
                        </span>

                        <button
                          onClick={() => handleRemoveShare(share.share_id)}
                          className="neo-icon w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/20"
                          title="Remove share"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="btn-ghost">
            <Check className="w-4 h-4 mr-2" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
