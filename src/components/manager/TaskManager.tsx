import { useState, useEffect } from "react";
import { apiClient, Project } from "../../lib/api";
import { ArrowLeft, Plus, Trash2, Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  task_id: string;
  title: string;
  description: string;
  status: "NEW" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  start_date: string;
  end_date: string;
  assignments: {
    developer: {
      username: string;
    };
  }[];
}

interface TaskManagerProps {
  project: Project;
  onBack: () => void;
}

const statusColors = {
  NEW: "bg-gray-200 text-gray-800",
  ASSIGNED: "bg-blue-200 text-blue-800",
  IN_PROGRESS: "bg-yellow-200 text-yellow-800",
  COMPLETED: "bg-green-200 text-green-800",
};

const priorityColors = {
  LOW: "bg-gray-200 text-gray-800",
  MEDIUM: "bg-blue-200 text-blue-800",
  HIGH: "bg-yellow-200 text-yellow-800",
  URGENT: "bg-red-200 text-red-800",
};

export const TaskManager = ({ project, onBack }: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/tasks/project/${project.project_id}`
        );
        setTasks(response.data.tasks);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tasks.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [project.project_id]);

  const handleUpdateStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/status`, {
        status,
      });
      setTasks(
        tasks.map((task) =>
          task.task_id === taskId
            ? { ...task, status: response.data.status }
            : task
        )
      );
    } catch (error) {
      console.error("Failed to update task status", error);
    }
  };

  const handleUpdatePriority = async (
    taskId: string,
    priority: Task["priority"]
  ) => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/priority`, {
        priority,
      });
      setTasks(
        tasks.map((task) =>
          task.task_id === taskId
            ? { ...task, priority: response.data.priority }
            : task
        )
      );
    } catch (error) {
      console.error("Failed to update task priority", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {project.project_name}
          </h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {loading && <p>Loading tasks...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Create your first task to get started
            </p>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.task_id}
                className="border rounded-lg p-4 flex justify-between items-start"
              >
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-medium text-gray-500">
                      Assigned to:
                    </span>
                    {task.assignments.length > 0 ? (
                      task.assignments.map((a, index) => (
                        <span
                          key={index}
                          className="text-sm bg-gray-100 px-2 py-1 rounded-full"
                        >
                          {a.developer.username}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Status
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`text-xs font-bold px-2 py-1 rounded-md ${
                            statusColors[task.status]
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {(
                          [
                            "NEW",
                            "ASSIGNED",
                            "IN_PROGRESS",
                            "COMPLETED",
                          ] as const
                        ).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() =>
                              handleUpdateStatus(task.task_id, status)
                            }
                          >
                            {status.replace("_", " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Priority
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`text-xs font-bold px-2 py-1 rounded-md ${
                            priorityColors[task.priority]
                          }`}
                        >
                          {task.priority}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map(
                          (priority) => (
                            <DropdownMenuItem
                              key={priority}
                              onClick={() =>
                                handleUpdatePriority(task.task_id, priority)
                              }
                            >
                              {priority}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
