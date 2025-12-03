import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  TrendingUp,
  FileText,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import { apiClient } from "../../lib/api";
import { UserAvatar } from "../profile/UserAvatar";

interface Task {
  task_id: string;
  project_id: string;
  title: string;
  description?: string;
  status: "NEW" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

interface Subtask {
  subtask_id: string;
  parent_task_id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  end_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assignees?: any[];
}

interface WorkLog {
  log_id: string;
  task_id?: string;
  subtask_id?: string;
  user_id: string;
  hours_logged: number;
  work_date: string;
  description?: string;
  log_type: string;
  created_at: string;
  user?: {
    username: string;
    profile_photo_url?: string;
  };
}

interface TaskEstimate {
  estimate_id: string;
  task_id?: string;
  subtask_id?: string;
  estimated_hours: number;
  estimator_id: string;
  estimate_type: "INITIAL" | "REVISED" | "FINAL";
  notes?: string;
  created_at: string;
  estimator?: {
    username: string;
  };
}

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI States
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showAddWorkLog, setShowAddWorkLog] = useState(false);
  const [showAddEstimate, setShowAddEstimate] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState<string | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [editingTask, setEditingTask] = useState(false);

  // Form States
  const [newSubtask, setNewSubtask] = useState({
    title: "",
    description: "",
    estimated_hours: "",
    priority: "MEDIUM" as Subtask["priority"],
  });

  const [newWorkLog, setNewWorkLog] = useState({
    hours_logged: "",
    work_date: new Date().toISOString().split("T")[0],
    description: "",
    log_type: "DEVELOPMENT",
    subtask_id: "",
  });

  const [newEstimate, setNewEstimate] = useState({
    estimated_hours: "",
    estimate_type: "INITIAL" as TaskEstimate["estimate_type"],
    notes: "",
    subtask_id: "",
  });

  const [editedTask, setEditedTask] = useState({
    title: "",
    description: "",
    status: "NEW" as Task["status"],
    priority: "MEDIUM" as Task["priority"],
    estimated_hours: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (taskId) {
      loadTaskData();
    }
  }, [taskId]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      const [taskData, subtasksData, workLogsData] = await Promise.all([
        apiClient.get(`/tasks/${taskId}`),
        apiClient.get(`/tasks/${taskId}/subtasks`),
        apiClient.get(`/worklogs/task/${taskId}`),
      ]);
      setTask(taskData);
      setSubtasks(subtasksData.subtasks || []);
      setWorkLogs(workLogsData.workLogs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async () => {
    try {
      await apiClient.post(`/tasks/${taskId}/subtasks`, {
        ...newSubtask,
        estimated_hours: newSubtask.estimated_hours
          ? parseFloat(newSubtask.estimated_hours)
          : null,
      });

      setNewSubtask({
        title: "",
        description: "",
        estimated_hours: "",
        priority: "MEDIUM",
      });
      setShowAddSubtask(false);
      loadTaskData();
    } catch (err: any) {
      setError(err.message || "Failed to add subtask");
    }
  };

  const handleUpdateSubtask = async () => {
    if (!editingSubtask) return;

    try {
      await apiClient.put(`/tasks/subtasks/${editingSubtask.subtask_id}`, {
        title: editingSubtask.title,
        description: editingSubtask.description,
        status: editingSubtask.status,
        priority: editingSubtask.priority,
        estimated_hours: editingSubtask.estimated_hours,
      });

      setEditingSubtask(null);
      loadTaskData();
    } catch (err: any) {
      setError(err.message || "Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm("Are you sure you want to delete this subtask?")) return;

    try {
      await apiClient.delete(`/tasks/subtasks/${subtaskId}`);
      loadTaskData();
    } catch (err: any) {
      setError(err.message || "Failed to delete subtask");
    }
  };

  const handleUpdateTask = async () => {
    try {
      await apiClient.put(`/tasks/${taskId}`, {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        priority: editedTask.priority,
        estimated_hours: editedTask.estimated_hours
          ? parseFloat(editedTask.estimated_hours)
          : null,
        start_date: editedTask.start_date || null,
        end_date: editedTask.end_date || null,
      });

      setEditingTask(false);
      loadTaskData();
    } catch (err: any) {
      setError(err.message || "Failed to update task");
    }
  };

  const handleAddWorkLog = async () => {
    try {
      const workLogPayload: any = {
        hours_logged: parseFloat(newWorkLog.hours_logged),
        work_date: newWorkLog.work_date,
        description: newWorkLog.description,
        log_type: newWorkLog.log_type,
      };

      // Only include task_id OR subtask_id, not both
      if (selectedSubtask) {
        workLogPayload.subtask_id = selectedSubtask;
      } else {
        workLogPayload.task_id = taskId;
      }

      await apiClient.post(`/worklogs`, workLogPayload);

      setNewWorkLog({
        hours_logged: "",
        work_date: new Date().toISOString().split("T")[0],
        description: "",
        log_type: "DEVELOPMENT",
        subtask_id: "",
      });
      setShowAddWorkLog(false);
      setSelectedSubtask(null);
      loadTaskData();
    } catch (err: any) {
      setError(err.message || "Failed to log work");
    }
  };

  const handleAddEstimate = async () => {
    try {
      const estimatePayload: any = {
        estimated_hours: parseFloat(newEstimate.estimated_hours),
        estimate_type: newEstimate.estimate_type,
        notes: newEstimate.notes,
      };

      // Only include task_id OR subtask_id, not both
      if (selectedSubtask) {
        estimatePayload.subtask_id = selectedSubtask;
      } else {
        estimatePayload.task_id = taskId;
      }

      await apiClient.post(`/estimates`, estimatePayload);

      setNewEstimate({
        estimated_hours: "",
        estimate_type: "INITIAL",
        notes: "",
        subtask_id: "",
      });
      setShowAddEstimate(false);
      setSelectedSubtask(null);
      loadTaskData();
    } catch (err: any) {
      setError(err.message || "Failed to add estimate");
    }
  };

  // Calculate totals
  // Total Estimated: Sum of all subtasks' estimated hours (subtasks are the breakdown of work)
  const subtasksEstimated = subtasks.reduce(
    (sum, st) => sum + (st.estimated_hours || 0),
    0
  );
  // Use subtasks total if available, otherwise use task's estimate as fallback
  const totalEstimated =
    subtasksEstimated > 0 ? subtasksEstimated : task?.estimated_hours || 0;

  // Total Actual: Sum of ALL work logs (from both task and subtasks)
  const totalActual = workLogs.reduce(
    (sum, log) => sum + (parseFloat(log.hours_logged as any) || 0),
    0
  );

  const remaining = totalEstimated - totalActual;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-purple-500/20 text-purple-400",
      ASSIGNED: "bg-yellow-500/20 text-yellow-400",
      IN_PROGRESS: "bg-blue-500/20 text-blue-400",
      COMPLETED: "bg-green-500/20 text-green-400",
      PENDING: "bg-gray-500/20 text-gray-400",
      CANCELLED: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-green-500/20 text-green-400",
      MEDIUM: "bg-yellow-500/20 text-yellow-400",
      HIGH: "bg-orange-500/20 text-orange-400",
      CRITICAL: "bg-red-500/20 text-red-400",
      URGENT: "bg-red-500/20 text-red-400",
    };
    return colors[priority] || "bg-gray-500/20 text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-white/10 border-t-[var(--brand)] rounded-full"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="glass rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Task</h2>
          <p className="text-gray-400">{error || "Task not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Task Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{task.title}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
              {task.priority && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-gray-400 mb-4">{task.description}</p>
            )}
          </div>
          <button
            onClick={() => {
              setEditedTask({
                title: task.title,
                description: task.description || "",
                status: task.status,
                priority: task.priority || "MEDIUM",
                estimated_hours: task.estimated_hours?.toString() || "",
                start_date: task.start_date?.split("T")[0] || "",
                end_date: task.end_date?.split("T")[0] || "",
              });
              setEditingTask(true);
            }}
            className="btn-ghost px-3 py-1 text-sm"
            title="Edit Task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Task Dates */}
        {(task.start_date || task.end_date) && (
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {task.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start: {new Date(task.start_date).toLocaleDateString()}
              </div>
            )}
            {task.end_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due: {new Date(task.end_date).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estimates Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Original Estimate</p>
                <p className="text-2xl font-bold">
                  {task?.estimated_hours?.toFixed(1) || "0.0"}h
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddEstimate(true)}
              className="btn-ghost px-3 py-1 text-sm"
              title="Set/Update Original Estimate"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Logged Hours</p>
              <p className="text-2xl font-bold">{totalActual.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                remaining >= 0 ? "bg-purple-500/20" : "bg-red-500/20"
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 ${
                  remaining >= 0 ? "text-purple-400" : "text-red-400"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-400">Remaining</p>
              <p
                className={`text-2xl font-bold ${
                  remaining < 0 ? "text-red-400" : ""
                }`}
              >
                {remaining.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Subtasks</h2>
          <button
            onClick={() => setShowAddSubtask(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subtask
          </button>
        </div>

        {subtasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No subtasks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subtasks.map((subtask) => (
              <div
                key={subtask.subtask_id}
                className="glass-soft rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{subtask.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          subtask.status
                        )}`}
                      >
                        {subtask.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                          subtask.priority
                        )}`}
                      >
                        {subtask.priority}
                      </span>
                    </div>
                    {subtask.description && (
                      <p className="text-sm text-gray-400 mb-2">
                        {subtask.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>
                        Estimated: {subtask.estimated_hours?.toFixed(1) || 0}h
                      </span>
                      <span>
                        Logged: {subtask.actual_hours?.toFixed(1) || 0}h
                      </span>
                      <span>
                        Remaining:{" "}
                        {(
                          (subtask.estimated_hours || 0) -
                          (subtask.actual_hours || 0)
                        ).toFixed(1)}
                        h
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSubtask(subtask)}
                      className="btn-ghost px-3 py-1 text-sm"
                      title="Edit Subtask"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                      className="btn-ghost px-3 py-1 text-sm text-red-400 hover:text-red-300"
                      title="Delete Subtask"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubtask(subtask.subtask_id);
                        setShowAddWorkLog(true);
                      }}
                      className="btn-ghost text-sm"
                    >
                      Log Work
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Work Logs Section */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Work Logs</h2>
          <button
            onClick={() => {
              setSelectedSubtask(null);
              setShowAddWorkLog(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Work
          </button>
        </div>

        {workLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No work logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workLogs.map((log) => (
              <div key={log.log_id} className="glass-soft rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <UserAvatar
                        userId={log.user_id}
                        username={log.user?.username || "Unknown User"}
                        profilePhotoUrl={log.user?.profile_photo_url}
                        size="sm"
                        showName={true}
                        showPopover={true}
                      />
                      <span className="text-sm text-gray-400">
                        {log.hours_logged}h
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(log.work_date).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                        {log.log_type}
                      </span>
                    </div>
                    {log.description && (
                      <p className="text-sm text-gray-400">{log.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Subtask Modal */}
      {showAddSubtask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add Subtask</h3>
              <button
                onClick={() => setShowAddSubtask(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newSubtask.title}
                  onChange={(e) =>
                    setNewSubtask({ ...newSubtask, title: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Subtask title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newSubtask.description}
                  onChange={(e) =>
                    setNewSubtask({
                      ...newSubtask,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Subtask description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newSubtask.estimated_hours}
                  onChange={(e) =>
                    setNewSubtask({
                      ...newSubtask,
                      estimated_hours: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>
                <select
                  value={newSubtask.priority}
                  onChange={(e) =>
                    setNewSubtask({
                      ...newSubtask,
                      priority: e.target.value as Subtask["priority"],
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddSubtask(false)}
                  className="flex-1 btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.title}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Add Subtask
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Work Log Modal */}
      {showAddWorkLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Log Work</h3>
              <button
                onClick={() => {
                  setShowAddWorkLog(false);
                  setSelectedSubtask(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedSubtask && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-400">
                    Logging work for:{" "}
                    {
                      subtasks.find((st) => st.subtask_id === selectedSubtask)
                        ?.title
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Hours Logged
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newWorkLog.hours_logged}
                  onChange={(e) =>
                    setNewWorkLog({
                      ...newWorkLog,
                      hours_logged: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={newWorkLog.work_date}
                  onChange={(e) =>
                    setNewWorkLog({ ...newWorkLog, work_date: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newWorkLog.log_type}
                  onChange={(e) =>
                    setNewWorkLog({ ...newWorkLog, log_type: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="DEVELOPMENT">Development</option>
                  <option value="TESTING">Testing</option>
                  <option value="REVIEW">Review</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="MEETING">Meeting</option>
                  <option value="RESEARCH">Research</option>
                  <option value="BUG_FIX">Bug Fix</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkLog.description}
                  onChange={(e) =>
                    setNewWorkLog({
                      ...newWorkLog,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="What did you work on?"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddWorkLog(false);
                    setSelectedSubtask(null);
                  }}
                  className="flex-1 btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWorkLog}
                  disabled={!newWorkLog.hours_logged}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Log Work
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subtask Modal */}
      {editingSubtask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Edit Subtask</h3>
              <button
                onClick={() => setEditingSubtask(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editingSubtask.title}
                  onChange={(e) =>
                    setEditingSubtask({
                      ...editingSubtask,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Subtask title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={editingSubtask.description || ""}
                  onChange={(e) =>
                    setEditingSubtask({
                      ...editingSubtask,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Subtask description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editingSubtask.estimated_hours || ""}
                  onChange={(e) =>
                    setEditingSubtask({
                      ...editingSubtask,
                      estimated_hours: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editingSubtask.status}
                  onChange={(e) =>
                    setEditingSubtask({
                      ...editingSubtask,
                      status: e.target.value as Subtask["status"],
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>
                <select
                  value={editingSubtask.priority}
                  onChange={(e) =>
                    setEditingSubtask({
                      ...editingSubtask,
                      priority: e.target.value as Subtask["priority"],
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingSubtask(null)}
                  className="flex-1 btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubtask}
                  disabled={!editingSubtask.title}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Update Subtask
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Estimate Modal */}
      {showAddEstimate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {selectedSubtask
                  ? "Add Subtask Estimate"
                  : "Set Original Task Estimate"}
              </h3>
              <button
                onClick={() => {
                  setShowAddEstimate(false);
                  setSelectedSubtask(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedSubtask && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-sm text-purple-400">
                    Estimating:{" "}
                    {
                      subtasks.find((st) => st.subtask_id === selectedSubtask)
                        ?.title
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newEstimate.estimated_hours}
                  onChange={(e) =>
                    setNewEstimate({
                      ...newEstimate,
                      estimated_hours: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimate Type
                </label>
                <select
                  value={newEstimate.estimate_type}
                  onChange={(e) =>
                    setNewEstimate({
                      ...newEstimate,
                      estimate_type: e.target
                        .value as TaskEstimate["estimate_type"],
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="INITIAL">Initial</option>
                  <option value="REVISED">Revised</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newEstimate.notes}
                  onChange={(e) =>
                    setNewEstimate({
                      ...newEstimate,
                      notes: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Any assumptions or notes about this estimate..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddEstimate(false);
                    setSelectedSubtask(null);
                  }}
                  className="flex-1 btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEstimate}
                  disabled={!newEstimate.estimated_hours}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Save Estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Edit Task</h3>
              <button
                onClick={() => setEditingTask(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, title: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={editedTask.description}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={editedTask.status}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        status: e.target.value as Task["status"],
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    <option value="NEW">New</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        priority: e.target.value as Task["priority"],
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editedTask.estimated_hours}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      estimated_hours: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editedTask.start_date}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editedTask.end_date}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingTask(false)}
                  className="flex-1 btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  disabled={!editedTask.title}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Update Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
