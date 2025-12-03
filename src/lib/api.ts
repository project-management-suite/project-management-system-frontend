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

export interface File {
  file_id: string;
  project_id: string;
  task_id?: string;
  uploaded_by_user_id: string;
  file_name: string;
  original_name: string;
  file_path_in_storage: string;
  file_size: number;
  mime_type: string;
  upload_date: string;
  download_url?: string;
  project?: {
    project_id: string;
    project_name: string;
  };
  task?: {
    task_id: string;
    title: string;
  };
  uploaded_by?: {
    username: string;
    email: string;
  };
}

export interface FileShare {
  share_id: string;
  file_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  permission_level: "read" | "write" | "admin";
  shared_at: string;
  file?: File;
  shared_with?: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
  shared_by?: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
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

  private async requestFormData(endpoint: string, formData: FormData) {
    const headers: Record<string, string> = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
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

  // Project member management endpoints
  async assignProjectMembers(
    projectId: string,
    memberIds: string[],
    role: "MEMBER" | "LEAD" = "MEMBER"
  ): Promise<{ message: string; members: any[]; project_id: string }> {
    return this.request(`/projects/${projectId}/assign`, {
      method: "POST",
      body: JSON.stringify({ memberIds, role }),
    });
  }

  async getProjectMembers(projectId: string): Promise<{
    project_id: string;
    members: Array<{
      membership_id: string;
      member_id: string;
      role: string;
      joined_at: string;
      member: {
        user_id: string;
        username: string;
        email: string;
        role: string;
      };
    }>;
  }> {
    return this.request(`/projects/${projectId}/members`);
  }

  async removeProjectMember(
    projectId: string,
    memberId: string
  ): Promise<{ message: string; project_id: string; member_id: string }> {
    return this.request(`/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    });
  }

  async updateProjectMemberRole(
    projectId: string,
    memberId: string,
    role: "MEMBER" | "LEAD"
  ): Promise<{ message: string; member: any }> {
    return this.request(`/projects/${projectId}/members/${memberId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
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

  // File Management endpoints
  async uploadFiles(
    projectId: string,
    files: FileList,
    taskId?: string
  ): Promise<{ success: boolean; files: File[] }> {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    if (taskId) {
      formData.append("task_id", taskId);
    }

    return this.requestFormData(`/files/project/${projectId}/upload`, formData);
  }

  async getProjectFiles(
    projectId: string
  ): Promise<{ success: boolean; files: File[] }> {
    return this.request(`/files/project/${projectId}`);
  }

  async getTaskFiles(
    taskId: string
  ): Promise<{ success: boolean; files: File[] }> {
    return this.request(`/files/task/${taskId}`);
  }

  async getFileMetadata(
    fileId: string
  ): Promise<{ success: boolean; file: File }> {
    return this.request(`/files/${fileId}`);
  }

  async deleteFile(
    fileId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/files/${fileId}`, { method: "DELETE" });
  }

  async getFileStatistics(projectId: string): Promise<{
    success: boolean;
    stats: {
      total_files: number;
      total_size: string;
      files_by_type: Record<string, number>;
    };
  }> {
    return this.request(`/files/project/${projectId}/stats`);
  }

  // File Sharing endpoints
  async shareFile(
    fileId: string,
    sharedWithUserId: string,
    permissionLevel: "read" | "write" | "admin" = "read"
  ): Promise<{ success: boolean; share: FileShare }> {
    return this.request("/file-shares", {
      method: "POST",
      body: JSON.stringify({
        file_id: fileId,
        shared_with_user_id: sharedWithUserId,
        permission_level: permissionLevel,
      }),
    });
  }

  async shareBulkFiles(
    fileIds: string[],
    userIds: string[],
    permissionLevel: "read" | "write" | "admin" = "read"
  ): Promise<{ success: boolean; shares: FileShare[] }> {
    return this.request("/file-shares/bulk", {
      method: "POST",
      body: JSON.stringify({
        file_ids: fileIds,
        user_ids: userIds,
        permission_level: permissionLevel,
      }),
    });
  }

  async getSharedWithMe(
    limit: number = 50,
    offset: number = 0,
    permissionLevel?: string,
    mimeTypeFilter?: string
  ): Promise<{ success: boolean; files: FileShare[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (permissionLevel) params.append("permission_level", permissionLevel);
    if (mimeTypeFilter) params.append("mime_type_filter", mimeTypeFilter);

    return this.request(`/file-shares/shared-with-me?${params}`);
  }

  async getSharedByMe(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; shares: FileShare[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.request(`/file-shares/shared-by-me?${params}`);
  }

  async getFileShares(
    fileId: string
  ): Promise<{ success: boolean; shares: FileShare[] }> {
    return this.request(`/file-shares/file/${fileId}`);
  }

  async checkFileAccess(fileId: string): Promise<{
    success: boolean;
    access: {
      has_access: boolean;
      permission_level?: string;
      access_type?: string;
    };
  }> {
    return this.request(`/file-shares/file/${fileId}/access`);
  }

  async updateSharePermission(
    shareId: string,
    newPermission: "read" | "write" | "admin"
  ): Promise<{ success: boolean; share: FileShare }> {
    return this.request(`/file-shares/${shareId}`, {
      method: "PUT",
      body: JSON.stringify({ permission_level: newPermission }),
    });
  }

  async removeShare(
    shareId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/file-shares/${shareId}`, { method: "DELETE" });
  }

  async shareWithProjectTeam(
    fileId: string,
    permissionLevel: "read" | "write" | "admin" = "read"
  ): Promise<{ success: boolean; shares: FileShare[] }> {
    return this.request(`/file-shares/file/${fileId}/share-with-team`, {
      method: "POST",
      body: JSON.stringify({ permission_level: permissionLevel }),
    });
  }

  async removeAllFileShares(
    fileId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/file-shares/file/${fileId}/remove-all`, {
      method: "DELETE",
    });
  }

  async getUserSharingStats(userId: string): Promise<{
    success: boolean;
    stats: {
      shared_by_user: number;
      shared_with_user: number;
      files_owned: number;
      total_file_shares: number;
    };
  }> {
    return this.request(`/file-shares/user/${userId}/stats`);
  }

  async getSharingAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    success: boolean;
    analytics: any;
  }> {
    const params = new URLSearchParams();
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);

    const queryString = params.toString();
    return this.request(
      `/file-shares/analytics${queryString ? `?${queryString}` : ""}`
    );
  }
}

export const apiClient = new ApiClient();
