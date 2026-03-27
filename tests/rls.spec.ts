import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

let userAProjectId: string

test.describe('Row Level Security', () => {
  test.beforeAll(async () => {
    // Create a project for User A via admin
    const { data: users } = await adminClient.auth.admin.listUsers()
    const userA = users.users.find(u => u.email === process.env.TEST_USER_A_EMAIL)

    const { data: project } = await adminClient
      .from('projects')
      .insert({ name: 'User A Secret Project', user_id: userA!.id })
      .select()
      .single()

    userAProjectId = project!.id

    // Also create a task in that project
    await adminClient
      .from('tasks')
      .insert({
        title: 'User A Secret Task',
        project_id: userAProjectId,
        user_id: userA!.id,
      })
  })

  test.afterAll(async () => {
    if (userAProjectId) {
      await adminClient.from('projects').delete().eq('id', userAProjectId)
    }
  })

  test('User B cannot see User A project in dashboard', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user-b.json',
    })
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForURL('/', { timeout: 15000 })

    await expect(page.getByText('User A Secret Project')).not.toBeVisible()
    await context.close()
  })

  test('User B cannot access User A project via direct URL', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user-b.json',
    })
    const page = await context.newPage()

    await page.goto(`/projects/${userAProjectId}`)

    // Should see not found page
    await expect(page.getByText(/not found|doesn't exist/i)).toBeVisible({ timeout: 15000 })
    await context.close()
  })

  test('User B cannot see User A tasks', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user-b.json',
    })
    const page = await context.newPage()

    await page.goto(`/projects/${userAProjectId}`)

    await expect(page.getByText('User A Secret Task')).not.toBeVisible()
    await context.close()
  })
})
