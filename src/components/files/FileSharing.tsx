import { useState, useEffect } from "react";
import { apiClient, File, FileShare, User } from "../../lib/api";
import {
  Share2,
  Users,
  X,
  Check,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Shield,
  UserCheck,
  Crown,
  Search,
  Send,
} from "lucide-react";

interface FileSharingProps {
  file: File;
  onClose: () => void;
  onShareUpdate?: () => void;
}

interface ShareFormData {
  userId: string;
  permissionLevel: "read" | "write" | "admin";
}

export const FileSharing = ({
  file,
  onClose,
  onShareUpdate,
}: FileSharingProps) => {
  const [shares, setShares] = useState<FileShare[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ShareFormData>({
    userId: "",
    permissionLevel: "read",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFileShares();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.file_id]);

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
      const result = await apiClient.getUsers();
      setUsers(result.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Try fallback to developers endpoint
      try {
        const devResult = await apiClient.getUsersByRole("DEVELOPER");
        setUsers(devResult.users || []);
      } catch (devError) {
        console.error("Error fetching developers:", devError);
      }
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

    setSharing(true);
    setError(null);

    try {
      const result = await apiClient.shareFile(
        file.file_id,
        formData.userId,
        formData.permissionLevel
      );

      if (result.success) {
        setShares((prev) => [...prev, result.share]);
        setFormData({ userId: "", permissionLevel: "read" });
        setShowAddForm(false);
        onShareUpdate?.();
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      setError(error instanceof Error ? error.message : "Failed to share file");
    } finally {
      setSharing(false);
    }
  };

  const handleShareWithTeam = async (
    permissionLevel: "read" | "write" | "admin" = "read"
  ) => {
    setSharing(true);
    setError(null);

    try {
      const result = await apiClient.shareWithProjectTeam(
        file.file_id,
        permissionLevel
      );

      if (result.success) {
        setShares((prev) => [...prev, ...result.shares]);
        onShareUpdate?.();
      }
    } catch (error) {
      console.error("Error sharing with team:", error);
      setError(
        error instanceof Error ? error.message : "Failed to share with team"
      );
    } finally {
      setSharing(false);
    }
  };

  const handleUpdatePermission = async (
    shareId: string,
    newPermission: "read" | "write" | "admin"
  ) => {
    try {
      const result = await apiClient.updateSharePermission(
        shareId,
        newPermission
      );

      if (result.success) {
        setShares((prev) =>
          prev.map((share) =>
            share.share_id === shareId
              ? { ...share, permission_level: newPermission }
              : share
          )
        );
        onShareUpdate?.();
      }
    } catch (error) {
      console.error("Error updating permission:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update permission"
      );
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

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "read":
        return <Eye className="w-4 h-4 text-blue-400" />;
      case "write":
        return <Edit3 className="w-4 h-4 text-green-400" />;
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "read":
        return "bg-blue-500/20 text-blue-400";
      case "write":
        return "bg-green-500/20 text-green-400";
      case "admin":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
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
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShareWithTeam("read")}
                disabled={sharing}
                className="btn-ghost flex items-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                Share with Project Team (Read)
              </button>
              <button
                onClick={() => handleShareWithTeam("write")}
                disabled={sharing}
                className="btn-ghost flex items-center gap-2 disabled:opacity-50"
              >
                <Edit3 className="w-4 h-4" />
                Share with Project Team (Write)
              </button>
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
                          <div className="text-sm font-medium">
                            {user.username}
                          </div>
                          <div className="text-xs opacity-60">{user.email}</div>
                        </button>
                      ))}
                      {filteredUsers.length === 0 && (
                        <p className="text-sm opacity-50 p-2">No users found</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Permission Level
                    </label>
                    <select
                      value={formData.permissionLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissionLevel: e.target.value as
                            | "read"
                            | "write"
                            | "admin",
                        })
                      }
                      className="select w-full"
                    >
                      <option value="read">Read Only</option>
                      <option value="write">Read & Write</option>
                      <option value="admin">Admin Access</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({ userId: "", permissionLevel: "read" });
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
                          {getPermissionIcon(share.permission_level)}
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
                        <select
                          value={share.permission_level}
                          onChange={(e) =>
                            handleUpdatePermission(
                              share.share_id,
                              e.target.value as "read" | "write" | "admin"
                            )
                          }
                          className={`text-xs px-2 py-1 rounded-full font-medium border-none outline-none bg-transparent ${getPermissionColor(
                            share.permission_level
                          )}`}
                        >
                          <option value="read">Read</option>
                          <option value="write">Write</option>
                          <option value="admin">Admin</option>
                        </select>

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
