# 🚀 Project Management System

<div align="center">

![Project Management System](https://img.shields.io/badge/Project-Management%20System-blue?style=for-the-badge&logo=rocket)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite)

**A modern, full-stack project management solution built with cutting-edge technologies**

[🌟 Live Demo](#) • [📖 Documentation](#features) • [🚀 Quick Start](#quick-start) • [🛠️ Tech Stack](#tech-stack)

---

<img src="https://via.placeholder.com/800x400/1a1a2e/ffffff?text=Project+Management+System+Dashboard" alt="Dashboard Preview" width="100%" style="border-radius: 10px; margin: 20px 0;" />

</div>

## ✨ Features

<div align="center">

|             🔐 **Authentication**             |                  👥 **Role Management**                   |          📊 **Project Tracking**          |             📋 **Task Management**             |
| :-------------------------------------------: | :-------------------------------------------------------: | :---------------------------------------: | :--------------------------------------------: |
| Secure user authentication with Supabase Auth | Admin, Manager, Developer roles with granular permissions | Real-time project creation and monitoring | Advanced task assignment and progress tracking |

|     📁 **File Management**      |      🎨 **Modern UI/UX**      |       🔒 **Security**       |       📱 **Responsive**        |
| :-----------------------------: | :---------------------------: | :-------------------------: | :----------------------------: |
| Upload and manage project files | Beautiful Tailwind CSS design | Row-level security policies | Mobile-first responsive design |

</div>

### 🎯 Core Functionality

- **🔐 Multi-Role Authentication System**

  - Secure user registration and login
  - Role-based access control (Admin/Manager/Developer)
  - Profile management with email verification

- **📊 Advanced Project Management**

  - Create and manage multiple projects
  - Real-time project status tracking
  - Project ownership and team collaboration

- **📋 Intelligent Task System**

  - Task creation with detailed descriptions
  - Start/end date scheduling
  - Status tracking (New → Assigned → In Progress → Completed)
  - Developer task assignments

- **👥 Team Collaboration**

  - Manager can assign tasks to developers
  - Real-time updates and notifications
  - Team member visibility and management

- **📁 File Management**
  - Upload project-related files
  - Secure file storage with Supabase Storage
  - File association with projects and tasks

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn**
- **Git**
- A **Supabase** account ([Sign up here](https://supabase.com))

### 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/divyanshjha30/Project-Management-System.git
   cd Project-Management-System
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create environment file
   cp .env.example .env.local

   # Add your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**

   Run the following migrations in your Supabase SQL Editor:

   - `supabase/migrations/20251115055837_create_profiles_table.sql`
   - `supabase/migrations/20251115055917_create_projects_table.sql`
   - `supabase/migrations/20251115055951_create_tasks_and_assignments.sql`
   - `supabase/migrations/20251115060004_add_developer_project_policy.sql`
   - `supabase/migrations/20251115060030_create_files_table.sql`

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173` and start managing your projects! 🎉

## 🛠️ Tech Stack

<div align="center">

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

### Backend

![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Tools & Libraries

![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide-000000?style=for-the-badge&logo=lucide&logoColor=white)

</div>

### 🏗️ Architecture Overview

```mermaid
graph TB
    A[React Frontend] --> B[Supabase Client]
    B --> C[Supabase Auth]
    B --> D[PostgreSQL Database]
    B --> E[Supabase Storage]

    D --> F[Profiles Table]
    D --> G[Projects Table]
    D --> H[Tasks Table]
    D --> I[Task Assignments Table]
    D --> J[Files Table]

    style A fill:#61DAFB
    style C fill:#3ECF8E
    style D fill:#336791
    style E fill:#3ECF8E
```

## 📱 User Roles & Permissions

<div align="center">

| Role             | Permissions               | Dashboard Features                              |
| ---------------- | ------------------------- | ----------------------------------------------- |
| **🔑 Admin**     | Full system access        | User management, All projects, System settings  |
| **👔 Manager**   | Project & team management | Create projects, Assign tasks, Team overview    |
| **💻 Developer** | Task execution            | View assigned tasks, Update status, File access |

</div>

## 🎨 Screenshots

<details>
<summary>📸 Click to view application screenshots</summary>

### 🔐 Authentication

<img src="https://via.placeholder.com/600x400/667eea/ffffff?text=Login+Screen" alt="Login Screen" width="48%" />
<img src="https://via.placeholder.com/600x400/764ba2/ffffff?text=Register+Screen" alt="Register Screen" width="48%" />

### 👔 Manager Dashboard

<img src="https://via.placeholder.com/800x500/f093fb/ffffff?text=Manager+Dashboard" alt="Manager Dashboard" width="100%" />

### 💻 Developer Dashboard

<img src="https://via.placeholder.com/800x500/4facfe/ffffff?text=Developer+Dashboard" alt="Developer Dashboard" width="100%" />

### 📊 Project Management

<img src="https://via.placeholder.com/800x500/43e97b/ffffff?text=Project+Creation" alt="Project Creation" width="100%" />

</details>

## 🚧 Database Schema

<details>
<summary>📊 View complete database structure</summary>

### 👥 Profiles Table

```sql
- user_id (UUID, PK)
- username (TEXT, UNIQUE)
- email (TEXT, UNIQUE)
- role (TEXT: ADMIN|MANAGER|DEVELOPER)
- created_at, updated_at (TIMESTAMP)
```

### 📊 Projects Table

```sql
- project_id (UUID, PK)
- project_name (TEXT)
- description (TEXT)
- owner_manager_id (UUID, FK)
- created_at, updated_at (TIMESTAMP)
```

### 📋 Tasks Table

```sql
- task_id (UUID, PK)
- project_id (UUID, FK)
- title, description (TEXT)
- start_date, end_date (DATE)
- status (TEXT: NEW|ASSIGNED|IN_PROGRESS|COMPLETED)
- created_at, updated_at (TIMESTAMP)
```

### 🔗 Task Assignments Table

```sql
- assignment_id (UUID, PK)
- task_id (UUID, FK)
- developer_id (UUID, FK)
- assigned_at (TIMESTAMP)
```

### 📁 Files Table

```sql
- file_id (UUID, PK)
- project_id (UUID, FK)
- task_id (UUID, FK, NULLABLE)
- uploaded_by_user_id (UUID, FK)
- file_name, file_path_in_storage (TEXT)
- file_size (BIGINT)
- mime_type (TEXT)
- upload_date (TIMESTAMP)
```

</details>

## 🔧 Development

### 📋 Available Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start development server with hot reload |
| `npm run build`     | Build the project for production         |
| `npm run lint`      | Run ESLint for code quality              |
| `npm run preview`   | Preview the production build locally     |
| `npm run typecheck` | Type-check the TypeScript code           |

### 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### 📝 Code Style Guidelines

- Use **TypeScript** for type safety
- Follow **React best practices** and hooks patterns
- Use **Tailwind CSS** for styling
- Write **clean, readable code** with proper commenting
- Implement **proper error handling**

## 🐛 Troubleshooting

<details>
<summary>🔍 Common issues and solutions</summary>

### Database Connection Issues

```bash
# Ensure your Supabase URL and key are correct
# Check if your Supabase project is active
# Verify network connectivity
```

### Build Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run typecheck
```

### Environment Variables

```bash
# Ensure .env.local exists and contains:
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

</details>

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for providing an excellent backend-as-a-service platform
- **React Team** for the amazing React library
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the lightning-fast build tool
- **Lucide** for the beautiful icon set

## 📞 Support

<div align="center">

**Need help? We're here for you!**

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/divyanshjha30/Project-Management-System/issues)
[![Email](https://img.shields.io/badge/Email-Support-blue?style=for-the-badge&logo=gmail)](mailto:your-email@example.com)

</div>

---

<div align="center">

**Made with ❤️ by [Divyansh Jha](https://github.com/divyanshjha30)**

⭐ **Star this repository if you found it helpful!** ⭐

</div>
