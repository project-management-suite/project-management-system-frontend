import { useState } from "react";
import { apiClient, Project } from "../../lib/api";
import {
  FolderOpen,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  UserPlus,
} from "lucide-react";
import { ProjectMemberAssignment } from "./ProjectMemberAssignment";

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
  const [assigningProject, setAssigningProject] = useState<Project | null>(
    null
  );

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
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FolderOpen className="w-6 h-6" style={{ color: "var(--brand)" }} />
          My Projects
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 text-center">
          <div className="neo-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl">
            <FolderOpen className="w-10 h-10 opacity-30" />
          </div>
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm opacity-70">
            Create your first project to get started
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {projects.map((project) => (
            <div
              key={project.project_id}
              className="p-6 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectProject(project)}
                >
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--brand)] transition-colors">
                    {project.project_name}
                  </h3>
                  <p className="opacity-70 mb-3 text-sm">
                    {project.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-xs opacity-60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Created{" "}
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onSelectProject(project)}
                    className="neo-icon w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10"
                    title="View tasks"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAssigningProject(project)}
                    className="neo-icon w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10"
                    title="Assign developers"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingProject(project)}
                    className="neo-icon w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10"
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.project_id)}
                    className="neo-icon w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/20"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
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

      {assigningProject && (
        <ProjectMemberAssignment
          projectId={assigningProject.project_id}
          projectName={assigningProject.project_name}
          onClose={() => setAssigningProject(null)}
          onSuccess={() => {
            setAssigningProject(null);
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
