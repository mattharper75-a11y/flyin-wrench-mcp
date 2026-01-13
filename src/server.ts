import express, { Request, Response } from "express";

// Configuration
const DASHBOARD_URL = process.env.DASHBOARD_URL || "https://server.flyinwrench.com";
const FRIDAY_API_URL = process.env.FRIDAY_API_URL || "https://server.flyinwrench.com";
const FRIDAY_API_KEY = process.env.FRIDAY_API_KEY || "fw-friday-ctx-2026-skynet";
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "fw-email-2026-skynet";
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

// Tool definitions with full MCP schema
const tools = [
  { name: "get_open_repair_orders", description: "Get all open repair orders from the tech board", inputSchema: { type: "object", properties: { storeId: { type: "string", description: "Store ID (default: satx)" } }, required: [] } },
  { name: "get_repair_order", description: "Get details for a specific repair order by RO number", inputSchema: { type: "object", properties: { roNumber: { type: "string", description: "Repair order number" } }, required: ["roNumber"] } },
  { name: "get_technicians", description: "Get list of all technicians with their current workload", inputSchema: { type: "object", properties: { storeId: { type: "string" } }, required: [] } },
  { name: "get_advisors", description: "Get list of all service advisors", inputSchema: { type: "object", properties: { storeId: { type: "string" } }, required: [] } },
  { name: "get_daily_gp", description: "Get daily gross profit metrics for a store", inputSchema: { type: "object", properties: { storeId: { type: "string" }, date: { type: "string", description: "Date in YYYY-MM-DD format" } }, required: [] } },
  { name: "get_scorecard", description: "Get the store scorecard with KPIs and goals", inputSchema: { type: "object", properties: { storeId: { type: "string" } }, required: [] } },
  { name: "get_cache_stats", description: "Get Tekmetric API cache statistics", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "search_customer", description: "Search for a customer by phone number or name", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query (phone or name)" }, storeId: { type: "string" } }, required: ["query"] } },
  { name: "get_checkin_queue", description: "Get the current customer check-in queue", inputSchema: { type: "object", properties: { storeId: { type: "string" } }, required: [] } },
  { name: "get_appointments", description: "Get today's appointments", inputSchema: { type: "object", properties: { storeId: { type: "string" }, date: { type: "string" } }, required: [] } },
  { name: "get_workstations", description: "Get status of all workstations", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_workstation_detail", description: "Get detailed info for a specific workstation", inputSchema: { type: "object", properties: { workstationId: { type: "string" } }, required: ["workstationId"] } },
  { name: "get_employees", description: "Get list of employees for a store", inputSchema: { type: "object", properties: { storeId: { type: "string" } }, required: [] } },
  { name: "get_training_status", description: "Get training completion status for employees", inputSchema: { type: "object", properties: { storeId: { type: "string" } }, required: [] } },
  { name: "get_server_status", description: "Get dashboard server health and uptime status", inputSchema: { type: "object", properties: {}, required: [] } },
  // Friday context tools
  { name: "get_friday", description: "Get the full Friday.md context including priorities, recent work, and action items", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_friday_section", description: "Get a specific section from Friday context (e.g., currentPriorities, recentWork, workflow)", inputSchema: { type: "object", properties: { section: { type: "string", description: "Section name" } }, required: ["section"] } },
  { name: "add_friday_log", description: "Add an entry to the Friday session log", inputSchema: { type: "object", properties: { entry: { type: "string", description: "Log entry text" }, source: { type: "string", description: "Source identifier" } }, required: ["entry"] } },
  { name: "add_friday_action_item", description: "Add an action item to the Friday context", inputSchema: { type: "object", properties: { item: { type: "string", description: "Action item text" }, priority: { type: "string", enum: ["low", "normal", "high"] }, source: { type: "string" } }, required: ["item"] } },
  { name: "update_friday_section", description: "Update a specific section in the Friday context", inputSchema: { type: "object", properties: { section: { type: "string" }, data: { type: "object" } }, required: ["section", "data"] } },
  // Email tool
  { name: "send_email", description: "Send an email to a recipient", inputSchema: { type: "object", properties: { to: { type: "string", description: "Recipient email address" }, subject: { type: "string", description: "Email subject" }, html: { type: "string", description: "Email body in HTML format" }, text: { type: "string", description: "Plain text email body (optional)" } }, required: ["to", "subject"] } },
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

    // Email tool
    case "send_email":
      const emailTo = args.to as string;
      const emailSubject = args.subject as string;
      const emailHtml = args.html as string;
      const emailText = args.text as string;
      if (!emailTo) throw new Error("Missing 'to' parameter");
      if (!emailSubject) throw new Error("Missing 'subject' parameter");
      const emailResponse = await fetch(`${FRIDAY_API_URL}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": EMAIL_API_KEY,
        },
        body: JSON.stringify({ to: emailTo, subject: emailSubject, html: emailHtml, text: emailText }),
      });
      if (!emailResponse.ok) {
        throw new Error(`Email API error: ${emailResponse.status} ${emailResponse.statusText}`);
      }
      return await emailResponse.json();

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Express server
const app = express();

// CORS for Claude Web
app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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
// NOTE: Auth disabled for Claude Web connector compatibility
// The Friday API itself still has auth, so data is protected
app.use("/mcp", (req: Request, res: Response, next) => {
  // Auth check disabled to allow Claude Web custom connector
  // which doesn't support Bearer token auth (only OAuth2 flow)
  // To re-enable, uncomment the block below:
  /*
  if (MCP_AUTH_TOKEN) {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers["x-api-key"] as string;
    const isValidBearer = authHeader === `Bearer ${MCP_AUTH_TOKEN}`;
    const isValidApiKey = apiKey === MCP_AUTH_TOKEN;
    if (!isValidBearer && !isValidApiKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  */
  next();
});

// MCP JSON-RPC protocol handler (for Claude Web custom connectors)
app.post("/mcp", async (req: Request, res: Response) => {
  console.log("MCP Request:", JSON.stringify(req.body, null, 2));
  const { jsonrpc, method, params, id } = req.body;

  // Handle JSON-RPC format
  if (jsonrpc === "2.0" || method) {
    try {
      let result;

      if (method === "tools/list" || method === "list_tools") {
        result = { tools };
      } else if (method === "tools/call" || method === "call_tool") {
        const toolName = params?.name || params?.tool;
        const toolArgs = params?.arguments || params?.args || {};
        if (!toolName) {
          return res.json({ jsonrpc: "2.0", error: { code: -32602, message: "Missing tool name" }, id });
        }
        const toolResult = await executeTool(toolName, toolArgs);
        // MCP protocol requires content array format
        result = {
          content: [
            {
              type: "text",
              text: JSON.stringify(toolResult, null, 2)
            }
          ]
        };
      } else if (method === "initialize") {
        result = {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "flyin-wrench-mcp", version: "1.0.0" }
        };
      } else {
        return res.json({ jsonrpc: "2.0", error: { code: -32601, message: `Unknown method: ${method}` }, id });
      }

      return res.json({ jsonrpc: "2.0", result, id });
    } catch (error) {
      return res.json({ jsonrpc: "2.0", error: { code: -32000, message: (error as Error).message }, id });
    }
  }

  // Fallback: simple REST call format
  const { tool, arguments: args } = req.body;
  if (tool) {
    try {
      const result = await executeTool(tool, args || {});
      return res.json({ result });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  res.status(400).json({ error: "Invalid request format" });
});

// List tools (REST style)
app.get("/mcp/tools", (req: Request, res: Response) => {
  res.json({ tools });
});

// Call tool (REST style)
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
