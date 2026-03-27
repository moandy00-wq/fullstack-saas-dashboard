import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

let testProjectId: string

test.describe('Task CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test project via admin
    const { data: users } = await adminClient.auth.admin.listUsers()
    const userA = users.users.find(u => u.email === process.env.TEST_USER_A_EMAIL)

    const { data: project } = await adminClient
      .from('projects')
      .insert({ name: 'Test Project Tasks', user_id: userA!.id })
      .select()
      .single()

    testProjectId = project!.id

    await page.goto(`/projects/${testProjectId}`)
    await page.waitForURL(`/projects/${testProjectId}`, { timeout: 15000 })
  })

  test.afterEach(async () => {
    if (testProjectId) {
      await adminClient.from('projects').delete().eq('id', testProjectId)
    }
  })

  test('user can add a task', async ({ page }) => {
    await page.getByLabel('Task title').fill('Test Task One')
    await page.getByRole('button', { name: 'Add task' }).click()

    await expect(page.getByText('Test Task One')).toBeVisible({ timeout: 10000 })
  })

  test('adding task with empty title shows error', async ({ page }) => {
    await page.getByRole('button', { name: 'Add task' }).click()

    await expect(page.getByText('Task title is required')).toBeVisible({ timeout: 10000 })
  })

  test('user can toggle task complete', async ({ page }) => {
    // Create a task
    await page.getByLabel('Task title').fill('Test Task Toggle')
    await page.getByRole('button', { name: 'Add task' }).click()
    await expect(page.getByText('Test Task Toggle')).toBeVisible({ timeout: 10000 })

    // Toggle complete
    await page.getByRole('checkbox').first().click()

    // Verify strikethrough appears (completed section)
    await expect(page.getByText('Completed')).toBeVisible({ timeout: 10000 })
  })

  test('user can toggle task back to incomplete', async ({ page }) => {
    // Create a task
    await page.getByLabel('Task title').fill('Test Task Untoggle')
    await page.getByRole('button', { name: 'Add task' }).click()
    await expect(page.getByText('Test Task Untoggle')).toBeVisible({ timeout: 10000 })

    // Toggle complete
    await page.getByRole('checkbox').first().click()
    await expect(page.getByText('Completed')).toBeVisible({ timeout: 10000 })

    // Toggle back
    await page.getByRole('checkbox').first().click()
    await expect(page.getByText('In Progress')).toBeVisible({ timeout: 10000 })
  })

  test('user can delete a task', async ({ page }) => {
    // Create a task
    await page.getByLabel('Task title').fill('Test Task Delete')
    await page.getByRole('button', { name: 'Add task' }).click()
    await expect(page.getByText('Test Task Delete')).toBeVisible({ timeout: 10000 })

    // Delete it
    const deleteButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-trash-2') }).first()
    await deleteButton.click()

    await expect(page.getByText('Test Task Delete')).not.toBeVisible({ timeout: 10000 })
  })

  test('task shows correct priority badge', async ({ page }) => {
    await page.getByLabel('Task title').fill('Test Task Priority')
    await page.getByLabel('Priority').selectOption('High')
    await page.getByRole('button', { name: 'Add task' }).click()

    await expect(page.getByText('High')).toBeVisible({ timeout: 10000 })
  })
})
