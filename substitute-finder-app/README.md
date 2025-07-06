# Substitute Teacher Finder App

A cross-platform desktop application built with Tauri, React, and TypeScript to help schools and organizations efficiently manage substitute teacher requests and scheduling.

## Features

### ✅ **Currently Implemented**
- **Organization Management**: Create and manage hierarchical organizations (parent-child relationships)
- **Class Management**: Complete CRUD interface with organization filtering, subject/grade selection
- **User Authentication**: Secure login system with role-based access (admin, org_manager, substitute)
- **User Management**: Full user interface with role-based permissions and organization assignment
- **Substitute Request Workflow**: Complete request creation, management, and status tracking
- **Dashboard & Analytics**: Real-time metrics, upcoming requests, and system overview
- **Advanced Analytics & Reporting**: Comprehensive analytics dashboard with trends, performance metrics, and visual charts
- **Export Functionality**: CSV/Excel export for all data types with comprehensive reporting capabilities
- **Desktop Notifications**: Real-time desktop alerts using Tauri notification system
- **Substitute Response System**: Accept/decline requests with role-based filtering and notifications
- **Notification Center**: In-app notification center with bell icon and history
- **Settings Management**: Comprehensive configuration system with user preferences, system settings, and admin controls
- **Admin Panel**: Professional interface with header, sidebar navigation, and responsive design
- **Database**: SQLite with comprehensive schema and demo data seeding
- **Backend API**: Full CRUD operations via Rust Tauri commands with authentication

### 📋 **Planned Features**
- Multi-teacher class assignments
- Advanced availability matching algorithms
- Automated request assignment
- Email/SMS notification integration
- Mobile app (via Tauri Mobile when available)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri 2.0
- **Database**: SQLite (local storage)
- **UI Components**: Custom components inspired by shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand + TanStack React Query
- **Package Manager**: Bun
- **Build Tool**: Vite

## Architecture

```
├── Frontend (React + TypeScript)
│   ├── Components (UI library)
│   ├── API layer (Tauri invoke calls)
│   └── Types (TypeScript interfaces)
├── Backend (Rust + Tauri)
│   ├── Database models and schema
│   ├── Tauri commands (API endpoints)
│   └── SQLite connection management
└── Database (SQLite)
    ├── Organizations (hierarchical)
    ├── Users (role-based)
    ├── Classes and teacher assignments
    └── Substitute requests and responses
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (package manager)
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri Prerequisites](https://tauri.app/start/prerequisites/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd substitute-finder-app
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Run the development server:
   ```bash
   bun run tauri dev
   ```

4. First-time setup:
   - Click "Seed Database with Demo Data" on the login screen
   - Login with demo credentials: `admin` / `admin`

### Building for Production

```bash
bun run tauri build
```

## Development

### Project Structure

```
src/
├── components/
│   ├── ui/              # Base UI components (Button, Input, Card, etc.)
│   ├── layout/          # Layout components (Sidebar, Header)
│   ├── auth/            # Authentication components (LoginForm)
│   ├── dashboard/       # Dashboard and analytics components
│   ├── organizations/   # Organization management components
│   ├── classes/         # Class management components
│   ├── users/           # User management components
│   ├── requests/        # Substitute request management components
│   ├── notifications/   # Notification center and toast components
│   └── settings/        # Settings and configuration components
├── contexts/
│   ├── AuthContext.tsx         # Authentication state management
│   ├── NotificationContext.tsx # Notification state management
│   └── SettingsContext.tsx     # Settings state management
├── lib/
│   ├── api.ts          # Tauri API calls
│   ├── export.ts       # Export functionality (CSV/Excel)
│   └── utils.ts        # Utility functions
└── types/
    └── index.ts        # TypeScript type definitions

src-tauri/
├── src/
│   ├── commands/       # Tauri command handlers (organization, class, user, auth, substitute, notification, seed)
│   ├── database/       # Database models, schema, and connection management
│   └── lib.rs         # Main Tauri application
├── Cargo.toml         # Rust dependencies
└── tauri.conf.json    # Tauri configuration
```

### Available Scripts

- `bun run dev` - Start Vite development server
- `bun run build` - Build frontend for production
- `bun run tauri dev` - Start Tauri development server
- `bun run tauri build` - Build complete application

### Database Schema

The application uses SQLite with the following main entities:

- **Organizations**: Hierarchical structure with parent-child relationships
- **Users**: Role-based (admin, org_manager, substitute) with organization association
- **Classes**: Belong to organizations with subject, grade level, and room information
- **Substitute Requests**: Complete workflow with date/time, reason, instructions, and status tracking
- **Request Responses**: Substitute teacher responses to requests (accept/decline)
- **Notifications**: Log of all notifications sent to users

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Code Style

- **TypeScript**: Strict mode with comprehensive type safety
- **React**: Functional components with hooks
- **Rust**: Standard formatting with `cargo fmt`
- **CSS**: Tailwind utility classes with custom design system

## Security

- Local SQLite database (no cloud storage by default)
- Input validation on both frontend and backend
- Role-based access control for different user types
- Secure password hashing (planned)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

### Phase 1: Core Functionality ✅
- [x] Project setup and architecture
- [x] Database schema and backend API
- [x] Admin panel and organization management

### Phase 2: Class & User Management ✅
- [x] Class management interface with filtering and metadata
- [x] User authentication system with persistent sessions
- [x] Role-based permissions and access control
- [x] User management interface with organization assignment
- [x] Database seeding with demo data

### Phase 3: Substitute Workflow ✅
- [x] Substitute request creation with comprehensive form
- [x] Request management interface with status tracking
- [x] Dashboard with metrics and upcoming requests overview
- [x] Status management (open, filled, cancelled)
- [x] Role-based request access and permissions

### Phase 4: Advanced Features ✅
- [x] Desktop notifications for real-time alerts
- [x] Substitute response system (accept/decline requests)
- [x] Advanced analytics and reporting dashboard
- [x] Export functionality (CSV/Excel reports)
- [x] Settings management and configuration

### Phase 5: Enhancements 📋
- [ ] Email/SMS notification integration
- [ ] Automated substitute matching algorithms
- [ ] Mobile app (Tauri Mobile when available)
- [ ] Cloud backup and synchronization options

## Support

For questions or support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Tauri, React, and TypeScript