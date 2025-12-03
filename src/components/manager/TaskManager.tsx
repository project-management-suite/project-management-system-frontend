import { useState, useEffect } from "react";
import { Project, Task, apiClient, type User } from "../../lib/api";
import {
  ArrowLeft,
  Plus,
  Calendar as CalendarIcon,
  User as UserIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Users,
  Search,
  Check,
  X,
  Edit2,
  MessageSquare,
  Eye,
} from "lucide-react";
import { TaskForm } from "./TaskForm";
import { TaskEditModal } from "./TaskEditModal";
import { TaskCommentsModal } from "./TaskCommentsModal";
import { FileUploader } from "../files/FileUploader";
import { FileLibrary } from "../files/FileLibrary";
import { UserAvatar } from "../profile/UserAvatar";

// Edit Project Modal Component
const EditProjectModal = ({
  project,
  onClose,
  onSuccess,
}: {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [name, setName] = useState(project.project_name);
  const [description, setDescription] = useState(project.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiClient.updateProject(project.project_id, {
        project_name: name,
        description,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      style={{ background: "rgba(0, 0, 0, 0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative glass rounded-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--tile)",
          border: "1px solid var(--border)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-2xl font-bold">Edit Project</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 glass rounded-lg border border-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 outline-none transition-colors"
              style={{ background: "var(--tile-dark)" }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 glass rounded-lg border border-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 outline-none transition-colors resize-none"
              style={{ background: "var(--tile-dark)" }}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inline Project Member Component
const ProjectMemberManagement = ({ project }: { project: Project }) => {
  const [allDevelopers, setAllDevelopers] = useState<User[]>([]);
  const [currentMembers, setCurrentMembers] = useState<any[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchAllDevelopers();
    fetchProjectMembers();
  }, []);

  const fetchAllDevelopers = async () => {
    try {
      const response = await apiClient.getUsersByRole("DEVELOPER");
      setAllDevelopers(response.users || []);
    } catch (error) {
      console.error("Error fetching developers:", error);
      showMessage("error", "Failed to load developers");
    }
  };

  const fetchProjectMembers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProjectMembers(project.project_id);
      setCurrentMembers(response.members || []);
      const memberIds =
        response.members
          ?.map((m: any) => m.member_id)
          .filter((id: string | undefined): id is string => Boolean(id)) || [];
      setSelectedDevelopers(memberIds);
    } catch (error) {
      console.error("Error fetching project members:", error);
      showMessage("error", "Failed to load project members");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeveloperToggle = (developerId: string) => {
    setSelectedDevelopers((prev: string[]) => {
      if (prev.includes(developerId)) {
        return prev.filter((id: string) => id !== developerId);
      } else {
        return [...prev, developerId];
      }
    });
  };

  const handleSaveAssignments = async () => {
    if (selectedDevelopers.length === 0) {
      showMessage("error", "Please select at least one developer");
      return;
    }
    setSaving(true);
    try {
      await apiClient.assignProjectMembers(
        project.project_id,
        selectedDevelopers
      );
      showMessage("success", "Project members assigned successfully!");
      fetchProjectMembers();
    } catch (error: any) {
      console.error("Error assigning members:", error);
      showMessage("error", error.message || "Failed to assign members");
    } finally {
      setSaving(false);
    }
  };

  const filteredDevelopers = allDevelopers.filter(
    (dev: User) =>
      dev.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="glass rounded-lg p-4">
        <h3 className="font-semibold mb-1" style={{ color: "var(--brand)" }}>
          {project.project_name}
        </h3>
        <p className="text-sm opacity-70">{project.description}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 opacity-70">
          Search Developers
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full pl-10 pr-4 py-3 glass rounded-lg border border-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 outline-none transition-colors"
            style={{ background: "var(--tile-dark)" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="neo-icon w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl">
            <Users className="w-6 h-6 opacity-50 animate-pulse" />
          </div>
          <div className="opacity-70">Loading project members...</div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              Available Developers ({filteredDevelopers.length})
            </h3>
            <div className="text-sm opacity-60">
              {selectedDevelopers.length} selected
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto glass rounded-lg border border-white/10 mb-4">
            {filteredDevelopers.length === 0 ? (
              <div className="p-4 text-center opacity-50">
                {searchTerm
                  ? "No developers found matching your search"
                  : "No developers available"}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredDevelopers.map((developer: User) => {
                  const isSelected = selectedDevelopers.includes(
                    developer.user_id
                  );
                  const isCurrentMember = currentMembers.some((m: any) => {
                    const memberId =
                      m?.member_id || m?.user_id || m?.member?.user_id;
                    return memberId === developer.user_id;
                  });

                  return (
                    <div
                      key={developer.user_id}
                      className={`p-4 hover:bg-white/5 cursor-pointer transition-colors select-none ${
                        isSelected ? "bg-[var(--brand)]/10" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeveloperToggle(developer.user_id);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[var(--brand)] border-[var(--brand)]"
                                : "border-white/30"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <UserAvatar
                            userId={developer.user_id}
                            username={developer.username}
                            profilePhotoUrl={developer.profile_photo_url}
                            size="md"
                            showName={false}
                            showPopover={true}
                          />
                          <div>
                            <div className="font-medium">
                              {developer.username}
                              {isCurrentMember && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                                  Current Member
                                </span>
                              )}
                            </div>
                            <div className="text-sm opacity-70">
                              {developer.email}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs opacity-50 uppercase tracking-wide">
                          {developer.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleSaveAssignments}
              disabled={saving || selectedDevelopers.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Save Assignments ({selectedDevelopers.length})
                </>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedDevelopers([]);
                setSearchTerm("");
              }}
              disabled={saving}
              className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Selection
            </button>
          </div>

          {currentMembers.length > 0 && (
            <div className="p-4 glass rounded-lg">
              <h4 className="font-medium mb-2">
                Current Project Members ({currentMembers.length})
              </h4>
              <div className="flex flex-wrap gap-3">
                {currentMembers.map((member: any, index: number) => {
                  const memberData = member?.member || member;
                  const memberRole =
                    member?.role || member?.project_role || "MEMBER";
                  const memberName =
                    memberData?.username || memberData?.email || "Unknown";
                  const memberId = memberData?.user_id || member?.user_id;
                  const memberPhotoUrl = memberData?.profile_photo_url;
                  const memberKey =
                    member?.membership_id ||
                    member?.user_id ||
                    `member-${index}`;

                  return (
                    <div
                      key={memberKey}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
                    >
                      <UserAvatar
                        userId={memberId}
                        username={memberName}
                        profilePhotoUrl={memberPhotoUrl}
                        size="sm"
                        showName={true}
                        showPopover={true}
                      />
                      <span className="text-xs opacity-70">({memberRole})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type ViewType = "list" | "board" | "calendar" | "files" | "members";

interface TaskManagerProps {
  project: Project;
  onBack: () => void;
  onTaskUpdate?: () => void;
}

export const TaskManager = ({
  project,
  onBack,
  onTaskUpdate,
}: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentsTask, setCommentsTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("board");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showEditProject, setShowEditProject] = useState(false);
  const [fileRefreshKey, setFileRefreshKey] = useState(0);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.getTasks(project.project_id);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.project_id]);

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "NEW":
        return (
          <AlertCircle className="w-5 h-5" style={{ color: "var(--brand)" }} />
        );
      case "ASSIGNED":
        return <UserIcon className="w-5 h-5 text-yellow-400" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-400" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <AlertCircle className="w-5 h-5 opacity-50" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "NEW":
        return "bg-[var(--brand)]/20 text-[var(--brand)]";
      case "ASSIGNED":
        return "bg-yellow-500/20 text-yellow-400";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-400";
      case "COMPLETED":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: Task["status"]) => {
    if (!draggedTask) return;

    try {
      await apiClient.updateTask(draggedTask.task_id, { status: newStatus });
      setTasks(
        tasks.map((t) =>
          t.task_id === draggedTask.task_id ? { ...t, status: newStatus } : t
        )
      );
      setDraggedTask(null);
      onTaskUpdate?.();
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter((task) => {
      if (!task.end_date) return false;
      const taskDate = new Date(task.end_date).toISOString().split("T")[0];
      return taskDate === date;
    });
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderBoardView = () => {
    const columns = [
      {
        id: "NEW" as const,
        name: "To Do",
        tasks: tasks.filter((t) => t.status === "NEW"),
      },
      {
        id: "ASSIGNED" as const,
        name: "Assigned",
        tasks: tasks.filter((t) => t.status === "ASSIGNED"),
      },
      {
        id: "IN_PROGRESS" as const,
        name: "In Progress",
        tasks: tasks.filter((t) => t.status === "IN_PROGRESS"),
      },
      {
        id: "COMPLETED" as const,
        name: "Done",
        tasks: tasks.filter((t) => t.status === "COMPLETED"),
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="glass rounded-xl p-4"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{column.name}</h3>
              <span className="text-xs opacity-60 neo-icon w-6 h-6 flex items-center justify-center rounded">
                {column.tasks.length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {column.tasks.map((task) => (
                <div
                  key={task.task_id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onClick={async () => {
                    try {
                      const freshTask = await apiClient.getTask(task.task_id);
                      setSelectedTask(freshTask);
                    } catch (error) {
                      console.error("Error fetching task:", error);
                      setSelectedTask(task);
                    }
                  }}
                  className="bg-[var(--tile-dark)] p-4 rounded-lg hover:bg-white/5 transition-all cursor-pointer border border-white/5 hover:border-[var(--brand)]/30 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium flex-1">{task.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const freshTask = await apiClient.getTask(
                              task.task_id
                            );
                            setCommentsTask(freshTask);
                          } catch (error) {
                            console.error("Error fetching task:", error);
                            setCommentsTask(task);
                          }
                        }}
                        className="neo-icon w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/20"
                        title="View Comments"
                      >
                        <MessageSquare className="w-3 h-3 text-purple-400" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const freshTask = await apiClient.getTask(
                              task.task_id
                            );
                            setSelectedTask(freshTask);
                          } catch (error) {
                            console.error("Error fetching task:", error);
                            setSelectedTask(task);
                          }
                        }}
                        className="neo-icon w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--brand)]/20"
                        title="View Task"
                      >
                        <Eye
                          className="w-3 h-3"
                          style={{ color: "var(--brand)" }}
                        />
                      </button>
                      {getStatusIcon(task.status)}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-xs opacity-70 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs opacity-60">
                    {task.end_date && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>
                          {new Date(task.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {task.assigned_developers &&
                      task.assigned_developers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{task.assigned_developers.length}</span>
                        </div>
                      )}
                  </div>
                </div>
              ))}
              {column.tasks.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-lg">
                  <p className="text-xs opacity-40">Drop tasks here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">
                Task
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">
                Assigned
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">
                Due Date
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium opacity-70">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.task_id}
                className="border-t border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-sm">{task.title}</div>
                    {task.description && (
                      <div className="text-xs opacity-70 mt-1 line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {task.assigned_developers &&
                  task.assigned_developers.length > 0 ? (
                    <div className="flex items-center gap-1 text-sm opacity-70">
                      <UserIcon className="w-4 h-4" />
                      <span>
                        {task.assigned_developers.length} developer
                        {task.assigned_developers.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs opacity-50">Unassigned</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {task.end_date ? (
                    <div className="flex items-center gap-1 text-sm opacity-70">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {new Date(task.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs opacity-50">No due date</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const freshTask = await apiClient.getTask(
                            task.task_id
                          );
                          setCommentsTask(freshTask);
                        } catch (error) {
                          console.error("Error fetching task:", error);
                          setCommentsTask(task);
                        }
                      }}
                      className="neo-icon w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/20"
                      title="View Comments"
                    >
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const freshTask = await apiClient.getTask(
                            task.task_id
                          );
                          setSelectedTask(freshTask);
                        } catch (error) {
                          console.error("Error fetching task:", error);
                          setSelectedTask(task);
                        }
                      }}
                      className="neo-icon w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--brand)]/20"
                      title="View Task"
                    >
                      <Eye
                        className="w-4 h-4"
                        style={{ color: "var(--brand)" }}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="neo-icon w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl">
              <CalendarIcon className="w-8 h-8 opacity-30" />
            </div>
            <p className="opacity-70">No tasks yet</p>
            <p className="text-sm opacity-50 mt-1">
              Create your first task to get started
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderCalendarView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } =
      getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-[120px] bg-[var(--tile-dark)] border border-white/5 rounded-lg"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const tasksForDay = getTasksForDate(dateStr);
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`min-h-[120px] bg-[var(--tile-dark)] border border-white/5 rounded-lg p-2 hover:bg-white/5 transition-colors ${
            isToday ? "ring-2 ring-[var(--brand)]" : ""
          }`}
        >
          <div
            className={`text-sm font-medium mb-2 ${
              isToday ? "text-[var(--brand)]" : "opacity-70"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {tasksForDay.map((task) => (
              <div
                key={task.task_id}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const freshTask = await apiClient.getTask(task.task_id);
                    setSelectedTask(freshTask);
                  } catch (error) {
                    console.error("Error fetching task:", error);
                    setSelectedTask(task);
                  }
                }}
                className={`text-xs p-1.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                  task.status === "COMPLETED"
                    ? "bg-green-500/20 text-green-400"
                    : task.status === "IN_PROGRESS"
                    ? "bg-blue-500/20 text-blue-400"
                    : task.status === "ASSIGNED"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-[var(--brand)]/20 text-[var(--brand)]"
                }`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{monthName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn-ghost px-4"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold opacity-70"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const handleFileUploadSuccess = () => {
    // Force FileLibrary to refresh by changing key
    setFileRefreshKey((prev) => prev + 1);
  };

  const renderFilesView = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload */}
          <div className="lg:col-span-1">
            <FileUploader
              projectId={project.project_id}
              onUploadSuccess={handleFileUploadSuccess}
              onUploadError={(error) => alert(error)}
            />
          </div>

          {/* File Library */}
          <div className="lg:col-span-2">
            <FileLibrary
              key={fileRefreshKey}
              projectId={project.project_id}
              onFileSelect={() => {}}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderMembersView = () => {
    return (
      <div className="glass rounded-xl p-6">
        <ProjectMemberManagement project={project} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{project.project_name}</h1>
              <p className="text-sm opacity-70 mt-1">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView("list")}
              className={`neo-icon w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                currentView === "list" ? "bg-white/10" : "hover:bg-white/5"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView("board")}
              className={`neo-icon w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                currentView === "board" ? "bg-white/10" : "hover:bg-white/5"
              }`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView("calendar")}
              className={`neo-icon w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                currentView === "calendar" ? "bg-white/10" : "hover:bg-white/5"
              }`}
              title="Calendar View"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView("files")}
              className={`neo-icon w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                currentView === "files" ? "bg-white/10" : "hover:bg-white/5"
              }`}
              title="Files View"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView("members")}
              className={`neo-icon w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                currentView === "members" ? "bg-white/10" : "hover:bg-white/5"
              }`}
              title="Members View"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowEditProject(true)}
              className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
              title="Edit Project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowTaskForm(true)}
              className="btn-primary ml-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="glass rounded-xl p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
                <Clock className="w-6 h-6" style={{ color: "var(--brand)" }} />
              </div>
              <div className="opacity-70">Loading tasks...</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {currentView === "list" && renderListView()}
          {currentView === "board" && renderBoardView()}
          {currentView === "calendar" && renderCalendarView()}
          {currentView === "files" && renderFilesView()}
          {currentView === "members" && renderMembersView()}
        </>
      )}

      {showTaskForm && (
        <TaskForm
          project={project}
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            fetchTasks();
            onTaskUpdate?.();
          }}
        />
      )}

      {/* Task Edit Modal */}
      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSuccess={() => {
            fetchTasks();
            onTaskUpdate?.();
          }}
        />
      )}

      {/* Task Comments Modal */}
      {commentsTask && (
        <TaskCommentsModal
          task={commentsTask}
          onClose={() => setCommentsTask(null)}
        />
      )}

      {/* Edit Project Modal */}
      {showEditProject && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditProject(false)}
          onSuccess={() => {
            setShowEditProject(false);
            onBack(); // Go back to refresh the project list
          }}
        />
      )}
    </div>
  );
};
