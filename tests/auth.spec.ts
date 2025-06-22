import { test, expect } from "@playwright/test";

test.describe("Authentication Flow Tests", () => {
  test.describe("Login Form", () => {
    test("should display login form elements correctly", async ({ page }) => {
      await page.goto("/");

      // Check form fields are present
      await expect(page.getByLabel("Homeserver")).toBeVisible();
      await expect(page.getByLabel("Username")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();

      // Check default homeserver value
      await expect(page.getByLabel("Homeserver")).toHaveValue("https://matrix.org");

      // Check button states
      await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Guest Login" })).toBeVisible();
      await expect(page.getByRole("button", { name: "🚀 Demo Mode (Development)" })).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto("/");

      // Try to login with empty fields
      await page.getByRole("button", { name: "Login" }).click();

      // Form validation should prevent submission (check that we're still on login page)
      await expect(page.getByLabel("Username")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
    });

    test("should allow changing homeserver", async ({ page }) => {
      await page.goto("/");

      // Clear and change homeserver
      await page.getByLabel("Homeserver").clear();
      await page.getByLabel("Homeserver").fill("https://example.matrix.org");

      // Value should be updated
      await expect(page.getByLabel("Homeserver")).toHaveValue("https://example.matrix.org");
    });

    test("should handle form input correctly", async ({ page }) => {
      await page.goto("/");

      // Fill out form fields
      await page.getByLabel("Username").fill("testuser");
      await page.getByLabel("Password").fill("testpassword");

      // Values should be set
      await expect(page.getByLabel("Username")).toHaveValue("testuser");
      await expect(page.getByLabel("Password")).toHaveValue("testpassword");
    });
  });

  test.describe("Demo Mode Authentication", () => {
    test("should enable demo mode successfully", async ({ page }) => {
      await page.goto("/");

      // Click demo mode button
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Should navigate to authenticated state
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByRole("link", { name: "🔌 Plugins" })).toBeVisible();

      // Should show demo user info
      await expect(page.getByText("Alice Smith")).toBeVisible();
    });

    test("should show demo rooms in sidebar", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Check for demo rooms
      await expect(page.getByText("General Discussion")).toBeVisible();
      await expect(page.getByText("Development Team")).toBeVisible();
      await expect(page.getByText("WhatsApp Bridge")).toBeVisible();

      // Check for demo users
      await expect(page.getByText("Alice Smith")).toBeVisible();
      await expect(page.getByText("Bob Wilson")).toBeVisible();
    });

    test("should display welcome message initially", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Should show welcome message when no room selected
      await expect(page.getByRole("heading", { name: "Welcome to Operator" })).toBeVisible();
      await expect(page.getByText("Select a room from the sidebar to start chatting")).toBeVisible();
      await expect(page.getByText("Or explore the plugins tab to set up automations")).toBeVisible();
    });

    test("should persist demo authentication across page reloads", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Reload page
      await page.reload();

      // Should still be authenticated
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByText("Alice Smith")).toBeVisible();
    });
  });

  test.describe("Authentication State Management", () => {
    test("should show unauthenticated state initially", async ({ page }) => {
      await page.goto("/");

      // Should show login form
      await expect(page.getByLabel("Username")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();

      // Should not show authenticated UI
      await expect(page.getByRole("link", { name: "🔌 Plugins" })).not.toBeVisible();
    });

    test("should handle plugins page access without authentication", async ({ page }) => {
      await page.goto("/plugins");

      // Should show login required message
      await expect(page.getByRole("heading", { name: "Plugin Access" })).toBeVisible();
      await expect(page.getByText("Please log in to access and configure plugins")).toBeVisible();

      // Should show login form
      await expect(page.getByLabel("Username")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
    });

    test("should allow demo login from plugins page", async ({ page }) => {
      await page.goto("/plugins");

      // Click demo mode from plugins page
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Should show plugins interface
      await expect(page.getByRole("heading", { name: "Operator Plugins" })).toBeVisible();
      await expect(page.getByText("Extend your Matrix experience with powerful automation")).toBeVisible();
    });
  });

  test.describe("Navigation After Authentication", () => {
    test("should allow navigation to plugins page after demo login", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Navigate to plugins
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Should be on plugins page
      await expect(page).toHaveURL("/plugins");
      await expect(page.getByRole("heading", { name: "Operator Plugins" })).toBeVisible();
    });

    test("should allow returning to chat from plugins", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Return to chat
      await page.getByRole("link", { name: "← Back to Chat" }).click();

      // Should be back to main chat
      await expect(page).toHaveURL("/");
      await expect(page.getByRole("heading", { name: "Welcome to Operator" })).toBeVisible();
    });
  });

  test.describe("Guest Login (Placeholder)", () => {
    test("should show guest login button", async ({ page }) => {
      await page.goto("/");

      // Guest login button should be visible
      await expect(page.getByRole("button", { name: "Guest Login" })).toBeVisible();
    });

    test("should handle guest login click (placeholder behavior)", async ({ page }) => {
      await page.goto("/");

      // Click guest login
      await page.getByRole("button", { name: "Guest Login" }).click();

      // Should remain on login page (placeholder implementation)
      await expect(page.getByLabel("Username")).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should not crash on invalid credentials attempt", async ({ page }) => {
      await page.goto("/");

      // Fill invalid credentials
      await page.getByLabel("Username").fill("invalid");
      await page.getByLabel("Password").fill("invalid");

      // Try to login
      await page.getByRole("button", { name: "Login" }).click();

      // Should not crash the app
      await expect(page.getByLabel("Username")).toBeVisible();

      // Form should still be functional
      await expect(page.getByLabel("Username")).toHaveValue("invalid");
    });

    test("should handle rapid demo mode clicks", async ({ page }) => {
      await page.goto("/");

      // Rapidly click demo mode
      const demoButton = page.getByRole("button", { name: "🚀 Demo Mode (Development)" });
      await demoButton.click();
      await demoButton.click();
      await demoButton.click();

      // Should still work correctly
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByText("Alice Smith")).toBeVisible();
    });
  });
});
