import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient, Project } from "../../lib/api";
import { ProjectList } from "./ProjectList";
import { TaskManager } from "./TaskManager";
import { ProjectForm } from "./ProjectForm";
import {
  FolderKanban,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  TrendingUp,
  Briefcase,
} from "lucide-react";

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
      <div className="flex items-center justify-center h-96">
        <div className="glass rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin neo-icon w-16 h-16 flex items-center justify-center rounded-lg">
              <Briefcase
                className="w-8 h-8"
                style={{ color: "var(--brand)" }}
              />
            </div>
            <div className="text-lg opacity-70">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <TaskManager
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onTaskUpdate={() => {
          fetchStats(projects);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="neo-icon w-14 h-14 flex items-center justify-center rounded-xl">
              <Briefcase
                className="w-7 h-7"
                style={{ color: "var(--brand)" }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Manager Dashboard</h1>
              <p className="text-sm opacity-70 mt-1">
                Manage your projects and tasks
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowProjectForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <FolderKanban
                className="w-6 h-6"
                style={{ color: "var(--brand)" }}
              />
            </div>
            <TrendingUp className="w-5 h-5 opacity-50" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalProjects}</h3>
          <p className="text-sm opacity-70">Total Projects</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Calendar className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalTasks}</h3>
          <p className="text-sm opacity-70">Total Tasks</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Clock className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.inProgressTasks}</h3>
          <p className="text-sm opacity-70">In Progress</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <CheckCircle
                className="w-6 h-6"
                style={{ color: "var(--brand)" }}
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.completedTasks}</h3>
          <p className="text-sm opacity-70">Completed</p>
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
