import { test, expect } from "@playwright/test";

test.describe("Performance and Accessibility Tests", () => {
  test.describe("Page Load Performance", () => {
    test("should load home page within reasonable time", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds (generous for CI environments)
      expect(loadTime).toBeLessThan(10000);

      // Essential elements should be visible
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByText("Matrix Frontend Framework")).toBeVisible();
    });

    test("should load plugins page efficiently", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/plugins");
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);

      // Login form should be visible
      await expect(page.getByRole("heading", { name: "Plugin Access" })).toBeVisible();
    });

    test("should handle demo mode activation quickly", async ({ page }) => {
      await page.goto("/");

      const startTime = Date.now();
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Wait for authenticated interface
      await expect(page.getByText("Alice Smith")).toBeVisible();

      const activationTime = Date.now() - startTime;

      // Demo mode should activate quickly (within 5 seconds)
      expect(activationTime).toBeLessThan(5000);
    });
  });

  test.describe("Bundle Size and Resources", () => {
    test("should not load excessive resources", async ({ page }) => {
      const resourceSizes: number[] = [];

      page.on("response", async (response) => {
        if (response.url().includes("localhost:3000")) {
          try {
            const body = await response.body();
            resourceSizes.push(body.length);
          } catch {
            // Some resources might not be readable, that's OK
          }
        }
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Should have loaded some resources
      expect(resourceSizes.length).toBeGreaterThan(0);

      // Individual resources shouldn't be excessively large
      const largeResources = resourceSizes.filter((size) => size > 5 * 1024 * 1024); // 5MB
      expect(largeResources.length).toBe(0);
    });
  });

  test.describe("Memory and Console Errors", () => {
    test("should not have console errors on page load", async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Wait a bit for any delayed errors
      await page.waitForTimeout(2000);

      // Filter out non-critical errors (dev tools, extensions, etc.)
      const criticalErrors = errors.filter(
        (error) =>
          !error.includes("DevTools") &&
          !error.includes("Extension") &&
          !error.includes("chrome-extension") &&
          !error.includes("Warning:")
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test("should not have console errors during demo mode activation", async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.waitForTimeout(3000);

      const criticalErrors = errors.filter(
        (error) =>
          !error.includes("DevTools") &&
          !error.includes("Extension") &&
          !error.includes("chrome-extension") &&
          !error.includes("Warning:")
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile viewports", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Main elements should still be visible and usable
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByText("Matrix Frontend Framework")).toBeVisible();
      await expect(page.getByRole("button", { name: "🚀 Demo Mode (Development)" })).toBeVisible();
    });

    test("should work on tablet viewports", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");

      // All elements should be properly visible
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Development Status" })).toBeVisible();
      await expect(page.getByRole("link", { name: "🔌 Explore Plugins" })).toBeVisible();
    });

    test("should handle mobile navigation in demo mode", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      // Should show authenticated interface
      await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
      await expect(page.getByText("Alice Smith")).toBeVisible();

      // Should be able to navigate to plugins
      await page.getByRole("link", { name: "🔌 Plugins" }).click();
      await expect(page.getByRole("heading", { name: "Operator Plugins" })).toBeVisible();
    });
  });

  test.describe("Accessibility (Basic)", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      await page.goto("/");

      // Check for proper heading structure
      const h1 = page.locator("h1");
      await expect(h1).toBeVisible();

      // Should have h1 with "Operator"
      await expect(page.getByRole("heading", { level: 1, name: "Operator" })).toBeVisible();
    });

    test("should have accessible form elements", async ({ page }) => {
      await page.goto("/");

      // Form elements should have proper labels
      await expect(page.getByLabel("Homeserver")).toBeVisible();
      await expect(page.getByLabel("Username")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();

      // Buttons should have accessible names
      await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Guest Login" })).toBeVisible();
    });

    test("should have accessible links", async ({ page }) => {
      await page.goto("/");

      // Links should have accessible names
      await expect(page.getByRole("link", { name: "🔌 Explore Plugins" })).toBeVisible();
    });

    test("should maintain focus management", async ({ page }) => {
      await page.goto("/");

      // Tab through form elements
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Focus should be manageable
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(["INPUT", "BUTTON", "A"].includes(focusedElement || "")).toBe(true);
    });
  });

  test.describe("Plugin Performance", () => {
    test("should load plugin interface efficiently", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();

      const startTime = Date.now();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Wait for plugins page to load
      await expect(page.getByRole("heading", { name: "Operator Plugins" })).toBeVisible();

      const loadTime = Date.now() - startTime;

      // Plugin navigation should be fast
      expect(loadTime).toBeLessThan(3000);
    });

    test("should handle plugin tab switching efficiently", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "🚀 Demo Mode (Development)" }).click();
      await page.getByRole("link", { name: "🔌 Plugins" }).click();

      // Test rapid tab switching
      const startTime = Date.now();

      await page.getByRole("tab", { name: "Make.com Integration" }).click();
      await expect(page.getByRole("heading", { name: "Make.com Integration" })).toBeVisible();

      await page.getByRole("tab", { name: "Settings" }).click();
      await expect(page.getByRole("heading", { name: "Plugin Settings" })).toBeVisible();

      await page.getByRole("tab", { name: "Overview" }).click();
      await expect(page.getByRole("heading", { name: "Operator Plugins" })).toBeVisible();

      const switchingTime = Date.now() - startTime;

      // Tab switching should be very fast
      expect(switchingTime).toBeLessThan(2000);
    });
  });

  test.describe("Network Efficiency", () => {
    test("should not make excessive network requests", async ({ page }) => {
      const requestUrls: string[] = [];

      page.on("request", (request) => {
        requestUrls.push(request.url());
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Should make reasonable number of requests
      expect(requestUrls.length).toBeLessThan(50);

      // Should not have duplicate requests for same resources
      const uniqueUrls = new Set(requestUrls);
      const duplicateRequests = requestUrls.length - uniqueUrls.size;
      expect(duplicateRequests).toBeLessThan(5); // Allow some duplicates for development
    });
  });
});
