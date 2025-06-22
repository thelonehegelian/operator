import { ServiceTemplate } from "../schema";

/**
 * Pre-built service templates for common Make.com integrations
 */
export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  // Trello Integration (based on existing implementation)
  {
    id: "trello-task-creator",
    name: "Trello Task Creator",
    service: "trello",
    description: "Create Trello cards from chat messages using Task: and Description: format",
    icon: "📋",
    defaultParser: {
      id: "trello-task",
      name: "Trello Task Parser",
      pattern: "(?:^|\\n)Task:\\s*(.+)(?:\\n.*?)?(?:^|\\n)Description:\\s*(.+)",
      extractionMap: {
        taskName: "1",
        taskDescription: "2",
      },
      service: "trello",
      enabled: true,
    },
    webhookTemplate: {
      name: "Trello Task Creator",
      service: "trello",
      trigger: "pattern",
      pattern: "(?:^|\\n)Task:\\s*(.+)(?:\\n.*?)?(?:^|\\n)Description:\\s*(.+)",
      enabled: true,
      triggerCount: 0,
    },
    sampleMessage: `Task: Fix login bug
Description: Users are unable to authenticate with their credentials`,
    expectedOutput:
      'Creates a new Trello card with title "Fix login bug" and description "Users are unable to authenticate with their credentials"',
  },

  // Gmail Integration
  {
    id: "gmail-sender",
    name: "Gmail Sender",
    service: "gmail",
    description: "Send emails via Gmail using @make gmail commands",
    icon: "📧",
    defaultParser: {
      id: "gmail-send",
      name: "Gmail Send Parser",
      pattern: "@make\\s+gmail\\s+to:([\\w@.-]+)\\s+subject:(.+?)(?:\\s+body:(.+))?$",
      extractionMap: {
        to: "1",
        subject: "2",
        body: "3",
      },
      service: "gmail",
      enabled: true,
    },
    webhookTemplate: {
      name: "Gmail Sender",
      service: "gmail",
      trigger: "pattern",
      pattern: "@make\\s+gmail\\s+to:([\\w@.-]+)\\s+subject:(.+?)(?:\\s+body:(.+))?$",
      enabled: true,
      triggerCount: 0,
    },
    sampleMessage:
      "@make gmail to:team@company.com subject:Meeting Notes body:Here are the notes from today's meeting...",
    expectedOutput: "Sends an email to team@company.com with the specified subject and body",
  },

  // Google Sheets Integration
  {
    id: "sheets-expense-tracker",
    name: "Expense Tracker",
    service: "google-sheets",
    description: "Track expenses by adding rows to Google Sheets",
    icon: "📊",
    defaultParser: {
      id: "sheets-expense",
      name: "Expense Parser",
      pattern: "#expense\\s+\\$([\\d.]+)\\s+(.+)",
      extractionMap: {
        amount: "1",
        description: "2",
      },
      service: "google-sheets",
      enabled: true,
    },
    webhookTemplate: {
      name: "Expense Tracker",
      service: "google-sheets",
      trigger: "pattern",
      pattern: "#expense\\s+\\$([\\d.]+)\\s+(.+)",
      enabled: true,
      triggerCount: 0,
    },
    sampleMessage: "#expense $45.60 lunch with client",
    expectedOutput: "Adds a new row to your expense tracking spreadsheet with the amount and description",
  },

  // Slack Cross-posting
  {
    id: "slack-crosspost",
    name: "Slack Cross-poster",
    service: "slack",
    description: "Cross-post messages to Slack channels",
    icon: "💬",
    defaultParser: {
      id: "slack-post",
      name: "Slack Post Parser",
      pattern: "@slack\\s+(#\\w+)\\s+(.+)",
      extractionMap: {
        channel: "1",
        message: "2",
      },
      service: "slack",
      enabled: true,
    },
    webhookTemplate: {
      name: "Slack Cross-poster",
      service: "slack",
      trigger: "pattern",
      pattern: "@slack\\s+(#\\w+)\\s+(.+)",
      enabled: true,
      triggerCount: 0,
    },
    sampleMessage: "@slack #general Check out this awesome feature we just shipped!",
    expectedOutput: "Posts the message to the specified Slack channel",
  },

  // Calendar Event Creator
  {
    id: "calendar-event-creator",
    name: "Calendar Event Creator",
    service: "calendar",
    description: "Create calendar events from chat messages",
    icon: "📅",
    defaultParser: {
      id: "calendar-event",
      name: "Calendar Event Parser",
      pattern: "@calendar\\s+(.+)\\s+at\\s+(\\d{1,2}:\\d{2}(?:AM|PM)?)\\s+on\\s+(\\d{4}-\\d{2}-\\d{2})",
      extractionMap: {
        title: "1",
        time: "2",
        date: "3",
      },
      service: "calendar",
      enabled: true,
    },
    webhookTemplate: {
      name: "Calendar Event Creator",
      service: "calendar",
      trigger: "pattern",
      pattern: "@calendar\\s+(.+)\\s+at\\s+(\\d{1,2}:\\d{2}(?:AM|PM)?)\\s+on\\s+(\\d{4}-\\d{2}-\\d{2})",
      enabled: true,
      triggerCount: 0,
    },
    sampleMessage: "@calendar Team standup at 9:00AM on 2024-01-15",
    expectedOutput: 'Creates a calendar event "Team standup" at 9:00 AM on January 15, 2024',
  },

  // Custom Webhook Template
  {
    id: "custom-webhook",
    name: "Custom Webhook",
    service: "custom",
    description: "Generic webhook for custom Make.com scenarios",
    icon: "🔧",
    defaultParser: {
      id: "custom-parser",
      name: "Custom Parser",
      pattern: "@make\\s+(\\w+)\\s+(.+)",
      extractionMap: {
        action: "1",
        data: "2",
      },
      service: "custom",
      enabled: true,
    },
    webhookTemplate: {
      name: "Custom Webhook",
      service: "custom",
      trigger: "pattern",
      pattern: "@make\\s+(\\w+)\\s+(.+)",
      enabled: true,
      triggerCount: 0,
    },
    sampleMessage: "@make deploy production branch main",
    expectedOutput: "Triggers your custom Make.com scenario with the extracted data",
  },
];

/**
 * Get a template by service type
 */
export function getTemplateByService(service: string): ServiceTemplate | undefined {
  return SERVICE_TEMPLATES.find((template) => template.service === service);
}

/**
 * Get templates by service type (multiple templates per service)
 */
export function getTemplatesByService(service: string): ServiceTemplate[] {
  return SERVICE_TEMPLATES.filter((template) => template.service === service);
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): ServiceTemplate | undefined {
  return SERVICE_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get all available services from templates
 */
export function getAvailableServices(): string[] {
  const services = new Set(SERVICE_TEMPLATES.map((template) => template.service));
  return Array.from(services);
}

/**
 * Create a webhook from a template
 */
export function createWebhookFromTemplate(
  template: ServiceTemplate,
  webhookUrl: string,
  createdBy: string,
  roomId?: string
) {
  return {
    ...template.webhookTemplate,
    id: `${template.id}-${Date.now()}`,
    url: webhookUrl,
    createdBy,
    createdAt: new Date().toISOString(),
    roomId,
  };
}

/**
 * Validate template configuration
 */
export function validateTemplate(template: ServiceTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.id) errors.push("Template ID is required");
  if (!template.name) errors.push("Template name is required");
  if (!template.service) errors.push("Template service is required");
  if (!template.defaultParser) errors.push("Default parser is required");
  if (!template.webhookTemplate) errors.push("Webhook template is required");

  // Validate parser pattern
  try {
    new RegExp(template.defaultParser.pattern);
  } catch {
    errors.push("Invalid regex pattern in default parser");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
