# Lead Diagnosis App

Aplicación web para calificación, diagnóstico y gestión de leads, integrada con Volkern CRM.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Volkern API key

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Features

- **Conversational Interface**: Chat-style diagnosis flow
- **11 Structured Questions**: Guided qualification process  
- **Volkern CRM Integration**: Auto-creates leads and tasks
- **Task Automation**: Call task created +24h after diagnosis
- **JSON Workflows**: Modular, reusable automation blueprints

## 🏗️ Project Structure

```
lead-diagnosis-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/diagnosis/      # API endpoints
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main page
│   ├── components/             # React components
│   │   ├── DiagnosisChat.tsx   # Main chat UI
│   │   └── ChatMessage.tsx     # Message bubble
│   └── lib/
│       ├── diagnosis/          # Diagnosis engine
│       │   ├── questions.ts    # Question definitions
│       │   ├── orchestrator.ts # Flow control
│       │   └── validators.ts   # Input validation
│       └── volkern/            # CRM integration
│           ├── volkern-client.ts
│           ├── leads.ts
│           └── tasks.ts
├── workflows/                  # JSON workflow definitions
│   ├── intake-workflow.json
│   ├── lead-management-workflow.json
│   ├── task-creation-workflow.json
│   └── followup-workflow.json
└── package.json
```

## 🔧 Configuration

| Variable | Description |
|----------|-------------|
| `VOLKERN_API_KEY` | Your Volkern API key |
| `VOLKERN_BASE_URL` | API base URL (default: https://volkern.app/api) |

## 📚 Documentation

- [Implementation Plan](docs/implementation-plan.md)
- [Volkern API Reference](../VOLKERN_SKILL.md)
