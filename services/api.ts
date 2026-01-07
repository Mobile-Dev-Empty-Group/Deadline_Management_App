import { getAccessToken } from '@/utils/auth';

const API_BASE_URL = 'https://backend-jqpw.onrender.com';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: string;
  pushNotifications: boolean;
  darkMode: boolean;
  hasFinishedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string | null;
}

export interface UpdateSettingsRequest {
  pushNotifications?: boolean;
  darkMode?: boolean;
}

export interface Project {
  id: string;
  name: string;
  userId: string;
}

export interface ProjectAdapterItem {
  label: string;
  value: string;
}

export interface GetProjectAdapterRequest {
  uid: string;
  id?: string;
  name?: string;
}

export interface GetProjectsRequest {
  uid: string;
  id?: string;
  name?: string;
}

export interface CreateProjectRequest {
  uid: string;
  name: string;
}

export interface UpdateProjectRequest {
  uid: string;
  id: string;
  name: string;
}

export interface DeleteProjectRequest {
  uid: string;
  id: string;
}

/**
 * Helper function để tạo headers với Authorization token
 */
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Đăng ký tài khoản mới
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed: ${response.status}`);
    }

    const result: AuthResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Đăng nhập
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed: ${response.status}`);
    }

    const result: AuthResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Lấy thông tin user hiện tại
 */
export const getMe = async (): Promise<User> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get user info: ${response.status}`);
    }

    const result: User = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Cập nhật thông tin profile user
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
    }

    const result: User = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Upload media (avatar) với multipart/form-data
 */
export interface UploadMediaResponse {
  url: string;
  // Có thể có thêm các field khác tùy backend
}

export const uploadMedia = async (fileUri: string, fileName?: string): Promise<UploadMediaResponse> => {
  try {
    const headers = await getAuthHeaders();
    
    // Tạo FormData
    const formData = new FormData();
    
    // Lấy file name từ URI nếu không có
    const name = fileName || fileUri.split('/').pop() || 'image.jpg';
    const fileType = name.split('.').pop() || 'jpg';
    
    // Tạo file object cho FormData
    formData.append('file', {
      uri: fileUri,
      type: `image/${fileType}`,
      name: name,
    } as any);

    // Xóa Content-Type header để browser tự động set với boundary
    const uploadHeaders: any = {
      ...headers,
    };
    delete uploadHeaders['Content-Type'];

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: uploadHeaders,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to upload media: ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload media response (raw):', JSON.stringify(result, null, 2));
    
    // Hỗ trợ nhiều format response khác nhau
    let avatarUrl: string | undefined;
    
    // Kiểm tra tất cả các khả năng
    if (typeof result === 'string') {
      avatarUrl = result;
    } else if (result.url) {
      avatarUrl = result.url;
    } else if (result.data?.url) {
      avatarUrl = result.data.url;
    } else if (result.path) {
      avatarUrl = result.path;
    } else if (result.data?.path) {
      avatarUrl = result.data.path;
    } else if (result.file?.url) {
      avatarUrl = result.file.url;
    } else if (result.file?.path) {
      avatarUrl = result.file.path;
    } else if (result.location) {
      avatarUrl = result.location;
    } else if (result.link) {
      avatarUrl = result.link;
    } else if (result.filename) {
      avatarUrl = result.filename;
    }
    
    console.log('Extracted avatar URL:', avatarUrl);
    
    // Nếu URL là relative, thử nhiều cách để build full URL
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      // Nếu URL bắt đầu với /, thêm base URL
      if (avatarUrl.startsWith('/')) {
        avatarUrl = `${API_BASE_URL}${avatarUrl}`;
      } else {
        // Thử các endpoint khác nhau
        // 1. Thử /media/uploads/ trước
        if (avatarUrl.startsWith('uploads/')) {
          avatarUrl = `${API_BASE_URL}/media/${avatarUrl}`;
        } 
        // 2. Thử /public/uploads/
        else if (avatarUrl.includes('uploads')) {
          avatarUrl = `${API_BASE_URL}/public/${avatarUrl}`;
        }
        // 3. Thử /media/ cho các path khác
        else {
          avatarUrl = `${API_BASE_URL}/media/${avatarUrl}`;
        }
      }
    }
    
    console.log('Final processed avatar URL:', avatarUrl);
    
    if (!avatarUrl) {
      throw new Error('Invalid response format from upload API. Response: ' + JSON.stringify(result));
    }
    
    return { url: avatarUrl };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Helper để build query string từ object
 */
const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  return queryParams.toString();
};

/**
 * Cập nhật thông tin settings user
 */
export const updateSettings = async (data: UpdateSettingsRequest): Promise<User> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update settings: ${response.status}`);
    }

    const result: User = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// ========== PROJECT APIs ==========

export interface Project {
  id: string;
  name: string;
  userId: string;
}

export interface ProjectAdapterItem {
  label: string;
  value: string;
}

export interface GetProjectAdapterRequest {
  uid: string;
  id?: string;
  name?: string;
}

export interface GetProjectsRequest {
  uid: string;
  id?: string;
  name?: string;
}

export interface CreateProjectRequest {
  uid: string;
  name: string;
}

export interface UpdateProjectRequest {
  uid: string;
  id: string;
  name: string;
}

export interface DeleteProjectRequest {
  uid: string;
  id: string;
}

/**
 * Lấy danh sách project adapter (cho dropdown/select)
 */
export const getProjectAdapter = async (data: GetProjectAdapterRequest): Promise<ProjectAdapterItem[]> => {
  try {
    const headers = await getAuthHeaders();
    const queryString = buildQueryString(data);
    const url = `${API_BASE_URL}/project/adapter${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get project adapter: ${response.status}`);
    }

    const result: ProjectAdapterItem[] = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Lấy danh sách projects
 */
export const getProjects = async (data: GetProjectsRequest): Promise<Project[]> => {
  try {
    const headers = await getAuthHeaders();
    const queryString = buildQueryString(data);
    const url = `${API_BASE_URL}/project${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get projects: ${response.status}`);
    }

    const result: Project[] = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Tạo project mới
 */
export const createProject = async (data: CreateProjectRequest): Promise<Project> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/project`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create project: ${response.status}`);
    }

    const result: Project = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Cập nhật project
 */
export const updateProject = async (data: UpdateProjectRequest): Promise<Project> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/project`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update project: ${response.status}`);
    }

    const result: Project = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Xóa project
 */
export const deleteProject = async (data: DeleteProjectRequest): Promise<Project> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/project`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete project: ${response.status}`);
    }

    const result: Project = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// ========== TASK APIs ==========

export interface Task {
  id: string;
  title: string;
  description: any;
  status: string;
  progress: number;
  isStarred: boolean;
  date: any;
  startTime: any;
  endTime: any;
  duration: any;
  breakTime: any;
  repeatDay: any;
  userId: string;
  categoryId: any;
  projectId: any;
  completedAt: any;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCategory {
  new: boolean;
  id?: string;
  name: string;
  icon: string;
}

export interface GetTasksRequest {
  uid: string;
  id?: string;
  categoryId?: string;
  projectId?: string;
  status?: string;
  title?: string;
  progress?: number;
  isStarred?: boolean;
}

export interface CreateTaskRequest {
  uid: string;
  title: string;
  description?: string;
  status?: string;
  progress?: number;
  isStarred?: boolean;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  breakTime?: number;
  repeatDay?: string;
  completedAt?: string;
  projectId?: string;
  category?: TaskCategory;
}

export interface UpdateTaskRequest {
  uid: string;
  id: string;
  title?: string;
  description?: string;
  status?: string;
  progress?: number;
  isStarred?: boolean;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  breakTime?: number;
  repeatDay?: string;
  completedAt?: string;
  projectId?: string;
  category?: TaskCategory;
}

export interface DeleteTaskRequest {
  uid: string;
  id: string;
}

export interface TaskAdapterItem {
  label: string;
  value: string;
}

export interface GetTaskAdapterRequest {
  uid: string;
  id?: string;
  categoryId?: string;
  projectId?: string;
  status?: string;
  title?: string;
  progress?: number;
  isStarred?: boolean;
}

/**
 * Lấy danh sách tasks
 */
export const getTasks = async (data: GetTasksRequest): Promise<Task[]> => {
  try {
    const headers = await getAuthHeaders();
    const queryString = buildQueryString(data);
    const url = `${API_BASE_URL}/task${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get tasks: ${response.status}`);
    }

    const result: Task[] = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Tạo task mới
 */
export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/task`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create task: ${response.status}`);
    }

    const result: Task = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Cập nhật task
 */
export const updateTask = async (data: UpdateTaskRequest): Promise<Task> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/task`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update task: ${response.status}`);
    }

    const result: Task = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Xóa task
 */
export const deleteTask = async (data: DeleteTaskRequest): Promise<Task> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/task`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete task: ${response.status}`);
    }

    const result: Task = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

/**
 * Lấy danh sách task adapter (cho dropdown/select)
 */
export const getTaskAdapter = async (data: GetTaskAdapterRequest): Promise<TaskAdapterItem[]> => {
  try {
    const headers = await getAuthHeaders();
    const queryString = buildQueryString(data);
    const url = `${API_BASE_URL}/task/adapter${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get task adapter: ${response.status}`);
    }

    const result: TaskAdapterItem[] = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// ========== CATEGORY APIs ==========

export interface CategoryAdapterItem {
  label: string;
  value: string;
}

export interface GetCategoryAdapterRequest {
  uid: string;
  id?: string;
  name?: string;
}

/**
 * Lấy danh sách category adapter (cho dropdown/select)
 */
export const getCategoryAdapter = async (data: GetCategoryAdapterRequest): Promise<CategoryAdapterItem[]> => {
  try {
    const headers = await getAuthHeaders();
    const queryString = buildQueryString(data);
    const url = `${API_BASE_URL}/category/adapter${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get category adapter: ${response.status}`);
    }

    const result: CategoryAdapterItem[] = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// ========== ANALYTICS APIs ==========

export interface GetAnalyticsRequest {
  uid: string;
  type: 'week' | 'month';
  date?: string; // ISO date string, optional
}

export interface AnalyticsSummary {
  total: number;
  completed: number;
  planned: number;
  failed: number;
}

export interface AnalyticsByWeekday {
  day: string;
  total: number;
  completed: number;
  planned: number;
  failed: number;
}

export interface AnalyticsByCategory {
  categoryId: string;
  name: string;
  icon: string;
  total: number;
  completed: number;
  planned: number;
  failed: number;
}

export interface AnalyticsResponse {
  type: 'week' | 'month';
  rangeStart: string;
  rangeEnd: string;
  summary: AnalyticsSummary;
  byWeekday: AnalyticsByWeekday[];
  byCategory: AnalyticsByCategory[];
}

/**
 * Lấy analytics data
 */
export const getAnalytics = async (data: GetAnalyticsRequest): Promise<AnalyticsResponse> => {
  try {
    const headers = await getAuthHeaders();
    const queryString = buildQueryString(data);
    const url = `${API_BASE_URL}/analytic${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get analytics: ${response.status}`);
    }

    const result: AnalyticsResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

