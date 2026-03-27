# Feature Spec — Fullstack SaaS Project Management Dashboard

## What This Is
A fullstack project management web app. Users sign up, confirm their email, log in, and manage projects and tasks. Each user's data is fully isolated from other users via Row Level Security. Deployed to Vercel. Public GitHub repo.

---

## Auth Flow
- Signup requires email + password
- After signup → show "check your email" page — user must click confirmation link before accessing the app
- After confirming → user can log in → lands on dashboard
- Login with unconfirmed email → show clear error ("Please confirm your email first")
- Unauthenticated users accessing any dashboard route → redirect to `/login`
- User can log out from anywhere in the app

---

## Dashboard — Projects List
- Shows all of the logged-in user's projects
- **Empty state:** If user has no projects → show a prominent "Create your first project" button with a short prompt (e.g. "You don't have any projects yet. Start one now.")
- Each project card shows: project name, task count, creation date
- Clicking a project → navigates to that project's task page
- Delete button on each project card → triggers confirmation dialog before deleting

### Project Deletion Dialog
- Message: "Are you sure you want to delete [project name]? This will permanently delete all [n] tasks."
- Two buttons: "Cancel" and "Delete" (Delete styled in red/destructive)
- On confirm → project and all its tasks are deleted (cascade)

---

## Project Page — Task List
- Shows all tasks for the selected project
- Back button/link → returns to dashboard
- **Empty state:** If project has no tasks → show "Add your first task" prompt
- Each task shows: title, priority badge (High / Medium / Low), due date, completion checkbox
- Clicking the checkbox toggles complete/incomplete
- Completed tasks visually distinct (e.g. strikethrough title, muted color)
- Delete button on each task → deletes immediately (no confirmation dialog for tasks)

---

## Task Fields
Each task has:
| Field | Type | Required |
|---|---|---|
| Title | Text | Yes |
| Description | Text (multiline) | No |
| Due date | Date picker | No |
| Priority | Select: High / Medium / Low | No (defaults to Medium) |
| Completed | Boolean toggle | No (defaults to false) |

---

## Forms & Validation
- Project name: required, max 100 characters
- Task title: required, max 200 characters
- Task description: optional, max 1000 characters
- Due date: optional, must be today or future (past dates blocked)
- Priority: optional dropdown, defaults to Medium
- All validation shown inline next to the relevant field
- Server-side validation mirrors client-side — never trust client alone

---

## RLS Isolation
- Every database query is filtered by `auth.uid() = user_id`
- User A visiting User B's project URL directly → 404 page (never shows data)
- RLS enforced at the database level — not just in application logic

---

## Empty States
| Screen | Empty State |
|---|---|
| Dashboard (no projects) | "You don't have any projects yet." + "Create your first project" button |
| Project page (no tasks) | "No tasks yet." + "Add your first task" button |

---

## Out of Scope (v1)
- Email reminders for due dates (future feature)
- Team collaboration or sharing projects
- OAuth login (Google, GitHub, etc.)
- File attachments on tasks
- Comments on tasks
- Task ordering / drag-and-drop

---

## GitHub + Deployment
- Public GitHub repo (name: `fullstack-saas-dashboard`)
- Create repo during build setup
- CodeRabbit connected to the repo for PR reviews
- Vercel deployment: set up after core app is working locally

---

## Playwright Test Environment
- All tests run against `http://localhost:3000`
- Dev server must be running before tests execute
- `playwright.config.ts` sets `baseURL: 'http://localhost:3000'`
- Two test user accounts pre-created in Supabase (credentials in `.env.local`)

---

## Acceptance Criteria
- [ ] User can sign up → receives confirmation email → confirms → can log in
- [ ] Unconfirmed user cannot log in — sees clear error
- [ ] Unauthenticated user is redirected to `/login` from any dashboard route
- [ ] Dashboard shows empty state with CTA when user has no projects
- [ ] User can create a project — appears in dashboard list
- [ ] Deleting a project shows confirmation dialog with task count
- [ ] Confirmed deletion removes project and all its tasks
- [ ] Project page shows empty state with CTA when project has no tasks
- [ ] User can create a task with title, description, due date, and priority
- [ ] Task appears in the list with priority badge and due date
- [ ] Toggling task complete updates visual state immediately
- [ ] Deleting a task removes it from the list
- [ ] User A cannot see User B's projects or tasks — verified via direct URL access
- [ ] All Playwright tests pass (auth, projects, tasks, RLS)
- [ ] Chrome DevTools screenshots taken and verified at every major UI state
- [ ] Public GitHub repo created with CodeRabbit connected
