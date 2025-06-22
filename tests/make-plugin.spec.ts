import { test, expect } from "@playwright/test";

test.describe("Make.com Plugin - Detailed Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to Make plugin in demo mode
    await page.goto("/");
    await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
    await page.getByRole("link", { name: "🔌 Plugins" }).click();
    await page.getByRole("tab", { name: "Make.com Integration" }).click();
  });

  test.describe("Plugin Configuration", () => {
    test("should display correct plugin metadata", async ({ page }) => {
      // Check plugin info
      await expect(page.getByRole("heading", { name: "Make.com Integration" })).toBeVisible();
      await expect(
        page.getByText("Automate workflows using Make.com webhooks with flexible message parsing")
      ).toBeVisible();

      // Check status badge
      await expect(page.getByText("Enabled")).toBeVisible();

      // Check webhook count
      await expect(page.getByText("0 active webhooks")).toBeVisible();
    });

    test("should toggle plugin enabled state", async ({ page }) => {
      // Initially enabled
      await expect(page.getByText("Enabled")).toBeVisible();

      // Disable plugin
      await page.getByRole("button", { name: "Disable Plugin" }).click();
      await expect(page.getByText("Disabled")).toBeVisible();
      await expect(page.getByRole("button", { name: "Enable Plugin" })).toBeVisible();

      // Re-enable plugin
      await page.getByRole("button", { name: "Enable Plugin" }).click();
      await expect(page.getByText("Enabled")).toBeVisible();
      await expect(page.getByRole("button", { name: "Disable Plugin" })).toBeVisible();
    });
  });

  test.describe("Service Templates", () => {
    test("should display all service templates", async ({ page }) => {
      // Check that all templates are visible
      await expect(page.getByRole("heading", { name: "📋 Trello Task Creator" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "📧 Gmail Sender" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "📊 Expense Tracker" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "💬 Slack Cross-poster" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "📅 Calendar Event Creator" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "🔧 Custom Webhook" })).toBeVisible();
    });

    test("should show service badges", async ({ page }) => {
      // Check for service type badges
      await expect(page.getByText("trello")).toBeVisible();
      await expect(page.getByText("gmail")).toBeVisible();
      await expect(page.getByText("google-sheets")).toBeVisible();
      await expect(page.getByText("slack")).toBeVisible();
      await expect(page.getByText("calendar")).toBeVisible();
      await expect(page.getByText("custom")).toBeVisible();
    });
  });

  test.describe("Trello Integration Guide", () => {
    test("should display setup instructions", async ({ page }) => {
      // Check section header
      await expect(page.getByRole("heading", { name: "Trello Quick Setup" })).toBeVisible();
      await expect(page.getByText("Based on your existing implementation - ready to use!")).toBeVisible();

      // Check setup steps
      await expect(page.getByText("Set your MAKE_WEBHOOK_URL environment variable")).toBeVisible();
      await expect(page.getByText("Send a message in this format:")).toBeVisible();

      // Check example format
      await expect(page.getByText("Task: Fix the login bug")).toBeVisible();
      await expect(
        page.getByText("Description: Users cannot authenticate with their Matrix credentials")
      ).toBeVisible();
    });
  });

  test.describe("Navigation and State", () => {
    test("should navigate between tabs correctly", async ({ page }) => {
      // Test tab navigation
      await page.getByRole("tab", { name: "Overview" }).click();
      await expect(page.getByRole("heading", { name: "Operator Plugins" })).toBeVisible();

      await page.getByRole("tab", { name: "Settings" }).click();
      await expect(page.getByRole("heading", { name: "Plugin Settings" })).toBeVisible();

      await page.getByRole("tab", { name: "Make.com Integration" }).click();
      await expect(page.getByRole("heading", { name: "Make.com Integration" })).toBeVisible();
    });

    test("should maintain plugin state across navigation", async ({ page }) => {
      // Disable plugin
      await page.getByRole("button", { name: "Disable Plugin" }).click();
      await expect(page.getByText("Disabled")).toBeVisible();

      // Navigate away and back
      await page.getByRole("tab", { name: "Overview" }).click();
      await page.getByRole("tab", { name: "Make.com Integration" }).click();

      // Should still be disabled
      await expect(page.getByText("Disabled")).toBeVisible();
    });
  });

  test.describe("Plugin Architecture Information", () => {
    test("should navigate back to overview and check plugin development info", async ({ page }) => {
      // Go back to overview tab
      await page.getByRole("tab", { name: "Overview" }).click();

      // Check plugin development section
      await expect(page.getByRole("heading", { name: "Plugin Development" })).toBeVisible();
      await expect(
        page.getByText("Operator's plugin-first architecture makes it easy to extend functionality")
      ).toBeVisible();

      // Check architecture info
      await expect(page.getByText("🏗️ Framework Architecture")).toBeVisible();
      await expect(
        page.getByText("Built on Next.js with TypeScript, Jotai state management, and Zod validation")
      ).toBeVisible();

      await expect(page.getByText("🔌 Plugin API")).toBeVisible();
      await expect(
        page.getByText("Simple plugin structure with hooks for messages, reactions, and UI components")
      ).toBeVisible();

      await expect(page.getByText("📚 Documentation")).toBeVisible();
      await expect(page.getByText("Comprehensive guides and examples for building custom plugins")).toBeVisible();
    });
  });

  test.describe("Settings Tab", () => {
    test("should show settings placeholder", async ({ page }) => {
      // Navigate to settings tab
      await page.getByRole("tab", { name: "Settings" }).click();

      // Check settings content
      await expect(page.getByRole("heading", { name: "Plugin Settings" })).toBeVisible();
      await expect(page.getByText("Global settings for all plugins")).toBeVisible();
      await expect(page.getByText("Plugin settings configuration coming soon...")).toBeVisible();
    });
  });

  test.describe("UI Responsiveness", () => {
    test("should display correctly on mobile viewport", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Reload to test mobile layout
      await page.reload();

      // Main elements should still be visible
      await expect(page.getByRole("heading", { name: "Make.com Integration" })).toBeVisible();
      await expect(page.getByText("Enabled")).toBeVisible();

      // Service templates should stack properly
      await expect(page.getByRole("heading", { name: "📋 Trello Task Creator" })).toBeVisible();
    });

    test("should handle tablet viewport correctly", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Reload to test tablet layout
      await page.reload();

      // Check that grid layout adapts
      await expect(page.getByRole("heading", { name: "Service Templates" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "📋 Trello Task Creator" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "📧 Gmail Sender" })).toBeVisible();
    });
  });

  test.describe("Error States and Edge Cases", () => {
    test("should handle rapid tab switching", async ({ page }) => {
      // Rapidly switch between tabs
      await page.getByRole("tab", { name: "Overview" }).click();
      await page.getByRole("tab", { name: "Make.com Integration" }).click();
      await page.getByRole("tab", { name: "Settings" }).click();
      await page.getByRole("tab", { name: "Overview" }).click();
      await page.getByRole("tab", { name: "Make.com Integration" }).click();

      // Should still display correctly
      await expect(page.getByRole("heading", { name: "Make.com Integration" })).toBeVisible();
      await expect(page.getByText("Enabled")).toBeVisible();
    });

    test("should handle plugin toggle spam", async ({ page }) => {
      // Rapidly toggle plugin state
      for (let i = 0; i < 3; i++) {
        await page.getByRole("button", { name: "Disable Plugin" }).click();
        await expect(page.getByText("Disabled")).toBeVisible();

        await page.getByRole("button", { name: "Enable Plugin" }).click();
        await expect(page.getByText("Enabled")).toBeVisible();
      }

      // Should end in enabled state
      await expect(page.getByText("Enabled")).toBeVisible();
    });
  });

  test.describe("Integration with Main App", () => {
    test("should maintain state when navigating away and back", async ({ page }) => {
      // Disable plugin
      await page.getByRole("button", { name: "Disable Plugin" }).click();
      await expect(page.getByText("Disabled")).toBeVisible();

      // Navigate to overview
      await page.getByRole("tab", { name: "Overview" }).click();

      // Navigate back to chat
      await page.getByRole("link", { name: "← Back to Chat" }).click();
      await expect(page).toHaveURL("/");

      // Navigate back to plugins
      await page.getByRole("link", { name: "🔌 Plugins" }).click();
      await page.getByRole("tab", { name: "Make.com Integration" }).click();

      // Plugin should still be disabled (state preserved)
      await expect(page.getByText("Disabled")).toBeVisible();
    });
  });
});
