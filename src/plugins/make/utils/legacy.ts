/**
 * Legacy webhook function for backward compatibility with existing implementation
 * Based on src/integrations/make/trello.ts
 */

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

if (!MAKE_WEBHOOK_URL) {
  console.warn("MAKE_WEBHOOK_URL environment variable not set. Cannot trigger Make webhook.");
}

/**
 * Trigger Make webhook for Trello task creation (legacy function)
 * Based on existing implementation - maintains exact same API
 */
export const triggerMakeWebhook = async (taskName: string, taskDescription: string): Promise<void> => {
  if (!MAKE_WEBHOOK_URL) {
    console.error("Webhook URL is not configured. Cannot trigger webhook.");
    return;
  }

  const url = new URL(MAKE_WEBHOOK_URL);
  url.searchParams.append("taskName", taskName);
  url.searchParams.append("taskDescription", taskDescription);

  try {
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
};

/**
 * Parse task and description from message text (from existing implementation)
 */
export interface ParsedTask {
  taskName: string | null;
  taskDescription: string | null;
}

export const parseTaskAndDescription = (text: string): ParsedTask => {
  const taskMatch = text.match(/^Task:\\s*(.*)$/im);
  const descriptionMatch = text.match(/^Description:\\s*(.*)$/im);

  const taskName = taskMatch ? taskMatch[1].trim() : null;
  const taskDescription = descriptionMatch ? descriptionMatch[1].trim() : null;

  if (!taskName && !taskDescription) {
    return { taskName: null, taskDescription: null };
  }

  return {
    taskName,
    taskDescription,
  };
};
