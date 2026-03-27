# Implementation Plan — Fullstack SaaS Dashboard
Status: VALIDATED

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| `@supabase/ssr` + `@supabase/supabase-js` | Both required — `auth-helpers-nextjs` is deprecated |
| PKCE flow — callback at `app/auth/confirm/route.ts` | Correct for Next.js App Router SSR; handles `error` param before `verifyOtp()` |
| Always `getUser()`, never `getSession()` on server | `getSession()` reads cookies without revalidating — spoofable |
| Cookie handlers: `getAll`/`setAll` only | `@supabase/ssr` requirement — others throw |
| Middleware mandatory + explicit matcher | Required for token refresh; matcher must exclude static assets |
| RLS policies use `(select auth.uid())` | Evaluated once per query, not once per row — performance |
| Server Actions in `lib/actions/` | Clean layer separation: actions = auth + validation + db + cache |
| Unified `ActionResult<T>` return type | All actions return `{ data?: T, error?: string, fieldErrors?: Record<string, string> }` — never throw |
| Playwright storageState via REST API login | Not UI login — faster and not fragile |
| Playwright test data created per-test, cleaned up in afterEach | No order dependency; no stale data interference |
| GitHub setup is Phase 0 | Must exist before writing any code — version control from day one |
| Email confirmation disabled in Supabase for local dev | Playwright cannot receive real emails; re-enable for production |
| Task count via `.select('*, tasks(count)')` | Supabase embedded relation count — returns in one query |
| shadcn/ui Dialog for create forms, AlertDialog for destructive confirmations | Correct UX components |
| `loading.tsx` + `error.tsx` files at route level | Required by App Router for loading and error states |

---

## Shared Type Contracts (defined upfront — enforced in `types/index.ts`)

```ts
export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  task_count?: number    // from .select('*, tasks(count)') — tasks[0].count
}

export type Task = {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null   // ISO date string e.g. "2025-04-01"
  priority: 'High' | 'Medium' | 'Low'
  completed: boolean
  created_at: string
}

// Unified return type for ALL Server Actions — no exceptions
export type ActionResult<T = void> = {
  data?: T
  error?: string
  fieldErrors?: Record<string, string>
}
```

---

## `.env.example` (commit this; never commit `.env.local`)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Playwright test users (pre-created in Supabase Auth dashboard)
TEST_USER_A_EMAIL=
TEST_USER_A_PASSWORD=
TEST_USER_B_EMAIL=
TEST_USER_B_PASSWORD=
```

---

## Database Setup (Supabase SQL Editor)

### SQL — Run in Supabase SQL Editor (Table Editor → SQL Editor)

```sql
-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);
alter table projects enable row level security;
create policy "Users own their projects"
  on projects for all
  using ((select auth.uid()) = user_id);

-- Tasks table
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
create policy "Users own their tasks"
  on tasks for all
  using ((select auth.uid()) = user_id);
```

**Note on `user_id` foreign keys:** Both tables reference `auth.users(id) on delete cascade` — if a user is deleted from Supabase Auth, all their data is automatically removed.

**Verify:** Both tables appear in the Supabase Table Editor. Do a manual INSERT and SELECT to confirm RLS works with the anon key.

### Supabase Auth Settings
1. **Disable email confirmation** for local dev: Auth > Settings > "Confirm email" toggle OFF
   - **Important:** Re-enable this for production. Local dev only has it off for Playwright testing.
2. Add `http://localhost:3000/**` to Redirect URLs: Auth > URL Configuration > Redirect URLs
3. Update email confirmation template (for when confirmation is re-enabled):
   - Auth > Email Templates > Confirm signup
   - Change link to: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/`

### Test Users
Create two accounts manually in Supabase Auth dashboard (Authentication > Users > Add user):
- `test-user-a@example.com` + password
- `test-user-b@example.com` + password

Add credentials to `.env.local`.

---

## Implementation Steps

### Phase 0 — GitHub Setup (do before writing any code)
1. Create public repo `fullstack-saas-dashboard` on GitHub
2. Clone to local: `git clone <url> "fullstack SAAS dashboard"`
3. Create `.gitignore`:
   ```
   .env.local
   playwright/.auth/
   ```
4. Initial empty commit and push

**Verifiable outcome:** Repo exists on GitHub. Local folder is a git repo with remote set.

---

### Phase 1 — Project Scaffold

**Step 1.1 — Create Next.js app**
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Step 1.2 — Install Supabase packages**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 1.3 — Install shadcn/ui and required components**
```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea label card badge dialog alert-dialog select checkbox form
```

**Step 1.4 — Install Playwright**
```bash
npm init playwright@latest
```
Choose: TypeScript, `tests/` folder.

**Step 1.5 — Create `.env.local` and `.env.example`**
Fill in all values from Supabase project settings.

**Step 1.6 — Commit**
```bash
git add . && git commit -m "chore: scaffold Next.js app with Supabase, shadcn, Playwright"
```

**Verifiable outcome:** `npm run dev` starts without errors and loads default Next.js page at `http://localhost:3000`.

---

### Phase 2 — Foundation Code

**Step 2.1 — `lib/supabase/client.ts`** (browser only — use in `'use client'` components)
```ts
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**Step 2.2 — `lib/supabase/server.ts`** (server only — use in Server Components and Actions)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {
            // Server Components cannot set cookies — safe to ignore here
            // Middleware handles the actual cookie refresh
          }
        }
      }
    }
  )
}
```

**Step 2.3 — `middleware.ts`** (root level — exact implementation)
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Must create a new response to carry refreshed cookies
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // Write cookies to both request and response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        }
      }
    }
  )

  // MUST use getUser() — not getSession() — to validate the JWT with auth server
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')
  const isProtectedRoute = request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/projects')

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Always return supabaseResponse — it carries the refreshed cookies
  return supabaseResponse
}

export const config = {
  matcher: [
    // Exclude static files, images, favicon — only run on real routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 2.4 — `types/index.ts`**
Define `Project`, `Task`, and `ActionResult<T>` types (see Shared Type Contracts above).

**Step 2.5 — `app/(dashboard)/loading.tsx`** and **`app/(dashboard)/error.tsx`**
- `loading.tsx`: Simple skeleton or spinner — shown while Server Components are loading
- `error.tsx`: Client Component with "Something went wrong" message and retry button

**Verifiable outcome:** `npx tsc --noEmit` passes. Middleware redirects unauthenticated requests to `/login`.

---

### Phase 3 — Database Query Layer (3a and 3b can be built in parallel after Phase 2 is complete)

#### Step 3a — `lib/db/projects.ts`

```
getProjects(userId: string): Promise<Project[]>
  supabase.from('projects')
    .select('*, tasks(count)')    ← embedded relation count
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  Map result: project.task_count = project.tasks[0].count ?? 0
  Return [] on error (log error, do not surface to UI)

getProject(projectId: string): Promise<Project | null>
  supabase.from('projects')
    .select('*')
    .eq('id', projectId)
    .single()
  Return null if error (RLS will return empty, not a real error)

createProject(input: { user_id, name, description? }): Promise<ActionResult>
  supabase.from('projects').insert(input)
  Return { error: 'Failed to create project' } on Supabase error

deleteProject(projectId: string, userId: string): Promise<ActionResult>
  supabase.from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)    ← defense in depth on top of RLS
  Return { error: 'Failed to delete project' } on Supabase error
```

#### Step 3b — `lib/db/tasks.ts`

```
getTasks(projectId: string): Promise<Task[]>
  supabase.from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  Return [] on error

createTask(input: { project_id, user_id, title, description?, due_date?, priority? }): Promise<ActionResult>
  supabase.from('tasks').insert(input)

updateTask(taskId: string, userId: string, updates: Partial<Task>): Promise<ActionResult>
  supabase.from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', userId)

deleteTask(taskId: string, userId: string): Promise<ActionResult>
  supabase.from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)
```

All functions: catch Supabase errors, log them (not expose to client), return `ActionResult` with user-friendly message.

**Verifiable outcome:** Each function can be called in isolation and returns the correct `ActionResult` or data shape.

---

### Phase 4 — Server Actions

All files: `'use server'` at top. Every action calls `supabase.auth.getUser()` — never trust the client. All actions return `ActionResult<T>` — never throw.

**`lib/actions/auth.ts`**
```
signUpAction(formData: FormData): Promise<ActionResult>
  Validate: email required, password min 8 chars
  supabase.auth.signUp({ email, password, options: { emailRedirectTo: '...' } })
  On success → redirect('/auth/check-email')
  On error → return { error: error.message }

signInAction(formData: FormData): Promise<ActionResult>
  supabase.auth.signInWithPassword({ email, password })
  On success → redirect('/')
  On error → return { error: 'Invalid email or password' }

signOutAction(): Promise<void>
  supabase.auth.signOut()
  redirect('/login')
```

**`lib/actions/projects.ts`**
```
createProjectAction(formData: FormData): Promise<ActionResult>
  Validate: name required (return fieldErrors.name), max 100 chars
  getUser() → userId
  createProject({ user_id: userId, name, description })
  revalidatePath('/')
  return {}

deleteProjectAction(projectId: string): Promise<ActionResult>
  getUser() → userId
  deleteProject(projectId, userId)
  revalidatePath('/')
  return {}
```

**`lib/actions/tasks.ts`**
```
createTaskAction(formData: FormData): Promise<ActionResult>
  Validate: title required, max 200 chars; due_date >= today if provided
  getUser() → userId
  createTask({ project_id, user_id: userId, title, description, due_date, priority })
  revalidatePath('/projects/[id]')
  return {}

toggleCompleteAction(taskId: string, completed: boolean): Promise<ActionResult>
  getUser() → userId
  updateTask(taskId, userId, { completed })
  revalidatePath('/projects/[id]')
  return {}

deleteTaskAction(taskId: string): Promise<ActionResult>
  getUser() → userId
  deleteTask(taskId, userId)
  revalidatePath('/projects/[id]')
  return {}
```

**Verifiable outcome:** TypeScript compiles. Each action returns `ActionResult`. `revalidatePath` triggers re-render.

---

### Phase 5 — Auth Pages

**`app/(auth)/signup/page.tsx`**
- `useActionState(signUpAction, {})` for error/fieldErrors state
- Email input, password input
- `useFormStatus` for submit button pending state
- Show `fieldErrors.email` / `fieldErrors.password` inline
- Link to `/login`
- **Screenshot:** Chrome DevTools screenshot of signup page

**`app/(auth)/login/page.tsx`**
- Same pattern as signup
- Show `error` message below form on wrong credentials
- Link to `/signup`
- **Screenshot:** Chrome DevTools screenshot of login page

**`app/auth/check-email/page.tsx`**
- Static page: "Check your email — click the link we sent to confirm your account."

**`app/auth/confirm/route.ts`** — PKCE callback
```ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  // Always check for error params first
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?message=${encodeURIComponent(error_description ?? error)}`, request.url)
    )
  }

  if (token_hash && type) {
    const supabase = await createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash
    })
    if (!verifyError) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/auth/error', request.url))
}
```

**`app/auth/error/page.tsx`**
- Reads `message` query param
- Shows: "Something went wrong. [message]. Please try signing up again."

**Verifiable outcome:** Login form with correct credentials redirects to `/`. Wrong credentials shows error. Unauthenticated visit to `/` redirects to `/login`.

---

### Phase 6 — Dashboard (Projects List)

**`app/(dashboard)/layout.tsx`**
- Server Component
- `supabase.auth.getUser()` — if no user → `redirect('/login')`
- Renders nav: app name, user email, logout button (calls `signOutAction`)
- Wraps `{children}`

**`app/(dashboard)/page.tsx`**
- Server Component
- Calls `getProjects(user.id)`
- If empty → renders `<ProjectsEmptyState />`
- If not empty → renders grid of `<ProjectCard>` + "New Project" button

**`components/projects/ProjectsEmptyState.tsx`**
- shadcn Card: "You don't have any projects yet."
- shadcn Button: "Create your first project" → opens `CreateProjectDialog`

**`components/projects/ProjectCard.tsx`**
- shadcn Card (full card is a `<Link href="/projects/[id]">`)
- Shows: name, description (truncated to 2 lines), task count badge, formatted created date
- Delete button (top-right corner) → opens `DeleteProjectDialog`
- Does NOT navigate when delete button is clicked (stopPropagation)

**`components/projects/CreateProjectDialog.tsx`**
- shadcn Dialog
- Form fields: name (required), description (optional Textarea)
- `useActionState(createProjectAction, {})`
- Shows fieldErrors.name inline
- Closes on success via `useEffect` watching state

**`components/projects/DeleteProjectDialog.tsx`**
- shadcn AlertDialog
- Props: `projectId`, `projectName`, `taskCount`
- Message: `"Delete "${projectName}"? This will permanently delete ${taskCount} task(s)."`
- Cancel + Delete (red) buttons
- On confirm → `deleteProjectAction(projectId)`

**`app/(dashboard)/loading.tsx`** — skeleton cards grid
**`app/(dashboard)/error.tsx`** — "Failed to load projects. Try refreshing."

**Chrome DevTools screenshots after Phase 6:**
1. Empty dashboard state
2. Dashboard with 2-3 project cards
3. Create project dialog open
4. Delete confirmation dialog open

**Verifiable outcome:** Dashboard loads, shows empty state, create project adds a card, delete confirmation appears, confirmed delete removes card.

---

### Phase 7 — Project Page (Tasks)

**`app/(dashboard)/projects/[id]/page.tsx`**
- Server Component
- `getProject(params.id)` → if null → `notFound()` (covers RLS block = 404)
- `getTasks(params.id)`
- Renders: back link to `/`, project name, task count, `<CreateTaskForm>`, `<TaskList>` or empty state

**`components/tasks/TasksEmptyState.tsx`**
- "No tasks yet."
- Button or inline prompt to add first task

**`components/tasks/CreateTaskForm.tsx`**
- Inline form (not a dialog — simpler for tasks)
- Fields:
  - title: Input (required)
  - description: Textarea (optional, collapsible)
  - due_date: `<input type="date" min={today}>` (blocks past dates at browser level; server also validates)
  - priority: shadcn Select — High / Medium / Low (default: Medium)
- `useActionState(createTaskAction, {})`
- Inline field errors

**`components/tasks/TaskList.tsx`**
- Maps tasks → `<TaskItem>` for each
- Separates completed tasks below incomplete ones (two sections)

**`components/tasks/TaskItem.tsx`**
- shadcn Checkbox: clicking calls `toggleCompleteAction(task.id, !task.completed)`
- Title: `line-through text-muted-foreground` when completed
- shadcn Badge for priority:
  - High → `variant="destructive"` (red)
  - Medium → `variant="secondary"` (gray)
  - Low → `variant="outline"` (outlined)
- Due date: formatted string; `text-red-500` if `due_date < today` and not completed
- Delete button (icon): calls `deleteTaskAction(task.id)` immediately

**`app/(dashboard)/projects/[id]/loading.tsx`** — task list skeleton
**`app/(dashboard)/projects/[id]/error.tsx`** — "Failed to load tasks."

**Chrome DevTools screenshots after Phase 7:**
1. Project page empty state
2. Project page with multiple tasks (mixed priorities)
3. Task with completed state (strikethrough)
4. Due date in red (past due)
5. Mobile viewport of task list

**Verifiable outcome:** Project page loads, tasks create/toggle/delete correctly, 404 on unknown project ID.

---

### Phase 8 — Playwright Tests

**`playwright.config.ts`**
```ts
{
  testDir: './tests',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user-a.json'  // default to User A
      },
      dependencies: ['setup']
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
}
```

**`playwright/auth.setup.ts`** (runs once before all tests)
- Log in User A via Supabase JS client `signInWithPassword` → save cookies → `context.storageState({ path: 'playwright/.auth/user-a.json' })`
- Log in User B → save to `playwright/.auth/user-b.json`
- Add `playwright/.auth/` to `.gitignore`

**Test data lifecycle (critical — prevents flaky tests):**
- Each test that creates data uses `beforeEach` to create a fresh project/task
- Each test uses `afterEach` to delete created data using Supabase service role client (bypasses RLS)
- Never rely on data existing from a previous test

**`tests/auth.spec.ts`**
- Unauthenticated user visiting `/` → redirected to `/login`
- Login with correct credentials → lands on `/`
- Login with wrong password → shows error message
- Login with empty fields → shows validation errors
- Logout → redirected to `/login`
- Signup form submits with valid data → shows check-email page
- Signup with empty email → shows validation error

**`tests/projects.spec.ts`**
- Create project with name → appears in project list
- Create project with empty name → validation error, not submitted
- Click project card → navigates to `/projects/[id]`
- Delete project → confirmation dialog appears with correct message
- Confirm delete → project removed from list

**`tests/tasks.spec.ts`**
- Add task with title → appears in task list with correct priority badge
- Add task with empty title → validation error
- Toggle task complete → strikethrough appears on task title
- Toggle completed task back to incomplete → strikethrough removed
- Delete task → removed from list immediately

**`tests/rls.spec.ts`**
- Uses two browser contexts: User A (`user-a.json`) and User B (`user-b.json`)
- User A creates a project (get the project ID)
- New context for User B: visit `/` → User A's project name NOT in the page
- User B navigates directly to `/projects/[User A's project ID]` → page shows 404 (not the project)
- Note: This test verifies the UI layer enforces RLS. The database-level guarantee is validated by the RLS policy SQL, which should be verified manually in Supabase dashboard.

**Verifiable outcome:** `npx playwright test` — all tests pass with zero failures.

---

### Phase 9 — CodeRabbit + Vercel

**CodeRabbit:**
1. Go to `coderabbit.ai` → sign in with GitHub → add `fullstack-saas-dashboard` repo
2. Create a branch, make a small change, open a PR — verify CodeRabbit posts a review

**Vercel (defer until local is fully working):**
1. Push all code to GitHub
2. Go to `vercel.com` → New Project → import from GitHub
3. Set all environment variables from `.env.local`
4. Deploy — verify the live URL works end to end
5. Set the production URL as the Supabase Site URL and redirect URL

**Verifiable outcome:** CodeRabbit reviews PRs. App loads on Vercel URL.

---

## Parallelization Map

```
Phase 0 (GitHub setup)
         ↓
Phase 1 (Scaffold) ─────────── Supabase Setup (tables + auth config + test users)
         └──────────────────────────────┘
                        ↓
              Phase 2 (Foundation code — all 5 files)
              client.ts, server.ts, middleware.ts, types/index.ts, loading/error
                        ↓
         ┌──────────────┴──────────────┐
     Phase 3a                      Phase 3b
  lib/db/projects.ts            lib/db/tasks.ts
         └──────────────┬──────────────┘
                        ↓
              Phase 4 (Server Actions)
              auth.ts, projects.ts, tasks.ts
                        ↓
              Phase 5 (Auth pages + confirm route)
                        ↓
              Phase 6 (Dashboard + project components)
                        ↓
              Phase 7 (Project page + task components)
                        ↓
              Phase 8 (Playwright tests)
                        ↓
              Phase 9 (CodeRabbit + Vercel)
```

---

## Acceptance Criteria (every item is testable)

**Auth**
- [ ] Visiting `/` without a session → browser URL changes to `/login`
- [ ] Submitting login form with correct credentials → browser URL changes to `/`
- [ ] Submitting login form with wrong password → error message visible on page
- [ ] Clicking logout button → browser URL changes to `/login`; visiting `/` again redirects to `/login`

**Projects**
- [ ] Dashboard with no projects → "You don't have any projects yet" text visible
- [ ] Creating a project with name "Test Project" → card with text "Test Project" appears in grid
- [ ] Creating a project with empty name → form does not submit; error message visible
- [ ] Clicking a project card → browser URL changes to `/projects/[id]`
- [ ] Clicking delete on a project → AlertDialog with project name visible
- [ ] Confirming delete → project card removed from grid

**Tasks**
- [ ] Project page with no tasks → "No tasks yet" text visible
- [ ] Creating a task with title → task item visible in list with correct title
- [ ] Creating a task with priority "High" → red badge with "High" visible on task
- [ ] Creating a task with past due date → server returns validation error
- [ ] Clicking task checkbox → title gains strikethrough styling
- [ ] Clicking task checkbox again → strikethrough removed
- [ ] Clicking task delete → task item removed from list

**RLS**
- [ ] User A creates project with unique name → User B logs in → User A's project name NOT visible in User B's dashboard
- [ ] User B navigates to `/projects/[User A's project ID]` → page shows 404, not project content

**Quality**
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npx playwright test` passes with zero failures
- [ ] Chrome DevTools screenshots taken at all 9 checkpoints show correct UI

---

## Edge Cases & Handling

| Edge Case | Handling |
|---|---|
| Signup with existing email | Supabase error → show "An account with this email already exists" |
| Login before email confirmation | Supabase error → show "Please confirm your email before logging in" (when confirmation is on) |
| Empty project/task name | Server Action returns `fieldErrors` → inline error, form not submitted |
| Due date in the past | Server Action validates `new Date(due_date) >= today` → `fieldErrors.due_date` |
| User accesses `/projects/[other-user-id]` | `getProject()` returns null (RLS blocks) → `notFound()` → Next.js 404 page |
| Deleting project with 0 tasks | Dialog shows "0 task(s)" — still shows confirmation |
| Session expires mid-session | Middleware refreshes on every request; if truly expired → redirect to `/login` |
| `verifyOtp()` receives expired/used token | Confirm route checks for `error` query param first; redirects to `/auth/error` with message |
| Project card delete button inside link | `e.stopPropagation()` on delete button — card link does not fire |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Email confirmation blocks Playwright tests | Disabled for local dev; documented to re-enable for production |
| `@supabase/auth-helpers-nextjs` accidentally used | Hard rule in CLAUDE.md; only `@supabase/ssr` is installed |
| Wrong cookie handlers crash the app | Strict: only `getAll`/`setAll` — documented in CLAUDE.md |
| Stale test data makes RLS tests pass for wrong reason | Each test creates and cleans up its own data via `beforeEach`/`afterEach` with service role key |
| Task count renders as undefined | Explicit mapping: `tasks[0].count ?? 0` when using embedded relation count |
| shadcn React 19 peer dep issue | Stay on Next.js 14 (React 18) — do not upgrade to Next.js 15 |
| Middleware runs on static assets | Matcher explicitly excludes `_next/static`, `_next/image`, images |

---

## Validation Notes (Phase 5 — Context7 MCP, 2026-03-26)

All referenced libraries verified against current docs:

| Library | Finding | Status |
|---|---|---|
| `@supabase/ssr` `createServerClient` | `getAll`/`setAll` pattern confirmed correct. `createBrowserClient` for client. | ✅ Confirmed |
| `@supabase/ssr` middleware | Exact pattern matches plan: `getAll` from request, `setAll` updates both request and response | ✅ Confirmed |
| Next.js `useActionState` | From `react` (not `react-dom`). Action signature: `action(initialState, formData)` | ✅ Confirmed |
| Next.js `redirect` | Must call `revalidatePath` BEFORE `redirect` — redirect throws an exception that stops execution | ✅ Confirmed (note applied) |
| Next.js Server Actions | `'use server'` directive, `redirect` from `next/navigation` | ✅ Confirmed |
| Playwright `storageState` | `globalSetup` + `storageState` path in config — confirmed pattern | ✅ Confirmed |

**One corrective note applied:** In Server Actions that redirect after mutation (e.g., post-login), `revalidatePath` must come before `redirect`. The actions in this plan return data (not redirect), so this is already handled correctly.
