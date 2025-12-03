import { apiClient, Project } from "../../lib/api";
import { FolderOpen, Trash2, Eye, Calendar } from "lucide-react";

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
                    title="View project"
                  >
                    <Eye className="w-4 h-4" />
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
    </div>
  );
};
