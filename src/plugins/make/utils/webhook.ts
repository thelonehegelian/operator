import { WebhookPayload, WebhookResponse, MakeSettings } from "../schema";

export class MakeWebhookClient {
  private settings: MakeSettings;

  constructor(settings: MakeSettings) {
    this.settings = settings;
  }

  /**
   * Trigger a Make.com webhook with retry logic
   */
  async triggerWebhook(webhookUrl: string, payload: WebhookPayload): Promise<WebhookResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.settings.retryAttempts; attempt++) {
      try {
        if (this.settings.logWebhookCalls) {
          console.log(`[Make Plugin] Triggering webhook (attempt ${attempt}):`, {
            url: this.sanitizeUrl(webhookUrl),
            service: payload.service,
            roomId: payload.roomId,
          });
        }

        const response = await this.makeWebhookRequest(webhookUrl, payload);

        if (response.ok) {
          const data = await response.json().catch(() => ({}));

          if (this.settings.logWebhookCalls) {
            console.log(`[Make Plugin] Webhook success:`, data);
          }

          return {
            success: true,
            message: data.message || "Webhook triggered successfully",
            data,
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error as Error;

        if (this.settings.logWebhookCalls) {
          console.error(`[Make Plugin] Webhook attempt ${attempt} failed:`, error);
        }

        // Don't retry on the last attempt
        if (attempt < this.settings.retryAttempts) {
          await this.delay(this.settings.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All attempts failed
    const errorMessage = `Webhook failed after ${this.settings.retryAttempts} attempts: ${lastError?.message}`;

    if (this.settings.logWebhookCalls) {
      console.error(`[Make Plugin] ${errorMessage}`);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  /**
   * Make the actual HTTP request to the webhook
   */
  private async makeWebhookRequest(url: string, payload: WebhookPayload): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.settings.webhookTimeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Operator-Make-Plugin/1.0.0",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Webhook request timed out after ${this.settings.webhookTimeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Sanitize webhook URL for logging (hide sensitive parts)
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");

      // Hide the webhook token (usually the last part of the path)
      if (pathParts.length > 1) {
        pathParts[pathParts.length - 1] = "***";
      }

      return `${urlObj.protocol}//${urlObj.host}${pathParts.join("/")}`;
    } catch {
      return "***invalid-url***";
    }
  }

  /**
   * Simple delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Legacy function to maintain compatibility with existing Trello implementation
 */
export async function triggerMakeWebhook(
  taskName: string,
  taskDescription: string,
  webhookUrl?: string
): Promise<void> {
  if (!webhookUrl) {
    const envWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!envWebhookUrl) {
      console.error("MAKE_WEBHOOK_URL environment variable not set. Cannot trigger webhook.");
      return;
    }
    webhookUrl = envWebhookUrl;
  }

  try {
    const url = new URL(webhookUrl);
    url.searchParams.append("taskName", taskName);
    url.searchParams.append("taskDescription", taskDescription);

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    if (!response.ok) {
      console.error(`Error triggering Make webhook: HTTP status ${response.status}`);
    } else {
      console.log(`Successfully triggered Make webhook for task: ${taskName}`);
    }
  } catch (error) {
    console.error("Error triggering Make webhook: Network or other error occurred.");
  }
}
