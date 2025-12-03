import { useState, useEffect } from "react";
import { Project, User, apiClient } from "../../lib/api";
import { X, Calendar, FileText, Type, Users, Upload } from "lucide-react";
import { FileUploader } from "../files/FileUploader";

interface TaskFormProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskForm = ({ project, onClose, onSuccess }: TaskFormProps) => {
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    assigned_developer: "",
  });

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    setLoadingDevelopers(true);
    try {
      const response = await apiClient.getUsersByRole("DEVELOPER");
      setDevelopers(response.users || []);
    } catch (error) {
      console.error("Error fetching developers:", error);
      setDevelopers([]);
    } finally {
      setLoadingDevelopers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const task = await apiClient.createTask(project.project_id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      });

      setCreatedTaskId(task.task_id);

      // Assign developer if selected
      if (formData.assigned_developer) {
        try {
          await apiClient.assignDeveloper(
            task.task_id,
            formData.assigned_developer
          );
        } catch (assignError) {
          console.error("Error assigning developer:", assignError);
          // Still show success as task was created
        }
      }

      if (!showFileUpload) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="neo-tile w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="neo-icon hover:bg-gray-800 transition-all"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="glass p-3 border border-brand/30">
            <p className="text-sm text-gray-300">
              <strong className="text-brand">Project:</strong>{" "}
              {project.project_name}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Type className="w-4 h-4 text-brand" />
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="input"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 text-brand" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
              rows={3}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Users className="w-4 h-4 text-brand" />
              Assign to Developer
            </label>
            {loadingDevelopers ? (
              <div className="input bg-gray-800 text-gray-500">
                Loading developers...
              </div>
            ) : (
              <select
                name="assigned_developer"
                value={formData.assigned_developer}
                onChange={handleChange}
                className="select"
              >
                <option value="">Select a developer (optional)</option>
                {developers.map((dev) => (
                  <option key={dev.user_id} value={dev.user_id}>
                    {dev.username} ({dev.email})
                  </option>
                ))}
              </select>
            )}
            {developers.length === 0 && !loadingDevelopers && (
              <p className="text-xs text-gray-500 mt-1">
                No developers available. Task can be assigned later.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 text-brand" />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 text-brand" />
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || undefined}
                className="input"
              />
            </div>
          </div>

          {/* File Upload Option */}
          <div className="glass p-4 border border-gray-700 rounded-lg">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Upload className="w-4 h-4 text-brand" />
              File Attachments
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="include-files"
                checked={showFileUpload}
                onChange={(e) => setShowFileUpload(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand focus:ring-brand focus:ring-offset-0"
              />
              <label htmlFor="include-files" className="text-sm text-gray-300">
                Enable file upload after creating task
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You can upload files related to this task after creation
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* File Upload Section (shown after task creation) */}
        {createdTaskId && showFileUpload && (
          <div className="p-6 border-t border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand" />
              Upload Task Files
            </h3>
            <FileUploader
              projectId={project.project_id}
              taskId={createdTaskId}
              onUploadSuccess={() => {
                // Files uploaded successfully, close the modal
                onSuccess();
              }}
              onUploadError={(error) => {
                alert(error);
              }}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => onSuccess()} className="btn-ghost flex-1">
                Skip File Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
