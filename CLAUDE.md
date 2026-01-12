# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that acts as a proxy between Claude and the Flyin' Wrench Dashboard (auto shop management system). It exposes 15 tools that query the dashboard's API endpoints.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Run with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled server
npm run typecheck    # Type check without emitting
```

## Architecture

Single-file Express server (`src/server.ts`) with three layers:

1. **Tool definitions** - Array of tool names/descriptions (lines 27-43)
2. **Tool execution** - `executeTool()` switch statement mapping tools to dashboard API calls (lines 46-92)
3. **Express routes** - HTTP endpoints for health, tool listing, and tool execution (lines 94-150)

All tools proxy to the Flyin' Wrench Dashboard at `DASHBOARD_URL` via `dashboardFetch()` helper.

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/` | GET | No | Server info |
| `/mcp/tools` | GET | Yes | List available tools |
| `/mcp/call` | POST | Yes | Execute tool with `{tool, arguments}` body |

Auth uses Bearer token from `MCP_AUTH_TOKEN` env var.

## Environment Variables

- `DASHBOARD_URL` - Flyin' Wrench Dashboard URL (default: `http://74.208.170.91:3000`)
- `MCP_AUTH_TOKEN` - Bearer token for `/mcp/*` endpoints
- `PORT` - Server port (default: `3001`)

## Deployment

Deployed to Railway at `https://flyin-wrench-mcp-production.up.railway.app`. Auto-deploys on push to main.

## Adding New Tools

1. Add tool definition to `tools` array with `name` and `description`
2. Add case to `executeTool()` switch statement
3. Use `dashboardFetch()` to call dashboard API, passing `storeId` from args (defaults to "satx")
