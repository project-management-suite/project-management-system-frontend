// API client for our backend
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://project-management-system-backend-service.vercel.app/api";

// Log the API URL being used (for debugging)
console.log("🔗 API Base URL:", API_BASE_URL);

export interface User {
  user_id: string;
  username: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "DEVELOPER";
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user?: User;
  token?: string;
  tempUserId?: string;
}

export interface Project {
  project_id: string;
  project_name: string;
  description: string;
  owner_manager_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
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
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage
    this.token = localStorage.getItem("token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  // Auth endpoints
  async login(data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    role: "ADMIN" | "MANAGER" | "DEVELOPER";
  }): Promise<RegisterResponse> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: {
    email: string;
    otp: string;
  }): Promise<LoginResponse> {
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

  // Generic CRUD operations
  async get(endpoint: string) {
    return this.request(endpoint, {
      method: "GET",
    });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
