import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";

// Configuration
const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://74.208.170.91:3000";
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || "";
const PORT = process.env.PORT || 3001;

// Helper to make API calls to the dashboard
async function dashboardFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${DASHBOARD_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Dashboard API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Define all available tools
const tools: Tool[] = [
  // === REPAIR ORDERS & BOARD ===
  {
    name: "get_open_repair_orders",
    description: "Get all open repair orders from the tech board. Returns RO numbers, customer info, vehicle, assigned tech, and status.",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID (e.g., 'satx', 'aus'). Defaults to 'satx'",
        },
      },
    },
  },
  {
    name: "get_repair_order",
    description: "Get details for a specific repair order by RO number",
    inputSchema: {
      type: "object",
      properties: {
        roNumber: {
          type: "string",
          description: "The repair order number",
        },
      },
      required: ["roNumber"],
    },
  },
  {
    name: "get_technicians",
    description: "Get list of all technicians with their current workload",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID (e.g., 'satx', 'aus')",
        },
      },
    },
  },
  {
    name: "get_advisors",
    description: "Get list of all service advisors",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID",
        },
      },
    },
  },

  // === METRICS & REPORTING ===
  {
    name: "get_daily_gp",
    description: "Get daily gross profit metrics for a store",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID",
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format (defaults to today)",
        },
      },
    },
  },
  {
    name: "get_scorecard",
    description: "Get the store scorecard with KPIs and goals",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID",
        },
      },
    },
  },
  {
    name: "get_cache_stats",
    description: "Get Tekmetric API cache statistics (hits, misses, size)",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // === CUSTOMERS & CHECK-IN ===
  {
    name: "search_customer",
    description: "Search for a customer by phone number or name",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Phone number or customer name to search",
        },
        storeId: {
          type: "string",
          description: "Store ID",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_checkin_queue",
    description: "Get the current customer check-in queue",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID",
        },
      },
    },
  },
  {
    name: "get_appointments",
    description: "Get today's appointments",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID",
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format",
        },
      },
    },
  },

  // === WORKSTATIONS ===
  {
    name: "get_workstations",
    description: "Get status of all workstations (FWAgent machines)",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_workstation_detail",
    description: "Get detailed info for a specific workstation",
    inputSchema: {
      type: "object",
      properties: {
        workstationId: {
          type: "string",
          description: "Workstation ID",
        },
      },
      required: ["workstationId"],
    },
  },

  // === EMPLOYEES & TRAINING ===
  {
    name: "get_employees",
    description: "Get list of employees for a store",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID",
        },
      },
    },
  },
  {
    name: "get_training_status",
    description: "Get training completion status for employees",
    inputSchema: {
      type: "object",
      properties: {
        storeId: {
          type: "string",
          description: "Store ID",
        },
      },
    },
  },

  // === SYSTEM ===
  {
    name: "get_server_status",
    description: "Get dashboard server health and uptime status",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Tool execution handlers
async function executeTool(name: string, args: Record<string, unknown>) {
  const storeId = (args.storeId as string) || "satx";

  switch (name) {
    // Repair Orders & Board
    case "get_open_repair_orders":
      return await dashboardFetch(`/api/board/repair-orders?storeId=${storeId}`);

    case "get_repair_order":
      return await dashboardFetch(`/api/board/repair-order/${args.roNumber}`);

    case "get_technicians":
      return await dashboardFetch(`/api/board/technicians?storeId=${storeId}`);

    case "get_advisors":
      return await dashboardFetch(`/api/board/advisors?storeId=${storeId}`);

    // Metrics & Reporting
    case "get_daily_gp":
      const date = (args.date as string) || new Date().toISOString().split("T")[0];
      return await dashboardFetch(`/api/reports/daily-gp?storeId=${storeId}&date=${date}`);

    case "get_scorecard":
      return await dashboardFetch(`/api/reports/scorecard?storeId=${storeId}`);

    case "get_cache_stats":
      return await dashboardFetch(`/api/board/cache-stats`);

    // Customers & Check-in
    case "search_customer":
      return await dashboardFetch(
        `/api/checkin/search?query=${encodeURIComponent(args.query as string)}&storeId=${storeId}`
      );

    case "get_checkin_queue":
      return await dashboardFetch(`/api/checkin/queue?storeId=${storeId}`);

    case "get_appointments":
      const apptDate = (args.date as string) || new Date().toISOString().split("T")[0];
      return await dashboardFetch(`/api/board/appointments?storeId=${storeId}&date=${apptDate}`);

    // Workstations
    case "get_workstations":
      return await dashboardFetch(`/api/workstations`);

    case "get_workstation_detail":
      return await dashboardFetch(`/api/workstations/${args.workstationId}`);

    // Employees & Training
    case "get_employees":
      return await dashboardFetch(`/api/employees?storeId=${storeId}`);

    case "get_training_status":
      return await dashboardFetch(`/api/training/status?storeId=${storeId}`);

    // System
    case "get_server_status":
      try {
        const start = Date.now();
        await fetch(`${DASHBOARD_URL}/login`);
        const latency = Date.now() - start;
        return {
          status: "online",
          url: DASHBOARD_URL,
          latency_ms: latency,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          status: "offline",
          url: DASHBOARD_URL,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        };
      }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Create MCP Server
const server = new Server(
  {
    name: "flyin-wrench-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(name, args || {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
});

// Check if running as HTTP server or stdio
// Railway sets PORT env var, so use that to detect cloud deployment
const isHttpMode = process.argv.includes("--http") || process.env.PORT || process.env.RAILWAY_ENVIRONMENT;

if (isHttpMode) {
  // HTTP mode for Railway deployment
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", server: "flyin-wrench-mcp", version: "1.0.0" });
  });

  // Auth middleware
  app.use("/mcp", (req: Request, res: Response, next) => {
    if (MCP_AUTH_TOKEN) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${MCP_AUTH_TOKEN}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
    next();
  });

  // MCP endpoints
  app.get("/mcp/tools", async (req: Request, res: Response) => {
    res.json({ tools });
  });

  app.post("/mcp/call", async (req: Request, res: Response) => {
    const { tool, arguments: args } = req.body;

    if (!tool) {
      return res.status(400).json({ error: "Missing tool name" });
    }

    try {
      const result = await executeTool(tool, args || {});
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Flyin' Wrench MCP Server running on port ${PORT}`);
    console.log(`Dashboard URL: ${DASHBOARD_URL}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Tools endpoint: http://localhost:${PORT}/mcp/tools`);
  });
} else {
  // Stdio mode for local Claude Code
  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.error("Flyin' Wrench MCP Server running on stdio");
  });
}
