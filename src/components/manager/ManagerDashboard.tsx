import { useState, useEffect } from "react";
import { apiClient, Project } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { FolderKanban, Plus, Calendar, CheckCircle, Clock } from "lucide-react";
import { ProjectList } from "./ProjectList";
import { ProjectForm } from "./ProjectForm";
import { TaskManager } from "./TaskManager";

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const response = await apiClient.getProjects();
      const projects = response.projects || [];
      setProjects(projects);
      return projects;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  };

  const fetchStats = async (projectsData?: Project[]) => {
    if (!user) return;

    try {
      let projects: Project[] = [];

      // Only fetch projects if not provided
      if (projectsData) {
        projects = projectsData;
      } else {
        const response = await apiClient.getProjects();
        projects = response.projects || [];
        setProjects(projects); // Update projects state if we fetched them
      }

      const tasksResponse = await apiClient.getTasks();
      const tasks = tasksResponse.tasks || [];

      const completedTasks = tasks.filter(
        (t) => t.status === "COMPLETED"
      ).length;
      const inProgressTasks = tasks.filter(
        (t) => t.status === "IN_PROGRESS"
      ).length;

      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks,
        inProgressTasks,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Fetch projects first, then use that data for stats to avoid duplicate calls
      const projectsData = await fetchProjects();
      await fetchStats(projectsData);
      setLoading(false);
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <TaskManager
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onTaskUpdate={() => {
          fetchStats(projects); // Use existing projects data to avoid duplicate fetch
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-lg">
            <FolderKanban className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manager Dashboard
            </h1>
            <p className="text-gray-600">Manage your projects and tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowProjectForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Total Projects
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalProjects}
              </p>
            </div>
            <FolderKanban className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Total Tasks
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalTasks}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                In Progress
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.inProgressTasks}
              </p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.completedTasks}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      <ProjectList
        projects={projects}
        onSelectProject={setSelectedProject}
        onRefresh={async () => {
          const projectsData = await fetchProjects();
          await fetchStats(projectsData);
        }}
      />

      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={async () => {
            setShowProjectForm(false);
            const projectsData = await fetchProjects();
            await fetchStats(projectsData);
          }}
        />
      )}
    </div>
  );
};
