# Operator - A Matrix Client Framework

<div align="center">

![Operator Logo](https://img.shields.io/badge/Matrix-Operator-000000?style=for-the-badge&logo=matrix&logoColor=white)

**A modern, plugin-first Matrix frontend framework for building customizable chat clients with deep automation and bridge integration.**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Matrix](https://img.shields.io/badge/Matrix-JS--SDK-green?style=flat-square&logo=matrix)](https://matrix.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#features) • [Getting Started](#getting-started) • [Plugin Development](#plugin-development) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 🚀 What is Operator?

**Operator** is not just another Matrix client – it's a comprehensive **framework** for building next-generation Matrix applications. While clients like Element focus on providing a complete chat experience, Operator empowers developers to create specialized Matrix interfaces tailored to specific workflows, integrations, and automation needs.

### 🎯 Core Philosophy

- **Framework over Application**: Build your own Matrix experience
- **Automation-First**: Deep integration with bridges and external services  
- **Plugin Architecture**: Extend functionality without touching core code
- **Modern Stack**: Built with Next.js 14, TypeScript, and cutting-edge tooling
- **Bridge-Native**: First-class support for WhatsApp, Telegram, Discord bridges

## ✨ Features

### 🔌 Plugin System
- **Extensible Architecture**: Add custom message renderers, input extensions, sidebar panels
- **Hot-Reloadable**: Develop plugins with instant feedback
- **Type-Safe**: Full TypeScript support with Zod validation
- **Sandboxed**: Secure plugin execution environment

### 🌉 Bridge Integration Hub
- **Unified Management**: Control multiple bridges from one interface
- **Status Monitoring**: Real-time bridge health and connectivity
- **Cross-Platform Messaging**: Seamless communication across platforms
- **Bridge-Specific Features**: Custom UI for each bridge type

### 🤖 Automation Engine
- **Workflow Builder**: Create complex automation sequences
- **Event-Driven**: React to messages, room changes, and external triggers
- **Cross-Bridge Actions**: Automate actions across different platforms
- **Scheduled Tasks**: Time-based automation support

### 💎 Modern Architecture
- **Next.js 14**: Latest React features with App Router
- **TypeScript**: Full type safety across the entire stack
- **Tailwind CSS + shadcn/ui**: Beautiful, consistent design system
- **Jotai**: Reactive state management
- **Zod**: Runtime type validation

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **Bun** (recommended) or npm/yarn
- **Matrix homeserver** access

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/operator.git
cd operator

# Install dependencies
bun install

# Start development server
bun dev

# Open http://localhost:3000
```

### Demo Mode

For immediate exploration, use the built-in demo mode:

1. Open `http://localhost:3000`
2. Click **"🚀 Demo Mode (Development)"**
3. Explore the interface with pre-populated rooms and messages

### Matrix Setup

For real Matrix connectivity:

1. Get your Matrix credentials from your homeserver
2. Use the login form with your `@username:homeserver.org` and password
3. Or try guest access for supported homeservers

## 🔧 Project Structure

```
operator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── chat/              # Chat interface
│   │   └── settings/          # Configuration
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── chat/              # Chat interface components
│   │   ├── auth/              # Authentication forms
│   │   └── plugins/           # Plugin-related components
│   ├── lib/
│   │   ├── matrix/            # Matrix client wrapper
│   │   ├── store/             # Jotai state management
│   │   ├── plugins/           # Plugin system
│   │   └── bridges/           # Bridge integrations
│   ├── plugins/               # Plugin directory
│   ├── schemas/               # Zod validation schemas
│   └── types/                 # TypeScript definitions
└── docs/                      # Documentation
```

## 🔌 Plugin Development

### Creating Your First Plugin

```typescript
// plugins/my-plugin/index.tsx
import { Plugin } from '@/lib/plugins/types';

const MyPlugin: Plugin = {
  id: 'my-awesome-plugin',
  name: 'My Awesome Plugin',
  version: '1.0.0',
  type: 'message-renderer',
  
  hooks: {
    onMessageRender: (message) => {
      if (message.content.body.includes('urgent')) {
        return <div className="bg-red-100 p-2">{message.content.body}</div>;
      }
      return null;
    }
  }
};

export default MyPlugin;
```

### Plugin Types

- **Message Renderers**: Custom message display logic
- **Input Extensions**: Additional input toolbar buttons
- **Sidebar Panels**: New tabs in the sidebar
- **Settings Pages**: Configuration interfaces
- **Automations**: Background tasks and workflows

### Plugin API

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  hooks: PluginHooks;
  settings?: PluginSettings;
  permissions?: string[];
}
```

## 🌉 Bridge Configuration

### WhatsApp Bridge Example

```typescript
// Configure WhatsApp bridge
const whatsappConfig = {
  enabled: true,
  webhook_url: 'https://your-bridge.com/webhook',
  phone_number: '+1234567890',
  display_name: 'WhatsApp Bridge'
};
```

### Supported Bridges

- **WhatsApp** (mautrix-whatsapp)
- **Telegram** (mautrix-telegram) 
- **Discord** (mautrix-discord)
- **Signal** (mautrix-signal)

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 14 | React framework with App Router |
| **Language** | TypeScript | Type safety and developer experience |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui | High-quality React components |
| **State Management** | Jotai | Reactive state management |
| **Validation** | Zod | Runtime type validation |
| **Matrix SDK** | matrix-js-sdk | Matrix protocol implementation |
| **Package Manager** | Bun | Fast JavaScript runtime and package manager |

## 🗺 Roadmap

### Phase 1: Core Chat (✅ Complete)
- [x] Matrix client integration
- [x] Basic chat interface
- [x] Authentication system
- [x] Message display and sending

### Phase 2: Plugin System (🚧 In Progress)
- [ ] Plugin loader and registry
- [ ] Plugin API design
- [ ] Example plugins
- [ ] Plugin marketplace

### Phase 3: Bridge Support (📋 Planned)
- [ ] WhatsApp bridge integration
- [ ] Multi-bridge management
- [ ] Bridge status monitoring
- [ ] Cross-platform messaging

### Phase 4: Automation (📋 Planned)
- [ ] Workflow builder
- [ ] Event system
- [ ] Scheduled tasks
- [ ] External integrations

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone and setup
git clone https://github.com/your-org/operator.git
cd operator
bun install

# Start development
bun dev

# Run tests
bun test

# Lint code
bun lint
```

### Code Style

- **TypeScript** for all code
- **ESLint + Prettier** for formatting
- **Conventional Commits** for commit messages
- **Zod schemas** for all data validation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Matrix.org** for the open protocol
- **Element** for inspiration and Matrix ecosystem leadership
- **shadcn/ui** for the excellent component library
- **Next.js team** for the amazing React framework

---

<div align="center">

**[Documentation](docs/) • [Plugin API](docs/plugins.md) • [Bridge Setup](docs/bridges.md) • [Discord](https://discord.gg/operator)**

</div>
