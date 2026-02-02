import axios from "axios";

/* ===============================
   Base API URL
================================ */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/* ===============================
   Axios Instance (SINGLE SOURCE)
================================ */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   Request Interceptor
================================ */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===============================
   Response Interceptor
================================ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/* ===============================
   AUTH API
================================ */
export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
  }) => api.post("/auth/register", data),

  login: (data: {
    username: string;
    password: string;
  }) => api.post<string>("/auth/login", data),

  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) => api.put("/auth/change-password", data),
};

/* ===============================
   USER API
================================ */
export const userApi = {
  getMe: () => api.get("/users/me"),

  updateProfile: (data: {
    username?: string;
    email?: string;
    bio?: string;
    skills?: string;
    jobTitle?: string;
    experience?: string;
  }) => api.put("/users/profile", data),

  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) => api.put("/users/change-password", data),
};

/* ===============================
   WORKSPACE API
================================ */
export const workspaceApi = {
  getAll: () => api.get("/workspaces"),

  getById: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}`),

  create: (data: {
    name: string;
    description: string;
    deadline?: string;
  }) => api.post("/workspaces", data),

  addMembers: (workspaceId: string, usernames: string[]) =>
    api.post(`/workspaces/${workspaceId}/members`, { usernames }),

  removeMember: (workspaceId: string, username: string) =>
    api.delete(`/workspaces/${workspaceId}/members/${username}`),
};

/* ===============================
   TASK API
================================ */
export const taskApi = {
  getMyTasks: () => api.get("/tasks/my"),

  getByWorkspace: (workspaceId: string) =>
    api.get(`/tasks/workspace/${workspaceId}`),

  getByDate: (date: string) =>
    api.get("/tasks/date", { params: { date } }),

  getByDateRange: (startDate: string, endDate: string) =>
    api.get("/tasks/date-range", { params: { startDate, endDate } }),

  create: (data: {
    title: string;
    description: string;
    workspaceId: string;
    assigneeUsername?: string;
    dueDate?: string;
  }) => api.post("/tasks", data),

  updateStatus: (taskId: string, status: string) =>
    api.put(`/tasks/${taskId}/status`, { status }),

  updateDueDate: (taskId: string, dueDate: string) =>
    api.put(`/tasks/${taskId}/due-date`, { dueDate }),

  assign: (taskId: string, username: string) =>
    api.put(`/tasks/${taskId}/assign`, { username }),

  delete: (taskId: string) =>
    api.delete(`/tasks/${taskId}`),
};

/* ===============================
   CHAT API ✅ FIXED
================================ */
export const chatApi = {
  getMessages: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/messages`),

  sendMessage: (workspaceId: string, content: string) =>
    api.post(`/workspaces/${workspaceId}/messages`, { content }),
};

/* ===============================
   AUDIT API
================================ */
export const auditApi = {
  getByWorkspace: (workspaceId: string) =>
    api.get(`/audit/workspace/${workspaceId}`),
};

export default api;
