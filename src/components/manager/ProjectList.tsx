import { useState } from "react";
import { apiClient, Project } from "../../lib/api";
import { FolderOpen, Trash2, Edit2, Eye } from "lucide-react";

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onRefresh: () => void;
}

export const ProjectList = ({
  projects,
  onSelectProject,
  onRefresh,
}: ProjectListProps) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleDelete = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This will also delete all tasks and files."
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteProject(projectId);
      onRefresh();
    } catch (error) {
      alert(
        "Error deleting project: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FolderOpen className="w-6 h-6" />
          My Projects
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No projects yet</p>
          <p className="text-gray-400 text-sm">
            Create your first project to get started
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {projects.map((project) => (
            <div
              key={project.project_id}
              className="p-6 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {project.project_name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {project.description || "No description"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onSelectProject(project)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="View tasks"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingProject(project)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                    title="Edit project"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.project_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={() => {
            setEditingProject(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProjectModal = ({
  project,
  onClose,
  onSuccess,
}: EditProjectModalProps) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
