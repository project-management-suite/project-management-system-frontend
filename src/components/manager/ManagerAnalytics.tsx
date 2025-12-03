import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  Target,
  Activity,
  AlertTriangle,
  Award,
  Calendar,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completionRate: number;
    totalTeamMembers: number;
  };
  velocity: {
    tasksPerWeek: number;
    totalWeeks: number;
    trend: Array<{ week: string; tasksCompleted: number }>;
  };
  estimation: {
    accuracy: number;
    totalEstimatedHours: string;
    totalActualHours: string;
    variance: string;
    tasksWithEstimates: number;
  };
  burnRate: {
    percentage: number;
    hoursConsumed: string;
    hoursEstimated: string;
    hoursRemaining: string;
  };
  teamPerformance: Array<{
    userId: string;
    username: string;
    tasksCompleted: number;
    hoursLogged: number;
    avgHoursPerTask: string;
    workLogCount: number;
    efficiency: string;
  }>;
  distribution: {
    byPriority: { HIGH: number; MEDIUM: number; LOW: number };
    byStatus: {
      TODO: number;
      IN_PROGRESS: number;
      COMPLETED: number;
      CANCELLED: number;
    };
    byWorkType: { [key: string]: number };
  };
  projectHealth: Array<{
    projectId: string;
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: string;
    burnRate: string;
    healthScore: string;
    status: "GOOD" | "WARNING" | "CRITICAL";
  }>;
  timeRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  gray: "#6B7280",
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export default function ManagerAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30");
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchAnalytics();
  }, [timeRange, selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.getProjects();
      const projectsData = response.projects || [];
      setProjects(projectsData);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ timeRange });
      if (selectedProject) params.append("projectId", selectedProject);

      const result = await apiClient.get(
        `/reports/manager-analytics?${params}`
      );
      setAnalytics(result.analytics);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="glass-soft border border-white/10 rounded-lg p-8 text-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const statusChartData = [
    {
      name: "Completed",
      value: analytics.distribution.byStatus.COMPLETED,
      color: COLORS.success,
    },
    {
      name: "In Progress",
      value: analytics.distribution.byStatus.IN_PROGRESS,
      color: COLORS.primary,
    },
    {
      name: "To Do",
      value: analytics.distribution.byStatus.TODO,
      color: COLORS.warning,
    },
    {
      name: "Cancelled",
      value: analytics.distribution.byStatus.CANCELLED,
      color: COLORS.gray,
    },
  ].filter((item) => item.value > 0);

  const priorityChartData = [
    {
      name: "High",
      value: analytics.distribution.byPriority.HIGH,
      color: COLORS.danger,
    },
    {
      name: "Medium",
      value: analytics.distribution.byPriority.MEDIUM,
      color: COLORS.warning,
    },
    {
      name: "Low",
      value: analytics.distribution.byPriority.LOW,
      color: COLORS.success,
    },
  ].filter((item) => item.value > 0);

  const workTypeChartData = Object.entries(
    analytics.distribution.byWorkType
  ).map(([name, value]) => ({
    name: name.replace("_", " "),
    hours: parseFloat(value.toString()).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="opacity-70 mt-1">
              Comprehensive team and project insights
            </p>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="glass px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}
                </option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="glass px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 6 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={analytics.overview.totalProjects}
          icon={<Target className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Total Tasks"
          value={analytics.overview.totalTasks}
          subtitle={`${analytics.overview.completedTasks} completed`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Completion Rate"
          value={`${analytics.overview.completionRate}%`}
          icon={<Activity className="w-6 h-6" />}
          color="purple"
          trend={analytics.overview.completionRate >= 70 ? "up" : "down"}
        />
        <MetricCard
          title="Project Members"
          value={analytics.overview.totalTeamMembers}
          icon={<Users className="w-6 h-6" />}
          color="cyan"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Sprint Velocity"
          value={analytics.velocity.tasksPerWeek}
          unit="tasks/week"
          icon={<TrendingUp className="w-5 h-5" />}
          description={`Over ${analytics.velocity.totalWeeks} weeks`}
          color="blue"
        />
        <KPICard
          title="Estimation Accuracy"
          value={analytics.estimation.accuracy}
          unit="%"
          icon={<Target className="w-5 h-5" />}
          description={`${analytics.estimation.tasksWithEstimates} tasks analyzed`}
          color={
            analytics.estimation.accuracy >= 80
              ? "green"
              : analytics.estimation.accuracy >= 60
              ? "yellow"
              : "red"
          }
        />
        <KPICard
          title="Burn Rate"
          value={analytics.burnRate.percentage}
          unit="%"
          icon={<Clock className="w-5 h-5" />}
          description={`${analytics.burnRate.hoursRemaining}h remaining`}
          color={analytics.burnRate.percentage <= 100 ? "green" : "red"}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Trend */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Velocity Trend
          </h3>
          {analytics.velocity.trend.length > 0 ? (
            <div className="bg-black/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.velocity.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tasksCompleted"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    name="Tasks Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="opacity-70 text-center py-12">
              No velocity data available
            </p>
          )}
        </div>

        {/* Task Status Distribution */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Task Status Distribution
          </h3>
          <div
            style={{ backgroundColor: "#171717" }}
            className="rounded-lg p-4"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Team Performance
          </h3>
          {analytics.teamPerformance.length > 0 ? (
            <div
              style={{ backgroundColor: "#171717" }}
              className="rounded-lg p-4"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.teamPerformance.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="username" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="tasksCompleted"
                    fill={COLORS.primary}
                    name="Tasks Completed"
                  />
                  <Bar
                    dataKey="hoursLogged"
                    fill={COLORS.success}
                    name="Hours Logged"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="opacity-70 text-center py-12">
              No team performance data available
            </p>
          )}
        </div>

        {/* Work Type Distribution */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Work Type Distribution
          </h3>
          {workTypeChartData.length > 0 ? (
            <div
              style={{ backgroundColor: "#171717" }}
              className="rounded-lg p-4"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="hours" fill={COLORS.warning} name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="opacity-70 text-center py-12">
              No work log data available
            </p>
          )}
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Detailed Team Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="glass-soft">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Developer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Tasks Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Hours Logged
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Avg Hours/Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Work Logs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="glass divide-y divide-white/10">
              {analytics.teamPerformance.map((member, index) => (
                <tr
                  key={member.userId}
                  className={index % 2 === 0 ? "glass" : "glass-soft"}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-semibold">
                          {member.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {member.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {member.tasksCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {parseFloat(member.hoursLogged.toString()).toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {member.avgHoursPerTask || "0"}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {member.workLogCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        parseFloat(member.efficiency) >= 1
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : parseFloat(member.efficiency) >= 0.5
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {member.efficiency} tasks/10h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Health */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Project Health Overview
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="glass-soft">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Burn Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Health Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="glass divide-y divide-white/10">
              {analytics.projectHealth.map((project, index) => (
                <tr
                  key={project.projectId}
                  className={index % 2 === 0 ? "glass" : "glass-soft"}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {project.projectName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {project.completedTasks} / {project.totalTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {project.completionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {project.burnRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-white/10 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            parseFloat(project.healthScore) >= 70
                              ? "bg-green-600"
                              : parseFloat(project.healthScore) >= 40
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${project.healthScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white">
                        {project.healthScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === "GOOD"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : project.status === "WARNING"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, subtitle, icon, color, trend }: any) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-sm opacity-60 mt-1">{subtitle}</p>}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          {trend === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span
            className={`text-sm ${
              trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend === "up" ? "On track" : "Needs attention"}
          </span>
        </div>
      )}
    </div>
  );
}

// KPI Card Component
function KPICard({ title, value, unit, icon, description, color }: any) {
  const colorClasses = {
    blue: "glass-soft border-blue-500/30",
    green: "glass-soft border-green-500/30",
    yellow: "glass-soft border-yellow-500/30",
    red: "glass-soft border-red-500/30",
    purple: "glass-soft border-purple-500/30",
  };

  const textColorClasses = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    purple: "text-purple-400",
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{title}</h4>
        <span className={textColorClasses[color]}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-bold ${textColorClasses[color]}`}>
          {value}
        </span>
        <span className="text-lg font-medium opacity-70">{unit}</span>
      </div>
      <p className="text-sm mt-2 opacity-70">{description}</p>
    </div>
  );
}
