import { ParsedTaskData, MessageParser } from "../schema";

/**
 * Parse task and description from message text (from existing implementation)
 */
export function parseTaskAndDescription(text: string): ParsedTaskData {
  const taskMatch = text.match(/^Task:\s*(.*)$/im);
  const descriptionMatch = text.match(/^Description:\s*(.*)$/im);

  const taskName = taskMatch ? taskMatch[1].trim() : null;
  const taskDescription = descriptionMatch ? descriptionMatch[1].trim() : null;

  // Return null for both if neither is found
  if (!taskName && !taskDescription) {
    return { taskName: null, taskDescription: null };
  }

  return {
    taskName,
    taskDescription,
  };
}

/**
 * Generic message parser that can handle various patterns and extract data
 */
export class MessagePatternParser {
  private parsers: MessageParser[];

  constructor(parsers: MessageParser[]) {
    this.parsers = parsers.filter((p) => p.enabled);
  }

  /**
   * Parse a message using all enabled parsers
   */
  parseMessage(
    text: string,
    service?: string
  ): Array<{
    parser: MessageParser;
    extractedData: Record<string, string>;
  }> {
    const results: Array<{
      parser: MessageParser;
      extractedData: Record<string, string>;
    }> = [];

    for (const parser of this.parsers) {
      // Filter by service if specified
      if (service && parser.service !== service) {
        continue;
      }

      const extractedData = this.applyParser(text, parser);
      if (extractedData && Object.keys(extractedData).length > 0) {
        results.push({
          parser,
          extractedData,
        });
      }
    }

    return results;
  }

  /**
   * Apply a single parser to extract data from text
   */
  private applyParser(text: string, parser: MessageParser): Record<string, string> | null {
    try {
      const regex = new RegExp(parser.pattern, "im");
      const match = text.match(regex);

      if (!match) {
        return null;
      }

      const extractedData: Record<string, string> = {};

      // Map capture groups to extraction map
      for (const [key, groupIndex] of Object.entries(parser.extractionMap)) {
        const index = parseInt(groupIndex, 10);
        if (match[index]) {
          extractedData[key] = match[index].trim();
        }
      }

      return extractedData;
    } catch (error) {
      console.error(`[Make Plugin] Error applying parser ${parser.id}:`, error);
      return null;
    }
  }

  /**
   * Check if any parser would match the given text
   */
  hasMatch(text: string, service?: string): boolean {
    return this.parseMessage(text, service).length > 0;
  }

  /**
   * Get the first matching parser for a message
   */
  getFirstMatch(
    text: string,
    service?: string
  ): {
    parser: MessageParser;
    extractedData: Record<string, string>;
  } | null {
    const results = this.parseMessage(text, service);
    return results.length > 0 ? results[0] : null;
  }
}

/**
 * Built-in parsers for common services
 */
export const DEFAULT_PARSERS: MessageParser[] = [
  // Trello task parser (from existing implementation)
  {
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

  // Simple task parser (just task name)
  {
    id: "trello-simple-task",
    name: "Simple Trello Task",
    pattern: "^Task:\\s*(.+)$",
    extractionMap: {
      taskName: "1",
      taskDescription: "", // Will be empty
    },
    service: "trello",
    enabled: true,
  },

  // Gmail parser
  {
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

  // Google Sheets parser
  {
    id: "sheets-add-row",
    name: "Google Sheets Add Row",
    pattern: "#expense\\s+\\$([\\d.]+)\\s+(.+)",
    extractionMap: {
      amount: "1",
      description: "2",
    },
    service: "google-sheets",
    enabled: true,
  },

  // Generic command parser
  {
    id: "make-command",
    name: "Generic Make Command",
    pattern: "@make\\s+(\\w+)\\s+(.+)",
    extractionMap: {
      service: "1",
      parameters: "2",
    },
    service: "custom",
    enabled: true,
  },
];

/**
 * Validate a regex pattern
 */
export function validatePattern(pattern: string): { valid: boolean; error?: string } {
  try {
    new RegExp(pattern);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid regex pattern",
    };
  }
}

/**
 * Test a parser against sample text
 */
export function testParser(
  parser: MessageParser,
  sampleText: string
): {
  matches: boolean;
  extractedData?: Record<string, string>;
  error?: string;
} {
  try {
    const patternParser = new MessagePatternParser([parser]);
    const result = patternParser.getFirstMatch(sampleText);

    if (result) {
      return {
        matches: true,
        extractedData: result.extractedData,
      };
    } else {
      return {
        matches: false,
      };
    }
  } catch (error) {
    return {
      matches: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
