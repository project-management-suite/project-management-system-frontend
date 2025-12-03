import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient, Task, File, Project } from "../../lib/api";
import {
  CheckSquare,
  Code,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  X,
  Send,
  MessageSquare,
  User,
  FileText,
  Share2,
  FolderOpen,
  Users,
  Briefcase,
  UserPlus,
  Target,
  Award,
} from "lucide-react";
import { FileLibrary } from "../files/FileLibrary";
import { TaskManager } from "../manager/TaskManager";

interface DashboardStats {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  assignedTasks: number;
  totalProjects: number;
  activeProjects: number;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

export const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    assignedTasks: 0,
    totalProjects: 0,
    activeProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"tasks" | "projects" | "teams">(
    "tasks"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showFullProjectView, setShowFullProjectView] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [projectDetails, setProjectDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchDeveloperTasks();
    fetchDeveloperProjects();
    fetchDeveloperTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDeveloperTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiClient.getTasks();
      const developerTasks = response.tasks || [];
      setTasks(developerTasks);

      // Calculate stats
      const totalTasks = developerTasks.length;
      const inProgressTasks = developerTasks.filter(
        (t) => t.status === "IN_PROGRESS"
      ).length;
      const completedTasks = developerTasks.filter(
        (t) => t.status === "COMPLETED"
      ).length;
      const assignedTasks = developerTasks.filter(
        (t) => t.status === "ASSIGNED"
      ).length;

      setStats({
        totalTasks,
        inProgressTasks,
        completedTasks,
        assignedTasks,
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status !== "completed")
          .length,
      });
    } catch (error) {
      console.error("Error fetching developer tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeveloperProjects = async () => {
    if (!user) return;

    try {
      // Get projects where developer is a member
      const response = await apiClient.getDeveloperTeams();
      const developerTeams = response.teams || [];

      // Convert teams to projects format and get tasks for each
      const projectsWithTasks = [];
      for (const team of developerTeams) {
        try {
          const tasksResponse = await apiClient.getTasks(team.team_id);
          const projectTasks = tasksResponse.tasks || [];
          const assignedTasks = projectTasks.filter((task: Task) =>
            task.assigned_developers?.some(
              (dev: any) => dev.user_id === user.user_id
            )
          );

          const projectWithTasks = {
            project_id: team.team_id,
            project_name: team.team_name,
            description: team.description,
            created_at: team.created_at,
            member_count: team.member_count,
            assignedTasks,
            teamMembers: team.members,
            isLead: team.is_lead,
          };
          projectsWithTasks.push(projectWithTasks);
        } catch (error) {
          console.error(
            `Error fetching tasks for project ${team.team_id}:`,
            error
          );
          // Still include the project even if task fetching fails
          projectsWithTasks.push({
            project_id: team.team_id,
            project_name: team.team_name,
            description: team.description,
            created_at: team.created_at,
            member_count: team.member_count,
            assignedTasks: [],
            teamMembers: team.members,
            isLead: team.is_lead,
          });
        }
      }

      setProjects(projectsWithTasks);

      // Update stats with project count
      setStats((prevStats) => ({
        ...prevStats,
        totalProjects: projectsWithTasks.length,
        activeProjects: projectsWithTasks.filter(
          (p: any) => p.status !== "COMPLETED"
        ).length,
      }));
    } catch (error) {
      console.error("Error fetching developer projects:", error);
      // Set empty projects array on error
      setProjects([]);
    }
  };

  const fetchDeveloperTeams = async () => {
    if (!user) return;

    try {
      const response = await apiClient.getDeveloperTeams();
      setTeams(response.teams || []);
    } catch (error) {
      console.error("Error fetching developer teams:", error);
      setTeams([]);
    }
  };

  const handleProjectClick = async (project: any) => {
    setSelectedProject(project);
    setLoadingDetails(true);

    try {
      const details = await apiClient.getDeveloperProjectDetails(
        project.project_id
      );
      setProjectDetails(details);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setProjectDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleTeamClick = (team: any) => {
    setSelectedTeam(team);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setProjectDetails(null);
  };

  const closeTeamModal = () => {
    setSelectedTeam(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // Load mock comments (replace with API call)
    setComments([
      {
        id: "1",
        user: "John Doe",
        text: "Started working on this task",
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: "2",
        user: "Jane Smith",
        text: "Please update the documentation as well",
        timestamp: new Date(Date.now() - 43200000),
      },
    ]);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: user.username,
      text: newComment,
      timestamp: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setComments([]);
    setNewComment("");
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "NEW":
      case "ASSIGNED":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-400" />;
      case "COMPLETED":
        return <CheckSquare className="w-5 h-5 text-green-400" />;
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

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin neo-icon w-16 h-16 flex items-center justify-center rounded-lg">
              <Code className="w-8 h-8" style={{ color: "var(--brand)" }} />
            </div>
            <div className="text-lg opacity-70">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show TaskManager if full project view is requested
  if (showFullProjectView && selectedProject) {
    return (
      <TaskManager
        project={selectedProject}
        onBack={() => {
          setShowFullProjectView(false);
          setSelectedProject(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="neo-icon w-14 h-14 flex items-center justify-center rounded-xl">
              <Code className="w-7 h-7" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Developer Dashboard</h1>
              <p className="text-sm opacity-70 mt-1">
                Track your assigned tasks and progress
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "tasks"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            <CheckSquare className="w-4 h-4 inline mr-2" />
            My Tasks
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "projects"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            <FolderOpen className="w-4 h-4 inline mr-2" />
            My Projects
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "teams"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            My Teams
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <h3 className="text-3xl font-bold mb-1">{stats.totalTasks}</h3>
          <p className="text-sm opacity-70">Total Tasks</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.inProgressTasks}</h3>
          <p className="text-sm opacity-70">In Progress</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <FolderOpen className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalProjects}</h3>
          <p className="text-sm opacity-70">My Projects</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Award className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.completedTasks}</h3>
          <p className="text-sm opacity-70">Completed</p>
        </div>
      </div>

      {/* Filters and Search */}
      {activeTab === "tasks" && (
        <div className="glass rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 opacity-70" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select"
              >
                <option value="all">All Status</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "tasks" ? (
        <>
          {/* Filters and Search */}
          <div className="glass rounded-xl p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 opacity-70" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="select"
                >
                  <option value="all">All Status</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckSquare
                  className="w-6 h-6"
                  style={{ color: "var(--brand)" }}
                />
                My Assigned Tasks ({filteredTasks.length})
              </h2>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="neo-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl">
                  <CheckSquare className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-lg mb-2">
                  {searchQuery || filterStatus !== "all"
                    ? "No tasks match your filters"
                    : "No tasks assigned yet"}
                </p>
                <p className="text-sm opacity-70">
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "Your assigned tasks will appear here"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredTasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="p-6 hover:bg-white/5 transition-all group cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="text-lg font-semibold group-hover:text-[var(--brand)] transition-colors">
                            {task.title}
                          </h3>
                        </div>
                        {task.description && (
                          <p className="opacity-70 mb-3 text-sm">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs opacity-60">
                          {task.start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Start:{" "}
                                {new Date(task.start_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {task.end_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Due:{" "}
                                {new Date(task.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : activeTab === "projects" ? (
        <>
          {/* My Projects */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FolderOpen
                  className="w-6 h-6"
                  style={{ color: "var(--brand)" }}
                />
                My Projects ({projects.length})
              </h2>
            </div>

            {projects.length === 0 ? (
              <div className="p-12 text-center">
                <div className="neo-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl">
                  <FolderOpen className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-lg mb-2">No projects assigned yet</p>
                <p className="text-sm opacity-70">
                  Projects with your assigned tasks will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {projects.map((project) => (
                  <div
                    key={project.project_id}
                    className="p-6 hover:bg-white/5 transition-all group cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 group-hover:text-[var(--brand)] transition-colors">
                          <Briefcase className="w-5 h-5 text-[var(--brand)]" />
                          {project.project_name}
                        </h3>
                        {project.description && (
                          <p className="opacity-70 mb-3 text-sm">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="text-xs opacity-60 text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Target className="w-3 h-3" />
                          <span>
                            {project.assignedTasks?.length || 0} tasks assigned
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Created{" "}
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Show assigned tasks for this project */}
                    {project.assignedTasks &&
                      project.assignedTasks.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-sm font-medium mb-3 opacity-80">
                            My Tasks in this Project:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {project.assignedTasks.map((task: Task) => (
                              <div
                                key={task.task_id}
                                className="bg-[var(--tile-dark)] rounded-lg p-3 cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => handleTaskClick(task)}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusIcon(task.status)}
                                  <span className="text-sm font-medium truncate">
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                      task.status
                                    )}`}
                                  >
                                    {task.status.replace("_", " ")}
                                  </span>
                                  {task.end_date && (
                                    <span className="text-xs opacity-50">
                                      Due{" "}
                                      {new Date(
                                        task.end_date
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(project);
                        }}
                        className="btn-ghost text-sm px-3 py-2 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to full project management view (like manager sees)
                          setSelectedProject(project);
                          setShowFullProjectView(true);
                        }}
                        className="btn-primary text-sm px-3 py-2 flex items-center gap-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Open Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* My Teams */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-6 h-6" style={{ color: "var(--brand)" }} />
                My Teams ({teams.length})
              </h2>
            </div>

            {teams.length === 0 ? (
              <div className="p-12 text-center">
                <div className="neo-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl">
                  <Users className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-lg mb-2">No teams found</p>
                <p className="text-sm opacity-70">
                  Teams you're a member of will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {teams.map((team) => (
                  <div
                    key={team.team_id}
                    className="p-6 hover:bg-white/5 transition-all group cursor-pointer"
                    onClick={() => handleTeamClick(team)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="w-5 h-5 text-[var(--brand)]" />
                          <h3 className="text-lg font-semibold group-hover:text-[var(--brand)] transition-colors">
                            {team.team_name}
                          </h3>
                          {team.is_lead && (
                            <span className="px-2 py-1 text-xs bg-[var(--brand)]/20 text-[var(--brand)] rounded">
                              Team Lead
                            </span>
                          )}
                        </div>
                        {team.description && (
                          <p className="opacity-70 mb-3 text-sm">
                            {team.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs opacity-60">
                          <div className="flex items-center gap-1">
                            <UserPlus className="w-3 h-3" />
                            <span>{team.member_count} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Created{" "}
                              {new Date(team.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-5 h-5 opacity-50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-tile rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedTask.status)}
                <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
              </div>
              <button
                onClick={closeTaskModal}
                className="neo-icon hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 opacity-70" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Task Details */}
              <div>
                <h3 className="text-sm font-semibold opacity-70 mb-2">
                  Description
                </h3>
                <p className="text-white">
                  {selectedTask.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold opacity-70 mb-2">
                    Status
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedTask.status
                    )}`}
                  >
                    {selectedTask.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold opacity-70 mb-2">
                    Priority
                  </h3>
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white font-medium"
                    style={{
                      backgroundColor: "var(--brand)",
                      opacity: 0.2,
                      color: "var(--brand)",
                    }}
                  >
                    High
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedTask.start_date && (
                  <div>
                    <h3 className="text-sm font-semibold opacity-70 mb-2">
                      Start Date
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(selectedTask.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {selectedTask.end_date && (
                  <div>
                    <h3 className="text-sm font-semibold opacity-70 mb-2">
                      Due Date
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(selectedTask.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare
                    className="w-5 h-5"
                    style={{ color: "var(--brand)" }}
                  />
                  Comments ({comments.length})
                </h3>

                {/* Comments List */}
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="glass rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="neo-icon w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0">
                          <User
                            className="w-4 h-4"
                            style={{ color: "var(--brand)" }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {comment.user}
                            </span>
                            <span className="text-xs opacity-50">
                              {comment.timestamp.toLocaleDateString()}{" "}
                              {comment.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="opacity-80 text-sm">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    className="input flex-1"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-tile rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-[var(--brand)]" />
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedProject.project_name}
                  </h2>
                  <p className="text-sm opacity-70">Project Details</p>
                </div>
              </div>
              <button
                onClick={closeProjectModal}
                className="neo-icon hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 opacity-70" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin neo-icon w-8 h-8 flex items-center justify-center rounded-lg">
                    <Briefcase
                      className="w-5 h-5"
                      style={{ color: "var(--brand)" }}
                    />
                  </div>
                  <span className="ml-3 opacity-70">Loading details...</span>
                </div>
              ) : projectDetails ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass rounded-lg p-4">
                      <h3 className="text-sm font-semibold opacity-70 mb-2">
                        Team Members
                      </h3>
                      <p className="text-2xl font-bold">
                        {projectDetails.members?.length || 0}
                      </p>
                    </div>
                    <div className="glass rounded-lg p-4">
                      <h3 className="text-sm font-semibold opacity-70 mb-2">
                        Your Tasks
                      </h3>
                      <p className="text-2xl font-bold">
                        {projectDetails.user_tasks?.length || 0}
                      </p>
                    </div>
                    <div className="glass rounded-lg p-4">
                      <h3 className="text-sm font-semibold opacity-70 mb-2">
                        Your Role
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          projectDetails.project?.user_role === "LEAD"
                            ? "bg-[var(--brand)]/20 text-[var(--brand)]"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {projectDetails.project?.user_role || "Member"}
                      </span>
                    </div>
                  </div>

                  {selectedProject.description && (
                    <div>
                      <h3 className="text-sm font-semibold opacity-70 mb-2">
                        Description
                      </h3>
                      <p className="opacity-80">
                        {selectedProject.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold opacity-70 mb-4">
                      Team Members ({projectDetails.members?.length || 0})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {projectDetails.members?.map((member: any) => (
                        <div
                          key={member.user_id}
                          className="glass rounded-lg p-4 flex items-center gap-3"
                        >
                          <div className="neo-icon w-8 h-8 flex items-center justify-center rounded-full">
                            <User
                              className="w-4 h-4"
                              style={{ color: "var(--brand)" }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{member.username}</div>
                            <div className="text-xs opacity-60">
                              {member.email}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              member.project_role === "LEAD"
                                ? "bg-[var(--brand)]/20 text-[var(--brand)]"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {member.project_role}
                          </span>
                        </div>
                      )) || (
                        <p className="text-sm opacity-60 col-span-2">
                          No team members found
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="opacity-70">Failed to load project details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-tile rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-[var(--brand)]" />
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedTeam.team_name}
                  </h2>
                  <p className="text-sm opacity-70">Team Details</p>
                </div>
              </div>
              <button
                onClick={closeTeamModal}
                className="neo-icon hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 opacity-70" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {selectedTeam.description && (
                  <div>
                    <h3 className="text-sm font-semibold opacity-70 mb-2">
                      Description
                    </h3>
                    <p className="opacity-80">{selectedTeam.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold opacity-70 mb-4">
                    Team Members ({selectedTeam.member_count})
                    {selectedTeam.is_lead && (
                      <span className="ml-2 px-2 py-1 text-xs bg-[var(--brand)]/20 text-[var(--brand)] rounded">
                        You are Team Lead
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTeam.members?.map((member: any) => (
                      <div
                        key={member.user_id}
                        className="glass rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-full">
                            <User
                              className="w-5 h-5"
                              style={{ color: "var(--brand)" }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {member.username}
                              {member.user_id === user?.user_id && (
                                <span className="text-xs opacity-50 bg-[var(--brand)]/20 text-[var(--brand)] px-2 py-1 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm opacity-60">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              member.role === "ADMIN"
                                ? "bg-red-500/20 text-red-400"
                                : member.role === "MANAGER"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {member.role}
                          </span>
                          {member.project_role && (
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                member.project_role === "LEAD"
                                  ? "bg-[var(--brand)]/20 text-[var(--brand)]"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {member.project_role}
                            </span>
                          )}
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm opacity-60 col-span-2">
                        No team members found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
