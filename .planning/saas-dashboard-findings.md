# Research Findings — Fullstack SaaS Dashboard

---

## Track A: Codebase Exploration

### Current State
Project folder is empty except for `definition.md`, `CLAUDE.md`, and `.planning/` directory. No code exists yet.

### Confirmed Directory Structure
See CLAUDE.md — full structure is defined and ready to build against.

### Database Schema — UPDATED (includes task fields from spec)
The CLAUDE.md schema is missing `description`, `due_date`, and `priority` on the tasks table. Correct schema:

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
```

### TypeScript Types Required (types/index.ts)
```ts
type Project = { id, user_id, name, description, created_at }
type Task = { id, project_id, user_id, title, description, due_date, priority, completed, created_at }
type ActionResult<T> = { success: boolean, error?: string, data?: T }
```

### Build Order (9 phases)
1. Supabase setup (tables, RLS, auth config, test users)
2. Foundation (`lib/supabase/client.ts`, `lib/supabase/server.ts`, `types/index.ts`, `middleware.ts`)
3. DB query layer (`lib/db/projects.ts`, `lib/db/tasks.ts`)
4. Auth pages + callback route
5. Dashboard layout + home page
6. Project components
7. Task components
8. Tests
9. GitHub + Vercel deployment

---

## Track B: Web Research — Critical Findings

### CRITICAL: Wrong Package in CLAUDE.md
The CLAUDE.md lists `supabase-js` only. This is **wrong for SSR/App Router**. Two packages are required:

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Core JS client |
| `@supabase/ssr` | **Required** for cookie-based session management in Next.js App Router |

The older `@supabase/auth-helpers-nextjs` is **fully deprecated** — never use it.

### CRITICAL: Auth Callback Route is Wrong
The planned route `app/api/auth/callback/route.ts` is the **legacy implicit flow** pattern.

The correct pattern for Next.js App Router with Supabase uses **PKCE flow**:
- Route must be at: `app/auth/confirm/route.ts`
- Must call `supabase.auth.verifyOtp({ token_hash, type })` — not exchange a code
- Supabase email template must be updated to use `token_hash` parameter

### CRITICAL: Never Use `getSession()` on the Server
`supabase.auth.getSession()` in server code is a **security vulnerability** — it reads from cookies without revalidating the JWT with the auth server, making it spoofable.

Always use `supabase.auth.getUser()` in Server Components, Server Actions, and middleware.

### CRITICAL: Cookie Handler Rules
When creating the server Supabase client, the cookie handlers must use **only** `getAll` and `setAll`:
- Never use `get`, `set`, or `remove` — the `@supabase/ssr` package will throw
- `setAll()` must be wrapped in `try/catch` in Server Components (they cannot write cookies — only middleware can)

### CRITICAL: Middleware is Mandatory
Without `middleware.ts`, expired auth tokens are never refreshed. Session will appear valid in cookies but fail on the server. Middleware must:
1. Create a Supabase server client using `request.cookies`
2. Call `supabase.auth.getUser()` — this refreshes the session
3. Return the response with updated cookies

### shadcn/ui Correct Install Command
```bash
npx shadcn@latest init       # NOT npx shadcn-ui@latest init
npx shadcn@latest add button # Add individual components
```

### Playwright Auth — Do Not Log In Via UI in Every Test
Logging in via browser UI in every test is slow and brittle. Correct pattern:
1. Create `playwright/auth.setup.ts` — logs in once via Supabase REST API, saves session to `playwright/.auth/user.json`
2. All tests load from `storageState` instead of re-logging in
3. Add `playwright/.auth/` to `.gitignore`

For RLS tests (User A vs User B), create two separate storageState files.

### Server Action Error Handling
- **Never throw** for validation errors — it triggers the error boundary
- **Return errors as data**: `{ error: string | null, fieldErrors: { field?: string } }`
- Use `useActionState` from `react` (not `useFormState` from `react-dom` — being superseded)
- Use `useFormStatus` for pending/loading state on submit buttons

### RLS Policy Performance Fix
Use `(select auth.uid())` with a select wrapper in RLS policies — not `auth.uid()` directly. This prevents PostgreSQL from evaluating `auth.uid()` once per row:

```sql
-- CORRECT (evaluated once per query)
create policy "..." on projects for all using ((select auth.uid()) = user_id);

-- AVOID (evaluated once per row — slow on large tables)
create policy "..." on projects for all using (auth.uid() = user_id);
```

---

## Decisions Informed by Research

| Decision | Reason |
|---|---|
| Use `@supabase/ssr` + `@supabase/supabase-js` | Required for cookie-based SSR auth |
| Auth callback at `app/auth/confirm/route.ts` | PKCE flow — correct for Next.js App Router |
| Always `getUser()`, never `getSession()` on server | Security — `getSession()` is spoofable server-side |
| Cookie handlers: `getAll`/`setAll` only | `@supabase/ssr` requirement |
| Playwright uses storageState, not UI login | Speed and reliability |
| RLS policies use `(select auth.uid())` | Performance — evaluated once per query |
| `useActionState` from `react` | `useFormState` is being deprecated |
| shadcn install: `npx shadcn@latest init` | Correct package name |
