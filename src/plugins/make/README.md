# Make.com Integration Plugin

A comprehensive plugin for **Operator** that provides flexible automation through Make.com webhooks with pattern-based message parsing and multi-service support.

## 🚀 Overview

This plugin transforms your Matrix chat into a powerful automation hub by:
- **Pattern-based parsing** of chat messages
- **Flexible webhook triggers** to Make.com scenarios  
- **Pre-built templates** for popular services (Trello, Gmail, Google Sheets, etc.)
- **Backward compatibility** with existing Trello implementation
- **Extensible architecture** for custom workflows

## 📋 Features

### ✅ **Implemented (Phase 2)**
- **Trello Integration**: Create cards from `Task:` and `Description:` format
- **Generic webhook client** with retry logic and error handling
- **Message pattern parser** supporting regex-based extraction
- **Service templates** for 6+ popular integrations
- **Plugin UI** with configuration interface
- **Legacy compatibility** with existing implementation

### 🔄 **In Development**
- Webhook configuration UI
- Per-room webhook settings
- Template customization
- Webhook history and logs

### ⏳ **Planned**
- Visual workflow builder
- Conditional triggers
- Multi-step automations
- Webhook response handling

## 🏗️ Architecture

```
src/plugins/make/
├── index.tsx              # Main plugin component & UI
├── plugin.json           # Plugin metadata & configuration
├── types.ts              # TypeScript type definitions
├── schema.ts             # Zod validation schemas
├── utils/
│   ├── webhook.ts        # Webhook client & HTTP handling
│   ├── parsers.ts        # Message parsing & pattern matching
│   ├── templates.ts      # Pre-built service templates
│   └── legacy.ts         # Backward compatibility functions
└── README.md             # This documentation
```

## 🚀 Quick Start

### 1. **Trello Integration (Ready to Use)**

Based on your existing implementation - works immediately:

1. **Set environment variable:**
   ```bash
   MAKE_WEBHOOK_URL=https://hook.integromat.com/your-webhook-url
   ```

2. **Send a message in any room:**
   ```
   Task: Fix the login bug
   Description: Users cannot authenticate with their Matrix credentials
   ```

3. **Get automatic confirmation:**
   ```
   🤖 Make Automation: Task Created in Trello
   ```

### 2. **Enable the Plugin**

1. Go to `http://localhost:3000/plugins`
2. Click "🤖 Make.com Integration" 
3. Configure your webhooks and templates

## 📝 Service Templates

### **🔷 Trello** (Ready)
- **Pattern**: `Task: ... Description: ...`
- **Creates**: Trello cards with title and description
- **Status**: ✅ Production ready

### **📧 Gmail** (Template Available)
- **Pattern**: `@make gmail to:email subject:text body:text`
- **Action**: Send emails via Gmail
- **Status**: 🔄 Template ready, needs webhook configuration

### **📊 Google Sheets** (Template Available)  
- **Pattern**: `#expense $amount description`
- **Action**: Add rows to expense tracking sheet
- **Status**: 🔄 Template ready, needs webhook configuration

### **💬 Slack** (Template Available)
- **Pattern**: `@slack #channel message`
- **Action**: Cross-post to Slack channels
- **Status**: 🔄 Template ready, needs webhook configuration

### **📅 Calendar** (Template Available)
- **Pattern**: `@calendar event at time on date`
- **Action**: Create calendar events
- **Status**: 🔄 Template ready, needs webhook configuration

### **🔧 Custom** (Template Available)
- **Pattern**: `@make action data`
- **Action**: Trigger custom Make.com scenarios
- **Status**: 🔄 Fully customizable

## 🔧 Configuration

### **Plugin Settings**
```typescript
{
  globalEnabled: true,           // Enable/disable plugin globally
  defaultBotReply: true,         // Send confirmation messages
  botReplyPrefix: "🤖 Make Automation: ",
  errorNotifications: true,      // Notify on webhook failures
  webhookTimeout: 5000,         // HTTP timeout (ms)
  retryAttempts: 3,             // Retry failed webhooks
  retryDelay: 1000,             // Delay between retries (ms)
  logWebhookCalls: true         // Log webhook activity
}
```

### **Message Parsers**
Each parser extracts data using regex patterns:

```typescript
{
  id: "trello-task",
  name: "Trello Task Parser", 
  pattern: "(?:^|\\n)Task:\\s*(.+)(?:\\n.*?)?(?:^|\\n)Description:\\s*(.+)",
  extractionMap: {
    "taskName": "1",      // First capture group
    "taskDescription": "2" // Second capture group
  },
  service: "trello",
  enabled: true
}
```

### **Webhooks**
Each webhook defines how to trigger Make.com scenarios:

```typescript
{
  id: "trello-webhook-123",
  name: "Trello Task Creator",
  url: "https://hook.integromat.com/...",
  service: "trello",
  trigger: "pattern",
  pattern: "Task:.*Description:",
  enabled: true,
  roomId: "!room:matrix.org",     // Optional: room-specific
  triggerCount: 45,               // Usage statistics
  lastTriggered: "2024-01-15T..."
}
```

## 🔗 Integration Guide

### **Creating Make.com Scenarios**

1. **Create a webhook trigger** in your Make.com scenario
2. **Configure the webhook URL** in Operator
3. **Set up your desired actions** (Trello, Gmail, etc.)
4. **Test with sample messages** in Matrix

### **Custom Pattern Examples**

**Bug Reports:**
```javascript
pattern: "#bug\\s+(.+)\\s+priority:(low|medium|high)"
extractionMap: { "description": "1", "priority": "2" }
```

**Meeting Scheduler:**
```javascript  
pattern: "@schedule\\s+(.+)\\s+with\\s+(.+)\\s+on\\s+(\\d{4}-\\d{2}-\\d{2})"
extractionMap: { "title": "1", "attendees": "2", "date": "3" }
```

**Expense Tracking:**
```javascript
pattern: "#expense\\s+\\$([\\d.]+)\\s+(.+)\\s+category:(\\w+)"
extractionMap: { "amount": "1", "description": "2", "category": "3" }
```

## 🛠️ Development

### **Adding New Service Templates**

1. **Create template in `templates.ts`:**
```typescript
{
  id: 'new-service',
  name: 'New Service Integration',
  service: 'custom',
  description: 'Integration with new service',
  icon: '🆕',
  defaultParser: { /* parser config */ },
  webhookTemplate: { /* webhook config */ },
  sampleMessage: 'Example message format',
  expectedOutput: 'What this integration does'
}
```

2. **Add to service type enum:**
```typescript
export type MakeServiceType = 
  | 'trello' 
  | 'gmail'
  | 'new-service'  // Add here
  | 'custom';
```

### **Testing Patterns**

Use the built-in pattern tester:

```typescript
import { testParser, validatePattern } from './utils/parsers';

const result = testParser(parser, "Test message here");
console.log(result.matches, result.extractedData);
```

## 🐛 Troubleshooting

### **Webhook Not Triggering**
- ✅ Check `MAKE_WEBHOOK_URL` environment variable
- ✅ Verify message matches the expected pattern
- ✅ Check plugin is enabled in settings
- ✅ Look for error messages in console

### **Pattern Not Matching**
- ✅ Test regex pattern with online tools
- ✅ Check for case sensitivity issues
- ✅ Verify capture groups are numbered correctly
- ✅ Use the pattern validation utility

### **Make.com Scenario Issues**
- ✅ Verify webhook URL is correct
- ✅ Check Make.com scenario is active
- ✅ Test webhook manually with Postman/curl
- ✅ Review Make.com execution logs

## 📊 Compatibility

### **Matrix SDK Integration**
- ✅ Full compatibility with `matrix-js-sdk`
- ✅ Event listener management
- ✅ Room-specific and global triggers
- ✅ Message filtering and deduplication

### **Operator Framework**
- ✅ Jotai state management integration
- ✅ Plugin lifecycle management
- ✅ UI component integration
- ✅ Authentication handling

### **Legacy Support**
- ✅ Full backward compatibility with existing Trello implementation
- ✅ Same `triggerMakeWebhook()` function signature
- ✅ Identical message parsing behavior
- ✅ Environment variable compatibility

## 🚀 Future Enhancements

### **Phase 3 Roadmap**
- **Visual workflow builder** for non-technical users
- **Conditional logic** (if/then/else in patterns)
- **Multi-step workflows** with chained webhooks  
- **Template marketplace** for sharing configurations

### **Advanced Features**
- **Webhook response handling** for bidirectional workflows
- **Rate limiting** and quota management
- **Webhook authentication** (API keys, OAuth)
- **Message queuing** for reliability

## 📈 Performance

- **Lightweight**: Minimal impact on Matrix client performance
- **Efficient**: Pattern matching optimized for real-time messages
- **Scalable**: Supports hundreds of concurrent webhooks
- **Reliable**: Built-in retry logic and error handling

---

**Built for Operator Matrix Frontend Framework**  
**Phase 2 - Plugin System Implementation**  
**Version 1.0.0** 