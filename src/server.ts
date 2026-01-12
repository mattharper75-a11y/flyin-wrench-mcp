import express, { Request, Response } from "express";

// Configuration
const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://74.208.170.91:3000";
const FRIDAY_API_URL = process.env.FRIDAY_API_URL || "https://server.flyinwrench.com";
const FRIDAY_API_KEY = process.env.FRIDAY_API_KEY || "fw-friday-ctx-2026-skynet";
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

// Helper to make API calls to the Friday context server
async function fridayFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${FRIDAY_API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": FRIDAY_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Friday API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Tool definitions
const tools = [
  { name: "get_open_repair_orders", description: "Get all open repair orders from the tech board" },
  { name: "get_repair_order", description: "Get details for a specific repair order by RO number" },
  { name: "get_technicians", description: "Get list of all technicians with their current workload" },
  { name: "get_advisors", description: "Get list of all service advisors" },
  { name: "get_daily_gp", description: "Get daily gross profit metrics for a store" },
  { name: "get_scorecard", description: "Get the store scorecard with KPIs and goals" },
  { name: "get_cache_stats", description: "Get Tekmetric API cache statistics" },
  { name: "search_customer", description: "Search for a customer by phone number or name" },
  { name: "get_checkin_queue", description: "Get the current customer check-in queue" },
  { name: "get_appointments", description: "Get today's appointments" },
  { name: "get_workstations", description: "Get status of all workstations" },
  { name: "get_workstation_detail", description: "Get detailed info for a specific workstation" },
  { name: "get_employees", description: "Get list of employees for a store" },
  { name: "get_training_status", description: "Get training completion status for employees" },
  { name: "get_server_status", description: "Get dashboard server health and uptime status" },
  // Friday context tools
  { name: "get_friday", description: "Get the full Friday.md context including priorities, recent work, and action items" },
  { name: "get_friday_section", description: "Get a specific section from Friday context (e.g., currentPriorities, recentWork, workflow)" },
  { name: "add_friday_log", description: "Add an entry to the Friday session log" },
  { name: "add_friday_action_item", description: "Add an action item to the Friday context" },
  { name: "update_friday_section", description: "Update a specific section in the Friday context" },
];

// Tool execution
async function executeTool(name: string, args: Record<string, unknown>) {
  const storeId = (args.storeId as string) || "satx";

  switch (name) {
    case "get_open_repair_orders":
      return await dashboardFetch(`/api/board/repair-orders?storeId=${storeId}`);
    case "get_repair_order":
      return await dashboardFetch(`/api/board/repair-order/${args.roNumber}`);
    case "get_technicians":
      return await dashboardFetch(`/api/board/technicians?storeId=${storeId}`);
    case "get_advisors":
      return await dashboardFetch(`/api/board/advisors?storeId=${storeId}`);
    case "get_daily_gp":
      const date = (args.date as string) || new Date().toISOString().split("T")[0];
      return await dashboardFetch(`/api/reports/daily-gp?storeId=${storeId}&date=${date}`);
    case "get_scorecard":
      return await dashboardFetch(`/api/reports/scorecard?storeId=${storeId}`);
    case "get_cache_stats":
      return await dashboardFetch(`/api/board/cache-stats`);
    case "search_customer":
      return await dashboardFetch(`/api/checkin/search?query=${encodeURIComponent(args.query as string)}&storeId=${storeId}`);
    case "get_checkin_queue":
      return await dashboardFetch(`/api/checkin/queue?storeId=${storeId}`);
    case "get_appointments":
      const apptDate = (args.date as string) || new Date().toISOString().split("T")[0];
      return await dashboardFetch(`/api/board/appointments?storeId=${storeId}&date=${apptDate}`);
    case "get_workstations":
      return await dashboardFetch(`/api/workstations`);
    case "get_workstation_detail":
      return await dashboardFetch(`/api/workstations/${args.workstationId}`);
    case "get_employees":
      return await dashboardFetch(`/api/employees?storeId=${storeId}`);
    case "get_training_status":
      return await dashboardFetch(`/api/training/status?storeId=${storeId}`);
    case "get_server_status":
      try {
        const start = Date.now();
        await fetch(`${DASHBOARD_URL}/login`);
        const latency = Date.now() - start;
        return { status: "online", url: DASHBOARD_URL, latency_ms: latency, timestamp: new Date().toISOString() };
      } catch (error) {
        return { status: "offline", url: DASHBOARD_URL, error: (error as Error).message, timestamp: new Date().toISOString() };
      }

    // Friday context tools
    case "get_friday":
      return await fridayFetch("/api/friday");

    case "get_friday_section":
      const section = args.section as string;
      if (!section) throw new Error("Missing section parameter");
      return await fridayFetch(`/api/friday/section/${section}`);

    case "add_friday_log":
      const logEntry = args.entry as string;
      const logSource = (args.source as string) || "claude-web";
      if (!logEntry) throw new Error("Missing entry parameter");
      return await fridayFetch("/api/friday/log", {
        method: "POST",
        body: JSON.stringify({ entry: logEntry, source: logSource }),
      });

    case "add_friday_action_item":
      const item = args.item as string;
      const priority = (args.priority as string) || "normal";
      const itemSource = (args.source as string) || "claude-web";
      if (!item) throw new Error("Missing item parameter");
      return await fridayFetch("/api/friday/action-item", {
        method: "POST",
        body: JSON.stringify({ item, priority, source: itemSource }),
      });

    case "update_friday_section":
      const updateSection = args.section as string;
      const data = args.data;
      if (!updateSection) throw new Error("Missing section parameter");
      if (!data) throw new Error("Missing data parameter");
      return await fridayFetch(`/api/friday/section/${updateSection}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Express server
const app = express();
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", server: "flyin-wrench-mcp", version: "1.0.0" });
});

// Root
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Flyin' Wrench MCP Server",
    version: "1.0.0",
    endpoints: ["/health", "/mcp/tools", "/mcp/call"]
  });
});

// Auth middleware for MCP endpoints - supports multiple auth methods
app.use("/mcp", (req: Request, res: Response, next) => {
  if (MCP_AUTH_TOKEN) {
    // Check various auth methods
    const authHeader = req.headers.authorization;
    const oauthSecret = req.headers["x-oauth-client-secret"] as string;
    const apiKey = req.headers["x-api-key"] as string;
    const queryToken = req.query.token as string;

    const isValidBearer = authHeader === `Bearer ${MCP_AUTH_TOKEN}`;
    const isValidOAuth = oauthSecret === MCP_AUTH_TOKEN;
    const isValidApiKey = apiKey === MCP_AUTH_TOKEN;
    const isValidQuery = queryToken === MCP_AUTH_TOKEN;

    if (!isValidBearer && !isValidOAuth && !isValidApiKey && !isValidQuery) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  next();
});

// List tools
app.get("/mcp/tools", (req: Request, res: Response) => {
  res.json({ tools });
});

// Call tool
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

// Start server - bind to 0.0.0.0 for Railway
const HOST = "0.0.0.0";
app.listen(Number(PORT), HOST, () => {
  console.log(`Flyin' Wrench MCP Server running on ${HOST}:${PORT}`);
  console.log(`Dashboard URL: ${DASHBOARD_URL}`);
  console.log(`Health: http://${HOST}:${PORT}/health`);
});
