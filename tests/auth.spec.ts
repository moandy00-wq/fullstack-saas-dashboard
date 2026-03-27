import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('unauthenticated user visiting dashboard is redirected to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('landing page is accessible without auth', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Ship projects')).toBeVisible()
  })

  test('user can log in with correct credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_USER_A_EMAIL!)
    await page.getByLabel('Password').fill(process.env.TEST_USER_A_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await expect(page.getByText('Projects')).toBeVisible()
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_USER_A_EMAIL!)
    await page.getByLabel('Password').fill('wrongpassword123')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 })
  })

  test('signup with empty fields shows validation error', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('button', { name: 'Sign up' }).click()

    await expect(page.getByText('Email is required')).toBeVisible({ timeout: 10000 })
  })

  test('user can log out', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_USER_A_EMAIL!)
    await page.getByLabel('Password').fill(process.env.TEST_USER_A_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('**/dashboard', { timeout: 15000 })

    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.waitForURL('**/login', { timeout: 15000 })
    await expect(page.getByText('Welcome back')).toBeVisible()

    await page.goto('/dashboard')
    await page.waitForURL('**/login')
  })
})
