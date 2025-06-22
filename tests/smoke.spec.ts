import { test, expect } from "@playwright/test";

test.describe("Operator Matrix Frontend Framework - Smoke Tests", () => {
  test.describe("Landing Page & Authentication", () => {
    test("should load the main page successfully", async ({ page }) => {
      await page.goto("/");

      // Check page title
      await expect(page).toHaveTitle(/Operator/);

      // Check main heading
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();

      // Check subtitle
      await expect(page.getByText("Matrix Frontend Framework")).toBeVisible();

      // Check phase indicators
      await expect(page.getByText("Phase 1 Complete")).toBeVisible();
      await expect(page.getByText("Phase 2 Active")).toBeVisible();

      // Check plugins link
      await expect(page.getByRole("link", { name: "🔌 Explore Plugins" })).toBeVisible();
    });

    test("should display login form for unauthenticated users", async ({ page }) => {
      await page.goto("/");

      // Check login form elements
      await expect(page.getByLabel("Homeserver")).toBeVisible();
      await expect(page.getByLabel("Username")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();

      // Check buttons
      await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Guest Login" })).toBeVisible();
      await expect(page.getByRole("button", { name: "🚀 Demo Mode (Development)" })).toBeVisible();
    });

    test("should show development status card", async ({ page }) => {
      await page.goto("/");

      // Check development status section
      await expect(page.getByRole("heading", { name: "Development Status" })).toBeVisible();
      await expect(page.getByText("✅ Core Chat Interface")).toBeVisible();
      await expect(page.getByText("🔄 Make.com Plugin System")).toBeVisible();
      await expect(page.getByText("⏳ Bridge Integration")).toBeVisible();
    });

    test("should navigate to plugins page from landing", async ({ page }) => {
      await page.goto("/");

      // Click plugins link
      await page.getByRole("link", { name: "🔌 Explore Plugins" }).click();

      // Should be redirected to plugins page
      await expect(page).toHaveURL("/plugins");
      await expect(page.getByRole("heading", { name: "Plugin Access" })).toBeVisible();
    });
  });

  test.describe("Demo Mode Authentication", () => {
    test("should enable demo mode and show chat interface", async ({ page }) => {
      await page.goto("/");

      // Click demo mode button
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Should show chat interface with demo data
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByRole("link", { name: "🔌 Plugins" })).toBeVisible();

      // Check for demo rooms in sidebar
      await expect(page.getByText("General Discussion")).toBeVisible();
      await expect(page.getByText("Development Team")).toBeVisible();
      await expect(page.getByText("WhatsApp Bridge")).toBeVisible();
      await expect(page.getByText("Alice Smith")).toBeVisible();
    });

    test("should show welcome message when no room selected", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Check welcome message
      await expect(page.getByRole("heading", { name: "Welcome to Operator" })).toBeVisible();
      await expect(page.getByText("Select a room from the sidebar to start chatting")).toBeVisible();
      await expect(page.getByText("Or explore the plugins tab to set up automations")).toBeVisible();
    });
  });

  test.describe("Plugins Page", () => {
    test("should load plugins page with authentication required", async ({ page }) => {
      await page.goto("/plugins");

      // Should show login required message
      await expect(page.getByRole("heading", { name: "Plugin Access" })).toBeVisible();
      await expect(page.getByText("Please log in to access and configure plugins")).toBeVisible();

      // Should show login form
      await expect(page.getByLabel("Homeserver")).toBeVisible();
      await expect(page.getByLabel("Username")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
    });

    test("should show plugins interface after demo authentication", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Should show plugins page
      await expect(page.getByRole("heading", { name: "Operator Plugins" })).toBeVisible();
      await expect(page.getByText("Extend your Matrix experience with powerful automation")).toBeVisible();

      // Check navigation tabs
      await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Make.com Integration" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Settings" })).toBeVisible();
    });

    test("should display Make.com plugin card in overview", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Check Make.com plugin card
      await expect(page.getByRole("heading", { name: "🤖 Make.com Integration" })).toBeVisible();
      await expect(page.getByText("Automate workflows using Make.com webhooks")).toBeVisible();

      // Check phase badge
      await expect(page.getByText("Phase 2")).toBeVisible();

      // Check service badges
      await expect(page.getByText("Trello")).toBeVisible();
      await expect(page.getByText("Gmail")).toBeVisible();
      await expect(page.getByText("Sheets")).toBeVisible();

      // Check status indicators
      await expect(page.getByText("Trello task creation ready")).toBeVisible();
      await expect(page.getByText("6 service templates available")).toBeVisible();
      await expect(page.getByText("Pattern-based message parsing")).toBeVisible();
    });

    test("should show future plugins as disabled", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Check future plugins
      await expect(page.getByRole("heading", { name: "🔌 Bridge Manager" })).toBeVisible();
      await expect(page.getByText("Phase 3")).toBeVisible();
      await expect(page.getByText("Coming in Phase 3...")).toBeVisible();

      await expect(page.getByRole("heading", { name: "🧵 Thread Manager" })).toBeVisible();
      await expect(page.getByText("Future")).toBeVisible();
      await expect(page.getByText("Planned for future release...")).toBeVisible();
    });

    test("should navigate to Make.com plugin configuration", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Click Make.com tab
      await page.getByRole("tab", { name: "Make.com Integration" }).click();

      // Should show Make plugin interface
      await expect(page.getByRole("heading", { name: "Make.com Integration" })).toBeVisible();
      await expect(page.getByText("Enabled")).toBeVisible();
      await expect(page.getByRole("button", { name: "Disable Plugin" })).toBeVisible();
    });
  });

  test.describe("Make.com Plugin Interface", () => {
    test.beforeEach(async ({ page }) => {
      // Setup: Navigate to Make plugin
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();
      await page.getByRole("tab", { name: "Make.com Integration" }).click();
    });

    test("should display plugin status and controls", async ({ page }) => {
      // Check plugin status
      await expect(page.getByText("Enabled")).toBeVisible();
      await expect(page.getByRole("button", { name: "Disable Plugin" })).toBeVisible();
      await expect(page.getByText("0 active webhooks")).toBeVisible();
    });

    test("should show service templates", async ({ page }) => {
      // Check service templates section
      await expect(page.getByRole("heading", { name: "Service Templates" })).toBeVisible();
      await expect(page.getByText("Quick setup for popular Make.com integrations")).toBeVisible();

      // Check individual templates
      await expect(page.getByRole("heading", { name: "📋 Trello Task Creator" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "📧 Gmail Sender" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "📊 Expense Tracker" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "💬 Slack Cross-poster" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "📅 Calendar Event Creator" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "🔧 Custom Webhook" })).toBeVisible();
    });

    test("should display Trello quick setup guide", async ({ page }) => {
      // Check Trello quick setup
      await expect(page.getByRole("heading", { name: "Trello Quick Setup" })).toBeVisible();
      await expect(page.getByText("Based on your existing implementation - ready to use!")).toBeVisible();

      // Check setup instructions
      await expect(page.getByText("Set your MAKE_WEBHOOK_URL environment variable")).toBeVisible();
      await expect(page.getByText("Send a message in this format:")).toBeVisible();
      await expect(page.getByText("Task: Fix the login bug")).toBeVisible();
      await expect(page.getByText("Description: Users cannot authenticate")).toBeVisible();
    });

    test("should allow toggling plugin enable/disable", async ({ page }) => {
      // Initially enabled
      await expect(page.getByText("Enabled")).toBeVisible();
      await expect(page.getByRole("button", { name: "Disable Plugin" })).toBeVisible();

      // Click disable
      await page.getByRole("button", { name: "Disable Plugin" }).click();

      // Should now be disabled
      await expect(page.getByText("Disabled")).toBeVisible();
      await expect(page.getByRole("button", { name: "Enable Plugin" })).toBeVisible();

      // Click enable again
      await page.getByRole("button", { name: "Enable Plugin" }).click();

      // Should be enabled again
      await expect(page.getByText("Enabled")).toBeVisible();
      await expect(page.getByRole("button", { name: "Disable Plugin" })).toBeVisible();
    });
  });

  test.describe("Navigation & Layout", () => {
    test("should navigate between main app and plugins", async ({ page }) => {
      // Start at plugins page after demo login
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Go back to chat
      await page.getByRole("link", { name: "← Back to Chat" }).click();
      await expect(page).toHaveURL("/");

      // Should show authenticated interface
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByRole("link", { name: "🔌 Plugins" })).toBeVisible();
    });

    test("should handle responsive design on mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/");

      // Should still show main content
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByText("Matrix Frontend Framework")).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should handle invalid routes gracefully", async ({ page }) => {
      // Navigate to non-existent route
      const response = await page.goto("/non-existent-page");

      // Should get 404 or redirect appropriately
      expect(response?.status()).toBe(404);
    });

    test("should handle plugin errors gracefully", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // The page should load without JavaScript errors
      const errorLogs: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errorLogs.push(msg.text());
        }
      });

      await page.getByRole("tab", { name: "Make.com Integration" }).click();

      // Wait a bit for any errors to surface
      await page.waitForTimeout(2000);

      // Should have no critical errors (allow for minor warnings)
      const criticalErrors = errorLogs.filter(
        (log) => !log.includes("Warning:") && !log.includes("DevTools") && !log.includes("Extension")
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe("Performance & Loading", () => {
    test("should load pages within reasonable time", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test("should have accessible interface", async ({ page }) => {
      await page.goto("/");

      // Check for basic accessibility
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
      await expect(page.getByRole("link", { name: "🔌 Explore Plugins" })).toBeVisible();
    });
  });
});
