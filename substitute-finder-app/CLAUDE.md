# Claude Memory - Substitute Finder App

## Package Manager
- **Use Bun instead of npm** for all package management and script running
- Commands: `bun install`, `bun run dev`, `bun add <package>`, etc.

## Project Overview
- Tauri + React + TypeScript application
- Desktop-first substitute teacher finder app
- SQLite database for local storage
- Rust backend with Tauri commands

## Progress Completed ✅
1. **Project Setup**: Tauri + React + TypeScript foundation with Bun
2. **Dependencies**: Tailwind CSS, shadcn/ui components, form handling (react-hook-form + zod), state management (zustand + react-query)
3. **Database Schema**: Complete SQLite schema with organizations, users, classes, substitute requests, and notifications
4. **Rust Backend**: Full CRUD operations via Tauri commands for all entities
5. **Admin UI**: Sidebar navigation, organization management with hierarchical display, form components

## Current State
- Backend: Fully functional with all database operations
- Frontend: Admin panel with organization management working
- Architecture: Clean separation between UI components and API layer

## Next Steps
- Implement class management UI
- Add user management and authentication
- Build substitute request workflow
- Add desktop notifications

## Technical Notes
- All Tauri commands are synchronous (removed async) to avoid thread safety issues
- Custom CSS properties for theming with Tailwind CSS v4
- Component structure follows shadcn/ui patterns