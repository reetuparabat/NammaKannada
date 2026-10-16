import { test, expect } from '@playwright/test';

test.describe('NammaKannada Learner Workflow E2E', () => {
  test('Complete end-to-end learning journey: Browse -> Scenario -> Phrase -> Practice -> Quiz -> Progress', async ({
    page,
  }) => {
    // 1. Open the homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/NammaKannada/i);
    await expect(page.locator('text=ನಮ್ಮ ಕನ್ನಡ').first()).toBeVisible();

    // 2. Select a category (e.g. Transportation)
    const categoryCard = page.locator('a[href^="/categories/"]').first();
    await expect(categoryCard).toBeVisible();
    await categoryCard.click();

    // 3. Open a scenario
    await page.waitForURL(/\/categories\/\d+/);
    const scenarioCard = page.locator('a[href^="/scenarios/"]').first();
    await expect(scenarioCard).toBeVisible();
    await scenarioCard.click();

    // 4. View phrases on scenario page & bookmark
    await page.waitForURL(/\/scenarios\/\d+/);
    await expect(page.locator('h2:has-text("Phrases in This Scenario")')).toBeVisible();
    const bookmarkButton = page.locator('button[aria-label*="Bookmark"], button[title*="Save phrase"]').first();
    await expect(bookmarkButton).toBeVisible();
    await bookmarkButton.click();

    // 5. Open a phrase detail page
    await page.goto('/phrases/1');
    await expect(page.locator('h1, p.kannada-text').first()).toBeVisible();

    // 6. Complete conversation practice
    await page.goto('/practice/1');
    await expect(page.locator('h1, h2, span').filter({ hasText: /Interactive Practice|Guided Practice|City Bus/i }).first()).toBeVisible();

    // If options are available, make choices to reach completion
    for (let i = 0; i < 5; i++) {
      const optionButton = page.locator('button:has-text("ಮೆಜೆಸ್ಟಿಕ್"), button:has-text("ಟಿಕೆಟ್"), button:has-text("Continue")').first();
      if (await optionButton.isVisible()) {
        await optionButton.click();
        await page.waitForTimeout(300);
      }
    }

    // 7. Verify quiz page loads and questions can be answered
    await page.goto('/quiz/1');
    await expect(page.locator('text=Scenario Quiz').first()).toBeVisible();

    // Select first option for current question
    const firstOption = page.locator('button:has(p)').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }

    // 8. Verify progress page loads
    await page.goto('/progress');
    await expect(page.locator('h1').filter({ hasText: /Progress/i })).toBeVisible();

    // 9. Verify saved phrases page loads
    await page.goto('/saved');
    await expect(page.locator('h1').filter({ hasText: /Saved Phrases|Phrasebook/i })).toBeVisible();
  });

  test('Protected administrative route requires authentication', async ({ page }) => {
    await page.goto('/admin');
    // Ensure credentials form is rendered
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Authenticate")')).toBeVisible();
  });
});
