// API client for our backend
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://project-mngmt-backend.vercel.app/api";

// Log the API URL being used (for debugging)
console.log("🔗 API Base URL:", API_BASE_URL);

interface User {
  user_id: string;
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
  status: "NEW" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  assigned_developers?: any[];
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
  }): Promise<{ message: string; tempUserId?: string }> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: { email: string; otp: string }): Promise<AuthResponse> {
    return this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resendOTP(data: { email: string }): Promise<{ message: string }> {
    return this.request("/auth/resend-otp", {
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
    const endpoint = projectId ? `/tasks/project/${projectId}` : "/tasks";
    return this.request(endpoint);
  }

  async createTask(
    projectId: string,
    data: {
      title: string;
      description?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<Task> {
    return this.request(`/tasks/project/${projectId}`, {
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

  async assignDeveloper(
    taskId: string,
    developerId: string
  ): Promise<{ message: string }> {
    return this.request(`/tasks/${taskId}/assign`, {
      method: "POST",
      body: JSON.stringify({ developer_id: developerId }),
    });
  }

  // User management endpoints
  async getUsers(): Promise<{ users: User[] }> {
    return this.request("/admin/users");
  }

  async getUsersByRole(role?: string): Promise<{ users: User[] }> {
    if (role === "DEVELOPER") {
      return this.request("/projects/developers");
    }
    const endpoint = role ? `/admin/users?role=${role}` : "/admin/users";
    return this.request(endpoint);
  }

  // Dashboard endpoint
  async getDashboard(): Promise<{ projects: Project[]; tasks: Task[] }> {
    return this.request("/projects/dashboard");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { User, AuthResponse, Project, Task };
