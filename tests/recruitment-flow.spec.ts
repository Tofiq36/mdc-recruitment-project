import { test, expect } from '@playwright/test';

test.describe('Enterprise Recruitment AI - End-to-End Flow', () => {
  test('should load the dashboard and toggle bulk processing mode', async ({ page }) => {
    // Navigate to the local frontend
    await page.goto('http://localhost:5173');

    // Verify main headers are visible
    await expect(page.locator('text=Enterprise Recruitment AI')).toBeVisible();
    await expect(page.locator('text=System Ready')).toBeVisible();

    // Verify Single Candidate mode inputs are present
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();

    // Switch to Bulk Processing mode
    await page.getByRole('button', { name: 'Bulk Processing' }).click();

    // Verify the UI adapted to bulk mode
    await expect(page.locator('text=How many resumes to compare?')).toBeVisible();
    await expect(page.locator('text=Resume #1')).toBeVisible();
    await expect(page.locator('text=Resume #2')).toBeVisible();
  });

  test('should navigate to candidate history', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Click the History tab
    await page.getByRole('button', { name: 'Candidate History' }).click();
    
    // Verify the database table loads
    await expect(page.locator('text=Global Candidate Database')).toBeVisible();
    await expect(page.locator('text=Role Evaluated')).toBeVisible();
  });
});