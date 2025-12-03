import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, Task, Project } from "../../lib/api";
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Download,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  FolderKanban,
  Users,
  Eye,
} from "lucide-react";

interface TaskStats {
  total: number;
  byStatus: {
    NEW: number;
    ASSIGNED: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };
}

interface User {
  user_id: string;
  username: string;
  email: string;
  role: string;
}

export const TaskManagement = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [projectFilter, setProjectFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, usersRes] = await Promise.all([
        apiClient.getProjects(),
        apiClient.get("/admin/users"),
      ]);

      setProjects(projectsRes.projects || []);
      setDevelopers(
        usersRes.users?.filter((u: User) => u.role === "DEVELOPER") || []
      );

      // Fetch all tasks from all projects
      const allTasks: Task[] = [];
      for (const project of projectsRes.projects) {
        try {
          const tasksRes = await apiClient.getProjectTasks(project.project_id);
          allTasks.push(...(tasksRes.tasks || []));
        } catch (error) {
          console.error(
            `Error fetching tasks for project ${project.project_id}:`,
            error
          );
        }
      }

      setTasks(allTasks);

      // Calculate stats
      const stats: TaskStats = {
        total: allTasks.length,
        byStatus: {
          NEW: allTasks.filter((t) => t.status === "NEW").length,
          ASSIGNED: allTasks.filter((t) => t.status === "ASSIGNED").length,
          IN_PROGRESS: allTasks.filter((t) => t.status === "IN_PROGRESS")
            .length,
          COMPLETED: allTasks.filter((t) => t.status === "COMPLETED").length,
        },
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;

    try {
      await apiClient.deleteTask(deletingTask.task_id);
      await fetchData();
      setDeletingTask(null);
      showNotification("success", "Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      showNotification("error", "Failed to delete task");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-gray-900/20 text-gray-300 border border-gray-800";
      case "ASSIGNED":
        return "bg-blue-900/20 text-blue-300 border border-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-900/20 text-yellow-300 border border-yellow-800";
      case "COMPLETED":
        return "bg-green-900/20 text-green-300 border border-green-800";
      default:
        return "bg-gray-900/20 text-gray-300 border border-gray-800";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || task.status === statusFilter;
    const matchesProject =
      projectFilter === "ALL" || task.project_id === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const getProjectName = (projectId: string) => {
    return (
      projects.find((p) => p.project_id === projectId)?.project_name ||
      "Unknown Project"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin neo-icon w-16 h-16 flex items-center justify-center rounded-lg">
              <CheckSquare
                className="w-8 h-8"
                style={{ color: "var(--brand)" }}
              />
            </div>
            <div className="text-lg opacity-70">Loading tasks...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div
            className={`glass rounded-xl p-4 flex items-center gap-3 ${
              notification.type === "success"
                ? "border-l-4 border-green-500"
                : "border-l-4 border-red-500"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="neo-icon w-14 h-14 flex items-center justify-center rounded-xl">
              <CheckSquare
                className="w-7 h-7"
                style={{ color: "var(--brand)" }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Task Management</h1>
              <p className="text-sm opacity-70 mt-1">
                Manage all tasks across projects
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="btn-ghost" title="Refresh">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="btn-ghost" title="Export">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <CheckSquare
                className="w-6 h-6"
                style={{ color: "var(--brand)" }}
              />
            </div>
            <TrendingUp className="w-5 h-5 opacity-50" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.total || 0}</h3>
          <p className="text-sm opacity-70">Total Tasks</p>
        </div>

        <div
          className="glass rounded-xl p-6 hover:glass-soft transition-all cursor-pointer"
          onClick={() =>
            setStatusFilter(statusFilter === "NEW" ? "ALL" : "NEW")
          }
        >
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Clock className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {stats?.byStatus.NEW || 0}
          </h3>
          <p className="text-sm opacity-70 mb-3">New Tasks</p>
          <div className="pt-3 border-t border-white/10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                "NEW"
              )}`}
            >
              NEW
            </span>
          </div>
        </div>

        <div
          className="glass rounded-xl p-6 hover:glass-soft transition-all cursor-pointer"
          onClick={() =>
            setStatusFilter(statusFilter === "ASSIGNED" ? "ALL" : "ASSIGNED")
          }
        >
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <User className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {stats?.byStatus.ASSIGNED || 0}
          </h3>
          <p className="text-sm opacity-70 mb-3">Assigned</p>
          <div className="pt-3 border-t border-white/10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                "ASSIGNED"
              )}`}
            >
              ASSIGNED
            </span>
          </div>
        </div>

        <div
          className="glass rounded-xl p-6 hover:glass-soft transition-all cursor-pointer"
          onClick={() =>
            setStatusFilter(
              statusFilter === "IN_PROGRESS" ? "ALL" : "IN_PROGRESS"
            )
          }
        >
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <TrendingUp
                className="w-6 h-6"
                style={{ color: "var(--brand)" }}
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {stats?.byStatus.IN_PROGRESS || 0}
          </h3>
          <p className="text-sm opacity-70 mb-3">In Progress</p>
          <div className="pt-3 border-t border-white/10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                "IN_PROGRESS"
              )}`}
            >
              IN PROGRESS
            </span>
          </div>
        </div>

        <div
          className="glass rounded-xl p-6 hover:glass-soft transition-all cursor-pointer"
          onClick={() =>
            setStatusFilter(statusFilter === "COMPLETED" ? "ALL" : "COMPLETED")
          }
        >
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <CheckCircle
                className="w-6 h-6"
                style={{ color: "var(--brand)" }}
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {stats?.byStatus.COMPLETED || 0}
          </h3>
          <p className="text-sm opacity-70 mb-3">Completed</p>
          <div className="pt-3 border-t border-white/10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                "COMPLETED"
              )}`}
            >
              COMPLETED
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="select"
          >
            <option value="ALL">All Projects</option>
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="opacity-70">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
          {(statusFilter !== "ALL" || projectFilter !== "ALL") && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setProjectFilter("ALL");
              }}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="glass rounded-xl overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-16 text-center">
            <div className="neo-icon w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tasks found</h3>
            <p className="text-sm opacity-70 mb-6">
              {searchTerm || statusFilter !== "ALL" || projectFilter !== "ALL"
                ? "Try adjusting your filters"
                : "Create your first task to get started"}
            </p>
            {!searchTerm &&
              statusFilter === "ALL" &&
              projectFilter === "ALL" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium opacity-70">
                    Task
                  </th>
                  <th className="text-left p-4 text-sm font-medium opacity-70">
                    Project
                  </th>
                  <th className="text-left p-4 text-sm font-medium opacity-70">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium opacity-70">
                    Timeline
                  </th>
                  <th className="text-left p-4 text-sm font-medium opacity-70">
                    Assigned To
                  </th>
                  <th className="text-right p-4 text-sm font-medium opacity-70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.task_id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs opacity-50 line-clamp-1">
                          {task.description || "No description"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 opacity-50" />
                        <span className="text-sm opacity-70">
                          {getProjectName(task.project_id)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs opacity-70">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(
                            task.start_date
                          ).toLocaleDateString()} -{" "}
                          {new Date(task.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setAssigningTask(task)}
                        className="text-sm opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Assign
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/tasks/${task.task_id}`)}
                          className="neo-icon w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="neo-icon w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition"
                          title="Edit task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTask(task)}
                          className="neo-icon w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition"
                          title="Delete task"
                        >
                          <Trash2
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
          </div>
        )}
      </div>

      {/* Create/Edit Task Modal */}
      {(showCreateModal || editingTask) && (
        <TaskFormModal
          task={editingTask}
          projects={projects}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTask(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingTask(null);
            fetchData();
            showNotification(
              "success",
              editingTask
                ? "Task updated successfully"
                : "Task created successfully"
            );
          }}
        />
      )}

      {/* Assign Developer Modal */}
      {assigningTask && (
        <AssignDeveloperModal
          task={assigningTask}
          developers={developers}
          onClose={() => setAssigningTask(null)}
          onSuccess={() => {
            setAssigningTask(null);
            fetchData();
            showNotification("success", "Developer assigned successfully");
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeletingTask(null)}
          />
          <div className="glass rounded-xl p-6 w-full max-w-md relative z-10 animate-scale-in border-l-4 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
                <Trash2 className="w-6 h-6" style={{ color: "var(--brand)" }} />
              </div>
              <h3 className="text-xl font-bold">Delete Task</h3>
            </div>

            <p className="text-sm opacity-70 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {deletingTask.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="glass-soft rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 opacity-70" />
                <div>
                  <div className="font-medium">{deletingTask.title}</div>
                  <div className="text-xs opacity-70">
                    {getProjectName(deletingTask.project_id)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingTask(null)}
                className="flex-1 btn-ghost justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="flex-1 btn-primary justify-center bg-red-900/20 border-red-800 hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

// Task Form Modal Component
interface TaskFormModalProps {
  task?: Task | null;
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

const TaskFormModal = ({
  task,
  projects,
  onClose,
  onSuccess,
}: TaskFormModalProps) => {
  const [projectId, setProjectId] = useState(task?.project_id || "");
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [startDate, setStartDate] = useState(
    task?.start_date
      ? new Date(task.start_date).toISOString().split("T")[0]
      : ""
  );
  const [endDate, setEndDate] = useState(
    task?.end_date ? new Date(task.end_date).toISOString().split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (task) {
        await apiClient.updateTask(task.task_id, {
          title,
          description,
          start_date: startDate,
          end_date: endDate,
        });
      } else {
        if (!projectId) {
          setError("Please select a project");
          setLoading(false);
          return;
        }
        await apiClient.createTask(projectId, {
          title,
          description,
          start_date: startDate,
          end_date: endDate,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass rounded-xl p-6 w-full max-w-md relative z-10 animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
            <CheckSquare
              className="w-6 h-6"
              style={{ color: "var(--brand)" }}
            />
          </div>
          <h3 className="text-xl font-bold">
            {task ? "Edit Task" : "Create New Task"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="glass-soft rounded-lg p-3 border-l-4 border-red-500">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!task && (
            <div>
              <label className="block text-sm font-medium mb-2">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="select"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Enter task title"
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
              rows={3}
              className="input resize-none"
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary justify-center"
            >
              {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assign Developer Modal Component
interface AssignDeveloperModalProps {
  task: Task;
  developers: User[];
  onClose: () => void;
  onSuccess: () => void;
}

const AssignDeveloperModal = ({
  task,
  developers,
  onClose,
  onSuccess,
}: AssignDeveloperModalProps) => {
  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeveloper) return;

    setLoading(true);
    setError("");

    try {
      await apiClient.assignDeveloper(task.task_id, selectedDeveloper);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to assign developer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass rounded-xl p-6 w-full max-w-md relative z-10 animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
            <Users className="w-6 h-6" style={{ color: "var(--brand)" }} />
          </div>
          <h3 className="text-xl font-bold">Assign Developer</h3>
        </div>

        <div className="glass-soft rounded-lg p-4 mb-6">
          <div className="font-medium mb-1">{task.title}</div>
          <div className="text-xs opacity-70">
            {task.description || "No description"}
          </div>
        </div>

        <form onSubmit={handleAssign} className="space-y-4">
          {error && (
            <div className="glass-soft rounded-lg p-3 border-l-4 border-red-500">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Developer
            </label>
            <select
              value={selectedDeveloper}
              onChange={(e) => setSelectedDeveloper(e.target.value)}
              className="select"
              required
            >
              <option value="">Choose a developer</option>
              {developers.map((dev) => (
                <option key={dev.user_id} value={dev.user_id}>
                  {dev.username} ({dev.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary justify-center"
            >
              {loading ? "Assigning..." : "Assign Developer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
