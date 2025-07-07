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

### Phase 1: Core Foundation ✅
1. **Project Setup**: Tauri + React + TypeScript foundation with Bun
2. **Dependencies**: Tailwind CSS, shadcn/ui components, form handling (react-hook-form + zod), state management (zustand + react-query)
3. **Database Schema**: Complete SQLite schema with organizations, users, classes, substitute requests, and notifications
4. **Rust Backend**: Full CRUD operations via Tauri commands for all entities
5. **Admin UI**: Sidebar navigation, organization management with hierarchical display, form components

### Phase 2: Class & User Management ✅
6. **Class Management**: Complete CRUD interface with organization filtering, subject/grade selection
7. **User Authentication**: Login system with role-based access (admin, org_manager, substitute)
8. **User Management**: Full user interface with role-based permissions and organization assignment
9. **Navigation & Layout**: Header with user info and logout, responsive sidebar navigation
10. **Database Seeding**: Demo data creation for testing and development

## Current State
- **Backend**: Fully functional with all CRUD operations + authentication + seeding
- **Frontend**: Complete admin panel with organization, class, and user management
- **Authentication**: Role-based login system with persistent sessions
- **Architecture**: Clean separation with authentication context and protected routes

## Next Steps (Phase 3)
- Build substitute request workflow
- Add desktop notifications
- Implement request assignment and response system

## Technical Notes
- All Tauri commands are synchronous (removed async) to avoid thread safety issues
- Custom CSS properties for theming with Tailwind CSS v4
- Component structure follows shadcn/ui patterns

## Code Quality & Testing
- **Biome**: Fast formatter and linter with auto-fixing
- **Vitest**: React component testing with Testing Library
- **Playwright**: Integration testing across multiple browsers
- **Rust Testing**: Built-in cargo test for backend logic

### Available Commands
```bash
# Testing
bun test              # Run Vitest unit tests
bun test:ui           # Run Vitest with UI
bun test:coverage     # Run tests with coverage report
bun test:e2e          # Run Playwright integration tests
bun test:e2e:ui       # Run Playwright with UI
bun test:rust         # Run Rust tests (needs Cargo installed)

# Code Quality
bun format            # Format code with Biome
bun format:check      # Check formatting without changes
bun lint              # Lint code with Biome
bun lint:fix          # Auto-fix linting issues
bun check             # Run both formatting and linting
bun check:fix         # Auto-fix both formatting and linting
```