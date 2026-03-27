# CLAUDE.md — Project Management SaaS Dashboard

## Project Overview
A fullstack project management SaaS dashboard built with Next.js 14, Supabase Auth, and PostgreSQL. Users sign up, log in, and manage their own projects and tasks. Row Level Security enforces strict data isolation between users. Deployed to Vercel.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14+ | Full-stack framework (App Router + TypeScript) |
| TypeScript | 5+ | Type safety across the entire codebase |
| @supabase/supabase-js | 2+ | Core Supabase JS client |
| @supabase/ssr | Latest | Cookie-based session management for Next.js App Router (required) |
| Tailwind CSS | 3+ | Utility-first styling |
| shadcn/ui | Latest | Pre-built accessible UI components |
| Playwright | 1.40+ | End-to-end testing |
| Vercel | — | Hosting and deployment |

---

## Build Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run Playwright tests (headed)
npx playwright test

# Run Playwright tests (headless)
npx playwright test --reporter=list

# Run a single test file
npx playwright test tests/auth.spec.ts

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Code Style Rules

### TypeScript / General
- Strict TypeScript everywhere — no `any`, no type assertions unless absolutely necessary
- Use `type` for object shapes and unions; use `interface` only for things that may be extended
- All async functions must be explicitly typed with return types
- Never use `!` non-null assertion — handle null/undefined explicitly
- Use `const` by default; only use `let` when reassignment is needed
- Use named exports — avoid default exports except for Next.js pages and layouts

### Next.js App Router
- All data fetching happens in Server Components by default
- Use `"use client"` only when you need interactivity (event handlers, useState, useEffect)
- Never fetch data directly inside Client Components — pass data down as props from Server Components
- Use Next.js `cookies()` and `headers()` for server-side Supabase client
- Route handlers live in `app/api/` — keep them thin, delegate logic to `lib/` functions
- Use `redirect()` from `next/navigation` for server-side redirects

### Supabase
- Always check `error` on every Supabase call — never assume success
- Never expose the service role key to the client — it stays server-side only
- Use the anon key on the client — RLS enforces security
- All database logic lives in `lib/db/` — never write Supabase queries inline in components or routes
- RLS must be enabled on every table — no table is ever publicly readable/writable

### Tailwind + shadcn/ui
- Use shadcn/ui components first before writing custom UI
- Keep className strings readable — break long ones across lines with a `cn()` utility
- Never use inline styles — Tailwind only

### Forms
- Use controlled components for all forms
- Validate on the server — never trust client-side validation alone
- Show inline error messages next to the relevant field

---

## Architecture

### Directory Structure
```
fullstack SAAS dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Protected layout — redirects if not authed
│   │   ├── page.tsx              # Dashboard home — lists all projects
│   │   └── projects/
│   │       └── [id]/
│   │           └── page.tsx      # Single project page — lists tasks
│   ├── auth/
│   │   └── confirm/
│   │       └── route.ts          # Supabase PKCE email confirmation handler
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components (auto-generated)
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── CreateProjectForm.tsx
│   │   └── DeleteProjectButton.tsx
│   └── tasks/
│       ├── TaskList.tsx
│       ├── CreateTaskForm.tsx
│       ├── TaskItem.tsx
│       └── DeleteTaskButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (anon key)
│   │   └── server.ts             # Server Supabase client (uses cookies)
│   └── db/
│       ├── projects.ts           # All project DB queries
│       └── tasks.ts              # All task DB queries
├── types/
│   └── index.ts                  # Shared TypeScript types (Project, Task, etc.)
├── tests/
│   ├── auth.spec.ts              # Signup + login Playwright tests
│   ├── projects.spec.ts          # Project CRUD Playwright tests
│   ├── tasks.spec.ts             # Task CRUD Playwright tests
│   └── rls.spec.ts               # RLS isolation Playwright tests
├── .env.local                    # Secrets — never commit
├── .env.example                  # Template — commit this
├── middleware.ts                  # Protects dashboard routes
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Data Flow
1. User visits `/` → middleware checks session → redirect to `/login` if not authenticated
2. User logs in → Supabase Auth sets session cookie → redirect to dashboard
3. Dashboard (Server Component) → `lib/db/projects.ts` → Supabase query (RLS filters by user)
4. User creates project → Client Component form → Server Action → `lib/db/projects.ts` → insert
5. User opens project → Server Component → `lib/db/tasks.ts` → fetch tasks for that project
6. User toggles task → Client Component → Server Action → `lib/db/tasks.ts` → update

### Database Schema

**`projects` table**
```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);
alter table projects enable row level security;
create policy "Users can only access their own projects"
  on projects for all
  using ((select auth.uid()) = user_id);
```

**`tasks` table**
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  priority text default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  completed boolean default false,
  created_at timestamptz default now()
);
alter table tasks enable row level security;
create policy "Users can only access their own tasks"
  on tasks for all
  using ((select auth.uid()) = user_id);
```

---

## Testing Requirements

**Critical rule: No feature is considered done until its Playwright tests are written and passing. Tests are not optional.**

---

### Test Files and Exact Coverage Required

#### `tests/auth.spec.ts` — Signup + Login Flow
- User can sign up with a valid email and password → lands on dashboard
- Signing up with an already-used email → shows a clear error message
- Submitting signup with empty fields → shows validation error
- User can log in with correct credentials → lands on dashboard
- Login with wrong password → shows error message
- Unauthenticated user visiting `/` or any dashboard route → redirected to `/login`
- User can log out → redirected to login, session is cleared

#### `tests/projects.spec.ts` — Project CRUD
- Logged-in user can create a project with a name → project appears in dashboard list
- Creating a project with an empty name → blocked, shows validation error
- User can view a project by clicking it → navigates to project page
- User can delete a project → project is removed from the list
- Deleting a project also removes its tasks (verified by checking tasks table is empty)

#### `tests/tasks.spec.ts` — Task CRUD
- User can add a task to a project → task appears in the task list
- Adding a task with an empty title → blocked, shows validation error
- User can toggle a task to complete → visual state updates (checkbox checked, text styled)
- User can toggle a completed task back to incomplete → visual state reverts
- User can delete a task → task is removed from the list

#### `tests/rls.spec.ts` — RLS Isolation
- User A logs in, creates a project and a task
- User B logs in (different account) → cannot see User A's project in the dashboard
- User B directly visits User A's project URL (e.g. `/projects/{id}`) → gets 404 or redirect, never sees the data
- User B cannot see User A's tasks
- All checks verified at the UI level and confirmed by asserting the correct elements are absent

---

### Screenshot Verification with Chrome DevTools MCP
Use Chrome DevTools MCP to take screenshots at every meaningful UI state. Do not assume the UI looks correct — always verify visually.

**When to take screenshots:**
- After every new page or component is built — verify layout and spacing
- After login — verify dashboard renders correctly
- After creating a project — verify it appears in the list with correct styling
- After opening a project — verify task list renders
- After adding a task — verify it appears with correct styling
- After toggling a task complete — verify the visual state change (e.g. strikethrough, checkbox)
- After deleting a project or task — verify it is removed from the UI
- On mobile viewport — verify responsive layout looks correct
- After any UI change — take a before and after screenshot

**How to use Chrome DevTools MCP:**
1. Open the app in Chrome via `mcp__chrome-devtools__navigate_page`
2. Take a screenshot with `mcp__chrome-devtools__take_screenshot`
3. Inspect the screenshot — check for layout issues, misaligned elements, overflow, missing styles
4. If something looks wrong, fix it before moving on
5. Re-screenshot after the fix to confirm it is resolved

**What to check in every screenshot:**
- No elements overflowing their containers
- Text is readable and not truncated unexpectedly
- Buttons and interactive elements are clearly visible
- Forms are aligned and labels match their inputs
- Empty states show a helpful message (not a blank screen)
- Loading states are handled (no layout shift)

---

### Testing Rules
- Use two separate test user accounts for RLS tests — credentials in `.env.local` as `TEST_USER_A_EMAIL`, `TEST_USER_A_PASSWORD`, `TEST_USER_B_EMAIL`, `TEST_USER_B_PASSWORD` — never hardcode credentials in test files
- Every test must be fully independent — create its own data, clean up after itself
- Never rely on test execution order
- Run the full test suite with `npx playwright test` before marking any feature complete
- All 4 test files must pass with zero failures before the project is considered done

---

## Environment Variables

```
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only, never exposed to client

# Test accounts for Playwright RLS tests
TEST_USER_A_EMAIL=
TEST_USER_A_PASSWORD=
TEST_USER_B_EMAIL=
TEST_USER_B_PASSWORD=
```

---

## Rules Claude Must Follow

- Never write a Supabase query outside of `lib/db/projects.ts` or `lib/db/tasks.ts`
- Never use the service role key in any client-side code
- Never skip RLS — every table must have it enabled with a policy before writing queries
- Always use `(select auth.uid())` in RLS policies — never bare `auth.uid()` (performance)
- Always handle the `error` returned by Supabase — never destructure only `data`
- Never use `any` — define proper TypeScript types in `types/index.ts`
- Always use Server Actions for mutations (create, update, delete) — never call API routes from client components for CRUD
- Never use `useEffect` to fetch data — use Server Components
- Always use `supabase.auth.getUser()` on the server — never `getSession()` (security vulnerability)
- Never use `@supabase/auth-helpers-nextjs` — it is deprecated; use `@supabase/ssr` only
- Cookie handlers in server client must use only `getAll` and `setAll` — never `get`, `set`, or `remove`
- Server Action validation errors must be returned as data — never throw for expected errors
- After building any UI component or page, always take a Chrome DevTools MCP screenshot and verify it looks correct before moving on
- Middleware must protect all routes under `/(dashboard)/` — no exceptions
- When deleting a project, tasks must cascade delete via the foreign key constraint — do not manually delete tasks first
