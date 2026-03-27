# Execution Plan — Fullstack SaaS Dashboard
Status: AWAITING USER APPROVAL

---

## Resolved Contradictions (Team Manager)

| Topic | Previous Plan (wrong) | This Plan (correct) | Source |
|---|---|---|---|
| Form state hook | `useActionState` from `react` | `useFormState` from `react-dom` | Next.js 14 = React 18; `useActionState` is React 19+ only |
| `useFormStatus` placement | Same component as form | SEPARATE child component (`<SubmitButton>`) | React 18 rules: only works in children of `<form>` |
| `cookies()` in server.ts | `async createClient` + `await cookies()` | Synchronous — no `async`, no `await` | Next.js 14 `cookies()` is synchronous |
| Sidebar component | Not specified | Custom `Sidebar.tsx` — do NOT use shadcn Sidebar | shadcn Sidebar has SSR hydration crash bug (#5925) |
| Trigger components | Not mentioned | `DialogTrigger asChild`, `AlertDialogTrigger asChild` | Prevents nested `<button>` hydration error |
| RLS null handling | Implicit | `notFound()` must be called explicitly when `getProject()` returns `null` | Supabase RLS returns `null` silently, not a 404 |
| Sub-Planner 3 TS-11 (error) | Said `useActionState` from `react` | Corrected: `useFormState` from `react-dom` | Contradicted research; research wins |

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| Dark theme: slate-950 bg, slate-900 sidebar, slate-800 cards | Premium SaaS aesthetic — Linear/Vercel style |
| Indigo/violet accent colors | Trust, modernity; pairs well with slate |
| `bg-color/15` badge pattern | Subtle pill badges used by Linear, Notion, GitHub |
| Gradient progress bars | `from-indigo-500 to-violet-500` — adds depth |
| Card hover: `-translate-y-1 + shadow-xl + border shift` | Micro-interaction that makes cards feel interactive |
| `transition-all duration-150` on every interactive element | Baseline for "premium feel" |
| Custom sidebar (not shadcn Sidebar) | shadcn Sidebar component has SSR crash; custom is trivial |
| `useFormState` from `react-dom` | Next.js 14 / React 18 — `useActionState` does not exist |
| `SubmitButton` as a separate child component | `useFormStatus` only works in children of `<form>` |
| `cookies()` synchronous in `createClient` | Next.js 14 only — change to `await` if upgrading to Next.js 15 |
| `notFound()` explicitly on null project | RLS + not-found treated identically — no info leakage |
| `export const dynamic = 'force-dynamic'` on dashboard pages | Prevents Next.js caching stale auth data |
| `(select auth.uid())` in RLS policies | Evaluated once per query, not once per row |
| `revalidatePath` before `redirect` | `redirect` throws — anything after it doesn't run |
| Service role only in Playwright cleanup | Never client-side; `persistSession: false` |
| shadcn `asChild` on all trigger components | Prevents nested `<button>` hydration errors |

---

## Shared Type Contracts (`types/index.ts`)

```ts
export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  task_count?: number  // from .select('*, tasks(count)') → tasks[0]?.count ?? 0
}

export type Task = {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null   // ISO: "2025-04-01"
  priority: 'High' | 'Medium' | 'Low'
  completed: boolean
  created_at: string
}

export type ActionResult<T = void> = {
  data?: T
  error?: string
  fieldErrors?: Record<string, string>
}
```

---

## Complete File Tree (56 files)

```
fullstack SAAS dashboard/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Centered auth shell, indigo glow bg
│   │   ├── login/page.tsx          # Login form — useFormState + signInAction
│   │   └── signup/page.tsx         # Signup form — useFormState + signUpAction
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Auth guard + DashboardShell
│   │   ├── loading.tsx             # Skeleton grid
│   │   ├── error.tsx               # Error boundary (Client Component)
│   │   ├── page.tsx                # Projects list (Server Component)
│   │   └── projects/[id]/
│   │       ├── page.tsx            # Project detail — notFound() if null
│   │       ├── loading.tsx         # Task skeleton
│   │       ├── error.tsx           # Error boundary
│   │       └── not-found.tsx       # 404 page for RLS-blocked access
│   ├── auth/
│   │   ├── confirm/route.ts        # PKCE email confirm handler
│   │   ├── check-email/page.tsx    # "Check your email" static page
│   │   └── error/page.tsx          # Auth error — reads ?message= param
│   ├── layout.tsx                  # Root: html dark, body bg-slate-950
│   └── globals.css                 # Tailwind + CSS vars dark theme
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Custom sidebar — nav + user section + logout
│   │   ├── SidebarLink.tsx         # Active-aware nav link (usePathname)
│   │   ├── Header.tsx              # Page title + actions slot
│   │   └── DashboardShell.tsx      # Sidebar + main content composer
│   ├── projects/
│   │   ├── ProjectCard.tsx         # Card with hover effects, delete trigger
│   │   ├── ProjectsGrid.tsx        # Maps projects → ProjectCard + empty state
│   │   ├── ProjectsEmptyState.tsx  # Glow icon + headline + CTA
│   │   ├── CreateProjectDialog.tsx # Dialog with asChild trigger
│   │   ├── CreateProjectForm.tsx   # useFormState form (inner)
│   │   └── DeleteProjectDialog.tsx # AlertDialog with asChild trigger
│   ├── tasks/
│   │   ├── TaskList.tsx            # Splits incomplete/completed sections
│   │   ├── TaskItem.tsx            # Checkbox + title + badge + due date + delete
│   │   ├── TasksEmptyState.tsx     # "No tasks yet" empty state
│   │   ├── CreateTaskForm.tsx      # All 5 task fields + useFormState
│   │   └── DeleteTaskButton.tsx    # Icon button — no confirm dialog
│   ├── shared/
│   │   └── SubmitButton.tsx        # useFormStatus child — pending spinner
│   └── ui/                         # shadcn auto-generated (13 components)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient (anon key)
│   │   └── server.ts               # createServerClient (sync cookies, no await)
│   ├── db/
│   │   ├── projects.ts             # getProjects, getProject, createProject, deleteProject
│   │   └── tasks.ts                # getTasks, createTask, updateTask, deleteTask
│   └── actions/
│       ├── auth.ts                 # signUpAction, signInAction, signOutAction
│       ├── projects.ts             # createProjectAction, deleteProjectAction
│       └── tasks.ts                # createTaskAction, toggleCompleteAction, deleteTaskAction
├── types/index.ts
├── tests/
│   ├── auth.spec.ts
│   ├── projects.spec.ts
│   ├── tasks.spec.ts
│   └── rls.spec.ts
├── playwright/
│   ├── user-a.setup.ts
│   ├── user-b.setup.ts
│   └── .auth/                      # gitignored
├── middleware.ts                   # Token refresh + route protection
├── playwright.config.ts
├── .env.local                      # Never commit
├── .env.example                    # Commit this
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## UI Design Spec

### Color System
```
Page background:     bg-slate-950 (#020617)
Sidebar background:  bg-slate-900 (#0f172a)
Card background:     bg-slate-800/50 (semi-transparent)
Border default:      border-slate-700/50
Border hover:        border-slate-700
Text primary:        text-slate-100
Text secondary:      text-slate-400
Text muted:          text-slate-500
Accent primary:      indigo-500 (#6366f1)
Accent secondary:    violet-500 (#8b5cf6)
```

### Priority Badge Pattern
```
High:   bg-red-500/15    text-red-400    border border-red-500/20    rounded-full
Medium: bg-amber-500/15  text-amber-400  border border-amber-500/20  rounded-full
Low:    bg-slate-500/15  text-slate-400  border border-slate-500/20  rounded-full
```

### Card Hover Pattern
```
hover:-translate-y-1
hover:shadow-xl hover:shadow-black/20
hover:border-slate-700
transition-all duration-200
```

### Button Variants
```
Primary:     bg-indigo-600 hover:bg-indigo-500 text-white
Destructive: bg-red-600 hover:bg-red-500 text-white
Ghost:       hover:bg-slate-800 text-slate-400 hover:text-slate-100
```

### Sidebar Nav Active State
```
Active:   bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500
Inactive: text-slate-400 hover:text-white hover:bg-slate-800/50
```

### Empty State Pattern
```
Glow ring icon:  rounded-full bg-slate-800 border border-slate-700 p-5
                 + absolute blur ring: bg-indigo-500/20 blur-xl
Headline:        text-xl font-semibold text-white
Subtext:         text-slate-400
CTA button:      bg-indigo-600 hover:bg-indigo-500
```

---

## Phase 0 — GitHub Setup

**Steps:**
1. Create public repo `fullstack-saas-dashboard` on GitHub
2. Clone to `"fullstack SAAS dashboard"` directory
3. Create `.gitignore` immediately (`.env.local`, `playwright/.auth/`, `node_modules/`, `.next/`)
4. Initial commit and push

**Verifiable:** Repo visible on GitHub, `.gitignore` committed

---

## Phase 1 — Scaffold + Supabase

**Scaffold:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npm install @supabase/supabase-js @supabase/ssr
npx shadcn@latest init   # style=Default, color=Slate, CSS vars=Yes
npx shadcn@latest add button input textarea label card badge dialog alert-dialog select checkbox separator tooltip scroll-area
npm init playwright@latest
```

**Supabase SQL (run in SQL Editor):**
```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);
alter table projects enable row level security;
create policy "Users own their projects"
  on projects for all using ((select auth.uid()) = user_id);

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
  on tasks for all using ((select auth.uid()) = user_id);

-- Performance indexes
create index projects_user_id_idx on projects(user_id);
create index tasks_user_id_idx on tasks(user_id);
create index tasks_project_id_idx on tasks(project_id);
```

**Supabase Auth Config:**
- Email confirmation: OFF (local dev) — re-enable before Vercel deploy
- Redirect URLs: `http://localhost:3000/**`
- Email template confirm link: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/`
- Create User A and User B manually in Auth → Users

**`.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TEST_USER_A_EMAIL=
TEST_USER_A_PASSWORD=
TEST_USER_B_EMAIL=
TEST_USER_B_PASSWORD=
```

**Screenshot checkpoint:** `http://localhost:3000` — default Next.js page loads

---

## Phase 2 — Foundation (all 7 files parallel)

**`lib/supabase/client.ts`** — `createBrowserClient` only
**`lib/supabase/server.ts`** — CRITICAL: `cookies()` is synchronous, `createClient` is NOT async
**`middleware.ts`** — `getUser()` (not `getSession()`), protects `/` and `/projects/*`
**`types/index.ts`** — `Project`, `Task`, `ActionResult<T>`
**`app/globals.css`** — Dark theme CSS variables
**`tailwind.config.ts`** — `darkMode: 'class'`
**`app/layout.tsx`** — `<html className="dark">`, `bg-slate-950`

**Verifiable:** `npx tsc --noEmit` passes. Visit `/` → redirects to `/login`.

---

## Phase 3 — DB Query Layer (3a + 3b parallel)

**`lib/db/projects.ts`:**
- `getProjects(userId)` → `.select('*, tasks(count)')` → map `tasks[0]?.count ?? 0`
- `getProject(id)` → `.single()` → returns `null` on error or RLS block
- `createProject(input)` → returns `ActionResult`
- `deleteProject(id, userId)` → `.eq('user_id', userId)` defense-in-depth

**`lib/db/tasks.ts`:**
- `getTasks(projectId)` → ordered by `created_at desc`
- `createTask(input)` → returns `ActionResult`
- `updateTask(id, userId, updates)` → returns `ActionResult`
- `deleteTask(id, userId)` → `.eq('user_id', userId)` defense-in-depth

**Verifiable:** `npx tsc --noEmit` passes. No Supabase imports outside `lib/`.

---

## Phase 4 — Server Actions (all 3 parallel)

**`lib/actions/auth.ts`:**
- `signUpAction(prevState, formData)` — validates, `signUp()`, `redirect('/auth/check-email')`
- `signInAction(prevState, formData)` — `signInWithPassword()`, `redirect('/')` on success
- `signOutAction()` — `signOut()`, `redirect('/login')`

**`lib/actions/projects.ts`:**
- `createProjectAction(prevState, formData)` — validate name, getUser, createProject, `revalidatePath('/')`
- `deleteProjectAction(projectId)` — getUser, deleteProject, `revalidatePath('/')`

**`lib/actions/tasks.ts`:**
- `createTaskAction(prevState, formData)` — validate title + due_date, createTask, `revalidatePath`
- `toggleCompleteAction(taskId, completed)` — updateTask, `revalidatePath`
- `deleteTaskAction(taskId, projectId)` — deleteTask, `revalidatePath`

**Rules:**
- All start with `'use server'`
- All call `supabase.auth.getUser()` — never use client-provided userId
- `redirect()` is NEVER inside try/catch — it throws internally
- `revalidatePath` BEFORE `redirect` (if both used)

---

## Phase 5 — Auth Pages

**`components/shared/SubmitButton.tsx`** — FIRST (other components depend on it):
```tsx
'use client'
import { useFormStatus } from 'react-dom'  // NOT from react
export function SubmitButton({ label, pendingLabel = 'Loading...' }) {
  const { pending } = useFormStatus()
  return <Button type="submit" disabled={pending}>{pending ? pendingLabel : label}</Button>
}
```

**Then in parallel:**
- `app/(auth)/layout.tsx` — centered, indigo glow orb background
- `app/(auth)/login/page.tsx` — `useFormState` from `react-dom`, shadcn Card
- `app/(auth)/signup/page.tsx` — same pattern, field-level errors
- `app/auth/confirm/route.ts` — check `error` param FIRST, then `verifyOtp()`
- `app/auth/check-email/page.tsx` — static "check your inbox"
- `app/auth/error/page.tsx` — reads `searchParams.message`

**Screenshot checkpoints:**
1. `/login` — form centered, dark card, inputs visible
2. Wrong credentials → error message visible
3. `/signup` — form renders

---

## Phase 6 — Dashboard (layout first, then all parallel)

**`app/(dashboard)/layout.tsx`** — FIRST:
- `createClient()` (sync), `getUser()`, `redirect('/login')` if no user
- Renders `<DashboardShell userEmail={user.email}>{children}</DashboardShell>`
- `export const dynamic = 'force-dynamic'`

**Then in parallel:**
- `components/layout/Sidebar.tsx` — custom, `bg-slate-900`, nav links, logout form
- `components/layout/SidebarLink.tsx` — `usePathname()` active detection
- `components/layout/Header.tsx` — page title + actions slot
- `components/layout/DashboardShell.tsx` — flex layout composer
- `app/(dashboard)/page.tsx` — `getProjects()`, `<ProjectsGrid>` or `<ProjectsEmptyState>`
- `components/projects/ProjectCard.tsx` — hover effects, delete trigger, `e.stopPropagation()`
- `components/projects/ProjectsGrid.tsx` — `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- `components/projects/ProjectsEmptyState.tsx` — glow icon, CTA
- `components/projects/CreateProjectDialog.tsx` — `DialogTrigger asChild`
- `components/projects/CreateProjectForm.tsx` — `useFormState` from `react-dom`
- `components/projects/DeleteProjectDialog.tsx` — `AlertDialogTrigger asChild`, red confirm
- `app/(dashboard)/loading.tsx` + `error.tsx`

**Screenshot checkpoints:**
1. Dashboard empty state — "no projects" message, CTA visible
2. Create project dialog open — form fields aligned
3. After creating project — card appears with name + "0 tasks"
4. Delete confirmation dialog — project name + task count shown
5. After confirming delete — card removed
6. Mobile 375px — responsive layout

---

## Phase 7 — Project Page + Tasks (page.tsx first, then all parallel)

**`app/(dashboard)/projects/[id]/page.tsx`** — FIRST:
```ts
const project = await getProject(params.id)
if (!project) notFound()  // explicit — RLS null = 404
```
- `export const dynamic = 'force-dynamic'`

**Then in parallel:**
- `components/tasks/CreateTaskForm.tsx` — all 5 fields, `min` date attr, `useFormState`
- `components/tasks/TaskList.tsx` — two sections: "In Progress" + "Completed"
- `components/tasks/TaskItem.tsx` — checkbox, `line-through` on complete, priority badge, due date color
- `components/tasks/TasksEmptyState.tsx` — "No tasks yet" empty state
- `components/tasks/DeleteTaskButton.tsx` — icon button, no confirm dialog
- `app/(dashboard)/projects/[id]/loading.tsx` + `error.tsx` + `not-found.tsx`

**Priority badge rendering:**
```tsx
const PRIORITY_CLASSES = {
  High:   'bg-red-500/15 text-red-400 border border-red-500/20',
  Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Low:    'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}
```

**Due date color logic:**
```ts
const isOverdue = task.due_date < new Date().toISOString().split('T')[0] && !task.completed
// isOverdue → text-red-400; else → text-slate-500
```

**Screenshot checkpoints:**
1. Project page empty state — empty state + form visible
2. After creating task with "High" priority — red badge renders
3. After checking task complete — strikethrough visible, moved to completed section
4. After unchecking — strikethrough removed
5. Past due date validation — error message visible
6. After deleting task — removed from list
7. Mobile 375px — task items don't overflow

---

## Phase 8 — Playwright Tests

**`playwright.config.ts`:**
```ts
{
  testDir: './tests',
  fullyParallel: false,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [
    { name: 'setup-user-a', testMatch: /user-a\.setup\.ts/ },
    { name: 'setup-user-b', testMatch: /user-b\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user-a.json' },
      dependencies: ['setup-user-a', 'setup-user-b']
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
}
```

**Setup files** — `signInWithPassword` → inject session → `storageState({ path })`

**Test data lifecycle:**
```ts
const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } })
beforeEach: insert project/task via adminClient
afterEach:  delete via adminClient (bypasses RLS)
```

**RLS test pattern:**
```ts
test('User B cannot see User A project', async ({ browser }) => {
  const ctxB = await browser.newContext({ storageState: 'playwright/.auth/user-b.json' })
  const pageB = await ctxB.newPage()
  await pageB.goto('/')
  await expect(pageB.getByText(userAProjectName)).not.toBeVisible()
  await pageB.goto(`/projects/${userAProjectId}`)
  await expect(pageB.getByText(/not found/i)).toBeVisible()
  await ctxB.close()
})
```

**Verifiable:** `npx playwright test` — all 4 files pass, zero failures

---

## Phase 9 — CodeRabbit + Vercel

1. Push final code to GitHub
2. Connect CodeRabbit to the repo — open a test PR to verify review posts
3. Deploy to Vercel — set all env vars
4. In Supabase: add Vercel URL to redirect URLs, re-enable email confirmation
5. Smoke test on live URL

---

## Edge Case Reference (critical subset)

| Edge Case | Handling |
|---|---|
| Signup with existing email | `{ error: 'An account with this email already exists.' }` |
| Login with wrong password | `{ error: 'Invalid email or password' }` — never differentiate |
| Empty project name (spaces only) | Server checks `!name.trim()` — caught even if browser allows |
| Project description whitespace-only | `description?.trim() \|\| null` before insert |
| Due date = today | NOT overdue. Only `due_date < today` (strict less-than) |
| Due date in past | `fieldErrors.due_date: 'Due date must be today or a future date'` |
| Priority outside enum | Default to `'Medium'` server-side; DB CHECK is backstop |
| User accesses other user's project URL | `getProject()` returns `null` (RLS) → `notFound()` → 404 |
| Delete button inside project Link | `e.stopPropagation()` on delete button prevents link navigation |
| `tasks[0]?.count` undefined | Always map as `tasks[0]?.count ?? 0` |
| Missing env variables | Throw descriptive error at startup, not cryptic runtime crash |
| `formData.get()` returns null | Always guard: `const name = formData.get('name') as string \| null` |

---

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` never has `NEXT_PUBLIC_` prefix
- [ ] `getUser()` used everywhere server-side — never `getSession()`
- [ ] Every Supabase query in `lib/db/` — never inline in components
- [ ] All mutations have `.eq('user_id', userId)` defense-in-depth beyond RLS
- [ ] `dangerouslySetInnerHTML` never used — React escapes text nodes
- [ ] Raw Supabase errors never surfaced to users — only generic messages logged
- [ ] `token_hash` from confirm route never logged
- [ ] Supabase redirect URL whitelist limited to localhost + Vercel URL

---

## Acceptance Criteria (all testable)

**Auth**
- [ ] Visit `/` without session → URL changes to `/login`
- [ ] Login correct → URL changes to `/`
- [ ] Login wrong password → error message visible
- [ ] Logout → URL changes to `/login`; revisit `/` → still `/login`

**Projects**
- [ ] Empty dashboard → "You don't have any projects yet" text visible
- [ ] Create project → card appears with name + "0" task count
- [ ] Create project empty name → form doesn't submit, error visible
- [ ] Click project card → URL contains `/projects/[uuid]`
- [ ] Delete → AlertDialog with project name visible
- [ ] Confirm delete → card removed

**Tasks**
- [ ] Empty project → "No tasks yet" visible
- [ ] Create task → appears with correct title + default "Medium" badge
- [ ] Create task "High" priority → red badge visible
- [ ] Create task past due date → server error, not submitted
- [ ] Toggle complete → title has strikethrough
- [ ] Toggle back → strikethrough removed
- [ ] Delete task → removed from list

**RLS**
- [ ] User A's project NOT visible in User B's dashboard
- [ ] User B direct URL to User A's project → 404 page

**Quality**
- [ ] `npx tsc --noEmit` → zero errors
- [ ] `npm run lint` → zero errors
- [ ] `npx playwright test` → all 4 files pass, zero failures
- [ ] Chrome DevTools screenshots taken at all 16 checkpoints

---

## Parallelization Map

```
Phase 0 (GitHub repo)
        ↓
Phase 1 (Scaffold) ────── (Supabase tables + auth config)
        └─────────────────────────────────┘
                      ↓
        Phase 2 (Foundation — 7 files all parallel)
                      ↓
         ┌────────────┴────────────┐
     Phase 3a                  Phase 3b
  lib/db/projects.ts        lib/db/tasks.ts
         └────────────┬────────────┘
                      ↓
        Phase 4 (Server Actions — 3 files parallel)
                      ↓
        Phase 5 (Auth pages — SubmitButton first, then parallel)
                      ↓
        Phase 6 (Dashboard — layout first, then parallel)
                      ↓
        Phase 7 (Project page — page.tsx first, then parallel)
                      ↓
        Phase 8 (Playwright — config → setup files → test files)
                      ↓
        Phase 9 (CodeRabbit + Vercel)
```
