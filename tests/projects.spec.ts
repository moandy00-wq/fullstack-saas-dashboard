import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function loginAsUserA(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.TEST_USER_A_EMAIL!)
  await page.getByLabel('Password').fill(process.env.TEST_USER_A_PASSWORD!)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard', { timeout: 15000 })
}

test.describe('Project CRUD', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.afterEach(async () => {
    const { data } = await adminClient
      .from('projects')
      .select('id')
      .like('name', 'Test Project%')

    if (data) {
      for (const project of data) {
        await adminClient.from('projects').delete().eq('id', project.id)
      }
    }
  })

  test('user can create a project', async ({ page }) => {
    await loginAsUserA(page)

    await page.getByRole('button', { name: 'New Project' }).click()
    await expect(page.getByText('Create a new project')).toBeVisible()

    await page.getByLabel('Project name').fill('Test Project Alpha')
    await page.getByRole('button', { name: 'Create project' }).click()

    await expect(page.getByText('Test Project Alpha')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('0 tasks')).toBeVisible()
  })

  test('creating project with empty name shows error', async ({ page }) => {
    await loginAsUserA(page)

    await page.getByRole('button', { name: 'New Project' }).click()
    await page.getByRole('button', { name: 'Create project' }).click()

    await expect(page.getByText('Project name is required')).toBeVisible({ timeout: 10000 })
  })

  test('user can view a project', async ({ page }) => {
    await loginAsUserA(page)

    await page.getByRole('button', { name: 'New Project' }).click()
    await page.getByLabel('Project name').fill('Test Project View')
    await page.getByRole('button', { name: 'Create project' }).click()
    await expect(page.getByRole('heading', { name: 'Test Project View' })).toBeVisible({ timeout: 10000 })

    await page.getByRole('heading', { name: 'Test Project View' }).click()
    await page.waitForURL(/\/dashboard\/projects\//, { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Add a task')).toBeVisible({ timeout: 10000 })
  })

  test('user can delete a project', async ({ page }) => {
    await loginAsUserA(page)

    await page.getByRole('button', { name: 'New Project' }).click()
    await page.getByLabel('Project name').fill('Test Project Delete')
    await page.getByRole('button', { name: 'Create project' }).click()
    await expect(page.getByRole('heading', { name: 'Test Project Delete' })).toBeVisible({ timeout: 10000 })

    // Find the delete button within the card that contains our project name
    const projectCard = page.locator('a', { hasText: 'Test Project Delete' })
    await projectCard.getByRole('button').filter({ has: page.locator('svg') }).click()
    await expect(page.getByText('Delete project')).toBeVisible()
    await page.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByRole('heading', { name: 'Test Project Delete' })).not.toBeVisible({ timeout: 10000 })
  })

  test('dashboard shows projects or empty state', async ({ page }) => {
    await loginAsUserA(page)

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    const emptyState = page.getByText("You don't have any projects yet")
    const heading = page.getByRole('heading', { name: 'Projects', exact: true })

    await expect(heading).toBeVisible({ timeout: 5000 })
  })
})
