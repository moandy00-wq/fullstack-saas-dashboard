import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

let userAProjectId: string

async function loginAsUserB(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.TEST_USER_B_EMAIL!)
  await page.getByLabel('Password').fill(process.env.TEST_USER_B_PASSWORD!)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard', { timeout: 15000 })
}

test.describe('Row Level Security', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeAll(async () => {
    const { data: users } = await adminClient.auth.admin.listUsers()
    const userA = users.users.find(u => u.email === process.env.TEST_USER_A_EMAIL)

    const { data: project } = await adminClient
      .from('projects')
      .insert({ name: 'User A Secret Project', user_id: userA!.id })
      .select()
      .single()

    userAProjectId = project!.id

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

  test('User B cannot see User A project in dashboard', async ({ page }) => {
    await loginAsUserB(page)

    await expect(page.getByText('User A Secret Project')).not.toBeVisible()
  })

  test('User B cannot access User A project via direct URL', async ({ page }) => {
    await loginAsUserB(page)
    await page.goto(`/dashboard/projects/${userAProjectId}`)

    await expect(page.getByText(/not found|doesn't exist/i)).toBeVisible({ timeout: 15000 })
  })

  test('User B cannot see User A tasks', async ({ page }) => {
    await loginAsUserB(page)
    await page.goto(`/dashboard/projects/${userAProjectId}`)

    await expect(page.getByText('User A Secret Task')).not.toBeVisible()
  })
})
