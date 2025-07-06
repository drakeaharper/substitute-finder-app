# Technical Plan: Substitute Teacher Finder App

## 1. Project Summary

Build a cross-platform app to help schools and organizations quickly find and schedule substitute teachers. The app will allow admins to post open substitute needs, notify eligible substitutes. The app will manage classes with multiple teachers assigned to each. Classes belong to organizations, which can be structured as parent and child organizations. A centralized substitute list will be maintained for assignment matching.

## 2. Target Platforms

**Primary:** Desktop (Windows, macOS, Linux) via Tauri

**Secondary (future):** Mobile via Tauri Mobile (in progress as of 2025) or wrapper like Capacitor/React Native Web

**Optional:** Web deployment (via React as SPA or hosted Tauri frontend with limited backend)

## 3. Architecture Overview

- **Frontend:** React + TypeScript (UI via Tailwind or shadcn/ui)
- **Backend (in-app):** Tauri commands in Rust for local business logic, database interaction, and OS features
- **Database:** SQLite (bundled locally with each app instance)
- **Notifications:** OS-level (desktop) notifications via Tauri APIs
- **Data Syncing (optional):** Cloud sync via external API or WebSocket (future enhancement)

## 4. Core Features

- Admin login (local password or passphrase)
- Manage organizations (with support for parent-child structure)
- Add/edit classes and assign multiple teachers to each
- Maintain a centralized substitute teacher list
- Post substitute requests for classes
- Notify available substitutes (desktop/mobile notifications or email/text in future)
- View response history and fill rates
- Exportable reports (CSV/XLS)
- Settings & backup system

## 5. Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React + TypeScript |
| UI Styling | Tailwind CSS or shadcn/ui |
| Shell | Tauri (Rust) |
| DB | SQLite (via Tauri Rust plugin) |
| Logic | Rust (business rules, DB access) |
| Packaging | Tauri for desktop builds |
| Notifications | Tauri APIs (or optional 3rd-party in future) |

## 6. Data Model (Draft)

- `organizations` (id, name, parent_organization_id)
- `classes` (id, name, organization_id)
- `teachers` (id, name, contact_info, subjects, availability)
- `teacher_class_assignments` (id, teacher_id, class_id)
- `sub_requests` (id, class_id, date, time, status)
- `notifications_log` (id, teacher_id, request_id, sent_at, status)
- `settings` (org info, notification prefs, etc.)

## 7. App Flow (Simplified)

### User Types

- **Admin:** Manages organizations, classes, and teachers; initiates substitute requests.
- **Organization Manager:** Manages classes and teachers within a specific organization (child org).
- **Substitute Teacher:** Responds to requests for substitution.

### Admin Flow

1. Admin logs in
2. Manages organizations and user permissions
3. Adds new classes or updates teacher-class assignments
4. Posts a substitute request for a class
5. System filters available substitutes based on availability and subject match
6. Notifies eligible substitutes
7. A substitute accepts → request marked filled
8. Admin reviews history, modifies settings, or exports reports

### Org Manager Flow

1. Org Manager logs in
2. Views and manages classes under their organization
3. Posts substitute requests for their classes
4. Reviews substitute response history for their org

### Substitute Flow

1. Substitute receives notification of a request
2. Opens app (or notification link)
3. Views details and accepts or declines
4. Upon acceptance, their availability is updated and request marked filled

## 8. Development Milestones

| Milestone | Timeline Estimate |
|-----------|-------------------|
| Project scaffolding (React + Tauri) | 1 week |
| DB schema + Rust commands | 1–2 weeks |
| UI for admin panel | 1–2 weeks |
| Request flow + notifications | 2 weeks |
| Packaging and testing | 1 week |
| (Optional) cloud sync/email/SMS | TBD |

## 9. Deployment Strategy

- Local installers per OS built via Tauri
- Data stored locally in SQLite (could later be encrypted)
- Optional cloud backup (Dropbox, Firebase, etc.)
- Auto-updates possible via Tauri updater (if hosted backend is added)

## 10. Agentic Coding Assistant

To ensure maintainable, secure, and high-performing code, this project can incorporate an agentic coding assistant configured with the following guidelines:

### Objectives

- Accelerate feature development with consistent and correct code
- Maintain clean architecture and SOLID principles
- Enforce performance, security, and testability standards

### Directives for the Assistant

- Follow TypeScript best practices (strict types, ESLint + Prettier enforced)
- Validate all user input at the UI and command level (using Zod or Yup)
- Minimize global state; use React Query or Zustand for controlled data handling
- Prefer async/await over callbacks or raw Promises
- Follow Rust idioms and use lifetimes and ownership semantics correctly
- Encapsulate Rust Tauri commands in modules with clear interfaces

### Libraries and Tools

| Purpose | Technology / Library |
|---------|---------------------|
| Linting & Formatting | ESLint, Prettier |
| Type Safety | TypeScript (strict mode), Zod |
| State Management | React Query, Zustand |
| Forms & Validation | React Hook Form + Zod |
| SQLite ORM (Rust) | rusqlite, sea-orm (optional) |
| Security (Rust) | ring, argon2, secrecy for password handling |
| Testing | Vitest (TS), cargo test (Rust) |
| Code Scaffolding | Plop.js (for TS), cargo-generate (Rust) |

### Coding Standards

- UI components must be accessible (ARIA roles, keyboard nav)
- No inline styles; use class-based styling only
- Rust functions must be commented with /// doc syntax
- All functions/modules must have unit tests where applicable
- CI workflow (GitHub Actions) must run lint, test, and build checks on PRs

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Tauri mobile is still WIP | Use web or React Native wrapper later |
| SQLite data loss | Add backup/export feature early |
| Local-only notifications limitations | Explore OS APIs and email fallback |
| Rust familiarity | Keep logic simple, use community crates |
