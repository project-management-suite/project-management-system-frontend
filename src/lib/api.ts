// API client for our backend
const API_BASE_URL =
  "https://project-mngmt-backend-6egk5xxe4-divyansh-jhas-projects-5f01972a.vercel.app/api";

interface User {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "DEVELOPER";
}

interface AuthResponse {
  token: string;
  user: User;
}

interface Project {
  project_id: string;
  project_name: string;
  description: string;
  owner_manager_id: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  task_id: string;
  project_id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date?: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("authToken");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    username: string;
    email: string;
    password: string;
    role: "ADMIN" | "MANAGER" | "DEVELOPER";
  }): Promise<AuthResponse> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Project endpoints
  async getProjects(): Promise<{ projects: Project[] }> {
    return this.request("/projects");
  }

  async createProject(data: {
    project_name: string;
    description: string;
  }): Promise<Project> {
    return this.request("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProject(projectId: string): Promise<Project> {
    return this.request(`/projects/${projectId}`);
  }

  async updateProject(
    projectId: string,
    data: Partial<Project>
  ): Promise<Project> {
    return this.request(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: string): Promise<{ message: string }> {
    return this.request(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  // Task endpoints
  async getTasks(projectId?: string): Promise<{ tasks: Task[] }> {
    const endpoint = projectId ? `/tasks?projectId=${projectId}` : "/tasks";
    return this.request(endpoint);
  }

  async createTask(data: {
    project_id: string;
    title: string;
    description?: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    due_date?: string;
  }): Promise<Task> {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
    return this.request(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string): Promise<{ message: string }> {
    return this.request(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  async assignTask(
    taskId: string,
    developerIds: string[]
  ): Promise<{ message: string }> {
    return this.request(`/tasks/${taskId}/assign`, {
      method: "POST",
      body: JSON.stringify({ developerIds }),
    });
  }

  // Dashboard endpoint
  async getDashboard(): Promise<{ projects: Project[]; tasks: Task[] }> {
    return this.request("/dashboard");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { User, AuthResponse, Project, Task };
