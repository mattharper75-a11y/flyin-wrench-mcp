# Flyin' Wrench MCP Server

MCP (Model Context Protocol) server for the Flyin' Wrench Dashboard. Enables Claude to interact directly with your auto shop management system.

## Features

| Tool | Description |
|------|-------------|
| `get_open_repair_orders` | Get all open ROs from the tech board |
| `get_repair_order` | Get details for a specific RO |
| `get_technicians` | List technicians with workload |
| `get_advisors` | List service advisors |
| `get_daily_gp` | Daily gross profit metrics |
| `get_scorecard` | Store KPIs and goals |
| `get_cache_stats` | Tekmetric API cache stats |
| `search_customer` | Search by phone/name |
| `get_checkin_queue` | Current check-in queue |
| `get_appointments` | Today's appointments |
| `get_workstations` | FWAgent workstation status |
| `get_workstation_detail` | Specific workstation info |
| `get_employees` | Employee list |
| `get_training_status` | Training completions |
| `get_server_status` | Dashboard health check |

## Deployment Options

### Option 1: Railway (Recommended)

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo
   - Select this repository

2. **Set Environment Variables in Railway**
   ```
   DASHBOARD_URL=http://74.208.170.91:3000
   MCP_AUTH_TOKEN=your-secret-token
   ```

3. **Get Your Railway URL**
   - After deploy, Railway provides a URL like: `https://flyin-wrench-mcp-production.up.railway.app`

4. **Configure Claude Code**
   ```bash
   claude mcp add --transport http flyin-wrench \
     https://YOUR-RAILWAY-URL/mcp \
     --header "Authorization: Bearer your-secret-token"
   ```

### Option 2: Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Run in stdio mode (for Claude Code)**
   ```bash
   npm run dev
   ```

4. **Add to Claude Code**
   ```bash
   claude mcp add --transport stdio flyin-wrench \
     -- npx tsx /path/to/flyin-wrench-mcp/src/server.ts
   ```

### Option 3: Run HTTP Server Locally

```bash
npm run dev -- --http
# Server runs at http://localhost:3001
```

## API Endpoints (HTTP Mode)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/mcp/tools` | GET | List available tools |
| `/mcp/call` | POST | Execute a tool |

### Example API Call

```bash
curl -X POST http://localhost:3001/mcp/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"tool": "get_server_status", "arguments": {}}'
```

## Usage in Claude Code

Once configured, ask Claude:

- "What's the status of the dashboard?"
- "Show me all open repair orders"
- "How's the daily GP looking?"
- "Search for customer with phone 210-555-1234"
- "List all workstations and their status"
- "Who are the technicians working today?"

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DASHBOARD_URL` | Flyin' Wrench Dashboard URL | `http://74.208.170.91:3000` |
| `MCP_AUTH_TOKEN` | Auth token for MCP endpoints | (none) |
| `PORT` | HTTP server port | `3001` |

## Development

```bash
# Install deps
npm install

# Run with hot reload
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## License

MIT
