import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { Users, UserPlus, X, Check, AlertCircle, Search } from "lucide-react";

interface ProjectMemberAssignmentProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Developer {
  user_id: string;
  username: string;
  email: string;
  role: string;
}

export const ProjectMemberAssignment = ({
  projectId,
  projectName,
  onClose,
  onSuccess,
}: ProjectMemberAssignmentProps) => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [assignedDevelopers, setAssignedDevelopers] = useState<Developer[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all developers
      const developersResponse = await apiClient.getUsersByRole("DEVELOPER");
      setDevelopers(developersResponse.users || []);

      // Get currently assigned developers from project members
      const membersResponse = await apiClient.getProjectMembers(projectId);
      const currentMembers = membersResponse.members || [];

      const assignedDevs = currentMembers
        .map((member) => member.member)
        .filter((member) => member.role === "DEVELOPER");

      setAssignedDevelopers(assignedDevs);
      setSelectedDevelopers(assignedDevs.map((dev) => dev.user_id));
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperToggle = (developerId: string) => {
    setSelectedDevelopers((prev) =>
      prev.includes(developerId)
        ? prev.filter((id) => id !== developerId)
        : [...prev, developerId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Get the difference between current and selected developers
      const currentlyAssigned = new Set(
        assignedDevelopers.map((dev) => dev.user_id)
      );
      const newlySelected = new Set(selectedDevelopers);

      // Add newly selected developers
      const toAdd = selectedDevelopers.filter(
        (id) => !currentlyAssigned.has(id)
      );
      if (toAdd.length > 0) {
        await apiClient.assignProjectMembers(projectId, toAdd, "MEMBER");
      }

      // Remove deselected developers
      const toRemove = assignedDevelopers
        .map((dev) => dev.user_id)
        .filter((id) => !newlySelected.has(id));

      for (const memberId of toRemove) {
        try {
          await apiClient.removeProjectMember(projectId, memberId);
        } catch (removeError) {
          console.error(`Error removing member ${memberId}:`, removeError);
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving assignments:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save assignments"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredDevelopers = developers.filter(
    (dev) =>
      dev.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="neo-tile rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="animate-spin neo-icon w-8 h-8 flex items-center justify-center rounded-lg">
              <Users className="w-5 h-5" style={{ color: "var(--brand)" }} />
            </div>
            <span className="opacity-70">Loading project members...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="neo-tile rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-xl">
              <UserPlus className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Assign Developers</h2>
              <p className="text-sm opacity-70">{projectName}</p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Currently Assigned */}
          {assignedDevelopers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold opacity-70 mb-3">
                Currently Assigned ({assignedDevelopers.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignedDevelopers.map((dev) => (
                  <div
                    key={dev.user_id}
                    className="glass rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="neo-icon w-8 h-8 flex items-center justify-center rounded-full">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{dev.username}</div>
                      <div className="text-xs opacity-60 truncate">
                        {dev.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="text"
                placeholder="Search developers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Developers List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold opacity-70">
              Available Developers ({filteredDevelopers.length})
            </h3>

            {filteredDevelopers.length === 0 ? (
              <div className="text-center py-8">
                <div className="neo-icon w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl">
                  <Users className="w-8 h-8 opacity-30" />
                </div>
                <p className="opacity-70">No developers found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDevelopers.map((dev) => {
                  const isSelected = selectedDevelopers.includes(dev.user_id);
                  const isCurrentlyAssigned = assignedDevelopers.some(
                    (assigned) => assigned.user_id === dev.user_id
                  );

                  return (
                    <label
                      key={dev.user_id}
                      className={`glass rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-all flex items-center gap-4 ${
                        isSelected
                          ? "ring-2 ring-[var(--brand)] bg-[var(--brand)]/10"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleDeveloperToggle(dev.user_id)}
                        className="sr-only"
                      />
                      <div
                        className={`neo-icon w-6 h-6 flex items-center justify-center rounded border-2 transition-all ${
                          isSelected
                            ? "border-[var(--brand)] bg-[var(--brand)]"
                            : "border-white/20"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium flex items-center gap-2">
                          {dev.username}
                          {isCurrentlyAssigned && (
                            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                              Currently Assigned
                            </span>
                          )}
                        </div>
                        <div className="text-sm opacity-60 truncate">
                          {dev.email}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost" disabled={saving}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Assignments
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
