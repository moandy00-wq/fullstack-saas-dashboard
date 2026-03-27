# Project Management SaaS Dashboard — Project Definition

## What is the end product? What does the user see and do?
A web-based project management dashboard where users sign up, log in, create projects, and manage tasks within those projects. Each user sees only their own data. The app is fully deployed and live on Vercel.

## Who is the user? What is their workflow?
Any individual who wants to track personal or professional projects and tasks.

**Workflow:**
1. User visits the app and signs up with email + password
2. User is redirected to their dashboard after signup/login
3. User creates a project (name, optional description)
4. User adds tasks to a project (title, optional details)
5. User marks tasks as complete or incomplete
6. User can delete tasks and projects
7. User logs out — their data is waiting when they return
8. A second user signing up sees none of the first user's data

## What are the core features?
- Email/password signup and login via Supabase Auth
- Protected routes — unauthenticated users cannot access the dashboard
- Create, read, update, delete (CRUD) for projects
- Create, read, update, delete (CRUD) for tasks within projects
- Toggle task completion (complete / incomplete)
- Row Level Security — users are strictly isolated from each other's data
- Clean, responsive UI using Tailwind CSS and shadcn/ui components

## What is the tech stack?
- **Frontend + Backend:** Next.js 14+ with App Router and TypeScript
- **Auth:** Supabase Auth (email/password)
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **UI:** Tailwind CSS + shadcn/ui
- **Testing:** Playwright (E2E), Chrome DevTools MCP (screenshot verification)
- **Code Review:** CodeRabbit
- **Hosting:** Vercel

## What are the acceptance criteria? How do you know it is done?
- [ ] User can sign up with email and password
- [ ] User can log in and is redirected to dashboard
- [ ] Unauthenticated user is redirected to login page
- [ ] User can create a project
- [ ] User can add tasks to a project
- [ ] User can toggle a task between complete and incomplete
- [ ] User can delete a task
- [ ] User can delete a project (and its tasks)
- [ ] User A cannot see or access User B's projects or tasks
- [ ] App is live and accessible on Vercel
- [ ] Playwright tests pass for: signup, login, CRUD, RLS isolation
- [ ] CodeRabbit review is clean (no unresolved issues)

## What are the constraints?
- **Purpose:** Learning project / portfolio piece
- **Scope:** Single user workspace only — no teams, no sharing, no collaboration
- **Auth:** Email/password only — no OAuth (Google, GitHub, etc.) in this version
- **Hosting:** Vercel only
- **Database:** Supabase only

## What are the edge cases? What could go wrong?
- User tries to sign up with an email already in use — show a clear error message
- User submits empty project or task name — validate before saving
- User tries to access another user's project via direct URL — RLS blocks it at the database level, return 404 or redirect
- User deletes a project that has tasks — cascade delete tasks automatically
- Session expires while user is on the dashboard — redirect to login
- Vercel environment variables not set — app fails silently; document all required vars clearly
