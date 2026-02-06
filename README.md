# 🚀 TeamTaskers – Team & Task Management Platform

TeamTaskers is a **full-stack, production-style team collaboration and task management platform** built to manage projects, workspaces, tasks, and team activity efficiently.  
It supports secure authentication, role-based access, real-time collaboration, and a modern dashboard UI.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication
- Secure login & registration
- Protected routes (unauthorized users blocked)
- Proper logout with token invalidation
- Auto-redirect to login on session expiry (401/403)

### 👤 User Management
- View & update user profile
- Change password securely
- Persistent login using localStorage

### 🗂️ Workspaces
- Create and manage multiple workspaces
- Add or remove members from workspaces
- Role-based member management
- Workspace-level isolation

### ✅ Task Management
- Create, update, and delete tasks
- Assign tasks to users
- Task statuses:
  - TODO
  - IN_PROGRESS
  - COMPLETED
- View tasks by workspace
- Personal task view (My Tasks)

### 📅 Calendar
- Calendar-based task visualization
- Track tasks by due dates

### 💬 Team Chat
- Real-time workspace chat
- Send and view messages per workspace

### 📊 Dashboard & Activity
- Dashboard with workspace and task statistics
- Activity tracking and audit logs
- Workspace-level audit history

### 🎨 UI / UX
- Modern dark-themed UI
- Collapsible sidebar navigation
- Responsive layout
- Smooth transitions and animations
- Custom favicon & branding

---

## 🛠️ Tech Stack

### Frontend
- **React + Vite**
- **TypeScript**
- **Tailwind CSS**
- **React Router**
- **Axios**
- **Lucide Icons**

### Backend
- **Spring Boot**
- **Java**
- **JWT Authentication**
- **REST APIs**

### Database
- **MySQL**

---

## 🧠 Architecture Overview



## Project Structure

```text
Frontend (React + Vite)
│
├── AuthContext (Global auth state)
├── Protected Routes
├── Axios Interceptors (JWT handling)
│
Backend (Spring Boot)
│
├── Auth Module
├── User Module
├── Workspace Module
├── Task Module
├── Chat Module
└── Audit Logs
```

---
## 🔐 Authentication Flow

1. User logs in → JWT token returned
2. Token stored in `localStorage`
3. Axios interceptor attaches token to every request
4. Protected routes validate authentication
5. On logout:
   - Token cleared
   - User state reset
   - Redirected to login page
6. On token expiry (401/403):
   - Auto logout
   - Redirect to login

---


## 🧪 Key Learnings

- Implemented real-world JWT authentication flow

- Built modular frontend & backend architecture

- Handled protected routing and session management

- Debugged production-style auth and navigation issues

- Designed a scalable team collaboration system
---
---
## 📌 Future Enhancements

- Refresh token implementation

- Notifications system

- File attachments in chat & tasks

- Role-based permissions (Admin / Member)

- Deployment with Docker & CI/CD

- Weekly productivity report
---
---
## 👨‍💻 Author

### Mozhivarman S

- **GitHub**: https://github.com/SMOZHIVARMAN

- **Project**: **TeamTaskers**
---