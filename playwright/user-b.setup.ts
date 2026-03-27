import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user-b.json'

setup('authenticate as User B', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.TEST_USER_B_EMAIL!)
  await page.getByLabel('Password').fill(process.env.TEST_USER_B_PASSWORD!)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for redirect to dashboard
  await page.waitForURL('/', { timeout: 15000 })
  await expect(page.getByText('Projects')).toBeVisible()

  await page.context().storageState({ path: authFile })
})
