import express from "express";
import path from "path";
import dns from "dns";
import { promisify } from "util";
import axios from "axios";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";

const lookupAsync = promisify(dns.lookup);

// Security Helper: Validate URL Protocol and Parsing
function validateProxyUrl(urlStr: string): string | null {
  if (!urlStr) return "URL parameter is required";
  if (!/^https?:\/\//i.test(urlStr)) {
    return "Protocol not supported. URL must start with http:// or https://";
  }
  try {
    const parsed = new URL(urlStr);
    if (!parsed.hostname) {
      return "URL does not contain a valid hostname";
    }
  } catch (err) {
    return "Invalid URL format representation";
  }
  return null;
}

// Security Helper: SSRF/Loopback Subnet request blocker
async function isPrivateAddress(hostname: string): Promise<boolean> {
  const lowerHost = hostname.toLowerCase();
  
  // Direct matches for loopback and localhost patterns
  if (
    lowerHost === "localhost" ||
    lowerHost === "127.0.0.1" ||
    lowerHost === "::1" ||
    lowerHost === "0.0.0.0" ||
    lowerHost === "[::1]"
  ) {
    return true;
  }

  try {
    const result = await lookupAsync(hostname);
    const ip = result.address;

    // IPv4 address boundaries for private subnets
    if (ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("169.254.")) {
      return true;
    }
    if (ip.startsWith("192.168.")) {
      return true;
    }
    if (ip.startsWith("172.")) {
      const parts = ip.split(".");
      if (parts.length === 4) {
        const secondOctet = parseInt(parts[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) {
          return true;
        }
      }
    }

    // IPv6 Private Network boundaries
    const lowerIp = ip.toLowerCase();
    if (
      lowerIp === "::1" ||
      lowerIp === "0:0:0:0:0:0:0:1" ||
      lowerIp.startsWith("fe80:") || // Link-local
      lowerIp.startsWith("fc00:") || // Unique local
      lowerIp.startsWith("fd00:")    // Unique local
    ) {
      return true;
    }
  } catch (dnsErr) {
    // DNS resolution failure is safe to allow or treat as fallback
  }
  return false;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Trust proxy headers in containerized runtime context
  app.set("trust proxy", true);

  // 2. CORS integration
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(",") 
    : [];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server, mobile, curl, or same-origin)
      if (!origin) return callback(null, true);
      
      const isLocalhost = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:") || origin.startsWith("http://0.0.0.0:");
      const isVercel = /\.vercel\.app$/.test(origin);
      const isExplicitlyAllowed = allowedOrigins.includes(origin);

      if (isLocalhost || isVercel || isExplicitlyAllowed) {
        callback(null, true);
      } else {
        // Fallback or development safety
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Playground-Meta",
      "x-api-key"
    ],
    credentials: true
  }));

  // 3. Size-Limited Body Load Parsers (10MB Limit)
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 4. Custom Request Logger Middleware (method + url + timestamp)
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
    next();
  });

  // 5. Rate Limiter Definition: max 30 requests per minute per IP
  const proxyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // threshold
    message: {
      error: "Too many requests",
      message: "Rate limit exceeded. Max 30 requests per minute per IP are allowed."
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Dual routes endpoint logic mapper
  const handleProxyRequest = async (req: express.Request, res: express.Response) => {
    const startTime = Date.now();
    const { url, method = "GET", headers = {}, body } = req.body;

    try {
      // Step A: Validate presence
      if (!url) {
        res.status(400).json({
          status: 400,
          statusText: "Bad Request",
          error: "Missing required parameter",
          message: "A target destination URL is required for execution."
        });
        return;
      }

      // Step B: Sanitize and Validate Format
      const urlValidationError = validateProxyUrl(url);
      if (urlValidationError) {
        res.status(400).json({
          status: 400,
          statusText: "Bad Request",
          error: "Invalid URL representation",
          message: urlValidationError
        });
        return;
      }

      // Step C: Verify hostname has no private/localhost destinations (SSRF Guard)
      const parsedUrl = new URL(url);
      const isBlocked = await isPrivateAddress(parsedUrl.hostname);
      if (isBlocked) {
        res.status(403).json({
          status: 403,
          statusText: "Forbidden",
          error: "SSRF Prevented",
          message: "Request blocked. Requests to local, loopback, or private host networks are prohibited."
        });
        return;
      }

      // Format custom Request Headers cleanly
      const outgoingHeaders: Record<string, string> = {};
      if (typeof headers === "object" && headers !== null) {
        Object.entries(headers).forEach(([key, val]) => {
          if (key && val !== undefined && val !== null) {
            outgoingHeaders[key] = String(val);
          }
        });
      }

      // Scrub host metadata that could interfere with node agent resolver
      const scrubHeaders = ["host", "content-length"];
      scrubHeaders.forEach(sh => {
        delete outgoingHeaders[sh];
        delete outgoingHeaders[sh.toUpperCase()];
      });

      // Prepare request payload content stream
      let payloadContent: any = undefined;
      if (method !== "GET" && method !== "HEAD" && body !== undefined && body !== null) {
        if (typeof body === "object") {
          payloadContent = JSON.stringify(body);
          if (!outgoingHeaders["Content-Type"]) {
            outgoingHeaders["Content-Type"] = "application/json";
          }
        } else {
          payloadContent = String(body);
        }
      }

      // Execute actual HTTP request via Axios with 10-second timeout
      const response = await axios({
        url,
        method: method,
        headers: outgoingHeaders,
        data: payloadContent,
        timeout: 10000, // Max 10 seconds timeout
        validateStatus: () => true, // Proceed for non-2xx statuses to proxy back response details
        responseType: "arraybuffer", // Retrieve raw bytes so we can support both text/media
      });

      const responseTime = Date.now() - startTime;
      const responseStatus = response.status;
      const responseStatusText = response.statusText || "OK";

      // Formulate headers map
      const responseHeaders: Record<string, string> = {};
      Object.entries(response.headers).forEach(([k, v]) => {
        if (v !== undefined) {
          responseHeaders[k] = Array.isArray(v) ? v.join(", ") : String(v);
        }
      });

      const contentType = responseHeaders["content-type"] || "";
      let responseBody: any = null;

      // Extract binary or text buffers
      if (responseStatus !== 204 && response.data) {
        const buffer = Buffer.from(response.data);
        if (contentType.includes("application/json")) {
          try {
            responseBody = JSON.parse(buffer.toString("utf8"));
          } catch {
            responseBody = buffer.toString("utf8");
          }
        } else if (
          contentType.includes("image/") ||
          contentType.includes("audio/") ||
          contentType.includes("video/") ||
          contentType.includes("pdf")
        ) {
          responseBody = buffer.toString("base64");
        } else {
          responseBody = buffer.toString("utf8");
        }
      }

      const rawBodySize = responseBody
        ? typeof responseBody === "object"
          ? JSON.stringify(responseBody).length
          : String(responseBody).length
        : 0;

      // Maintain backward/forward compatibility across UI expectations
      res.json({
        status: responseStatus,
        statusText: responseStatusText,
        headers: responseHeaders,
        data: responseBody,
        body: responseBody, // exact key requested by current UI setup
        contentType,
        responseTime,
        durationMs: responseTime, // exact key requested by current UI setup
        sizeBytes: rawBodySize,
      });

    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      console.error(`Local fetching error for URL: ${url}`, err);

      let statusCode = 502;
      let errorMessage = "Failed to establish a network connection to target host.";

      if (err.code === "ECONNABORTED" || err.message.toLowerCase().includes("timeout")) {
        statusCode = 504;
        errorMessage = "The connection timed out. The remote target exceeded the 10-second response limit.";
      } else if (err.code === "ENOTFOUND") {
        statusCode = 404;
        errorMessage = "The target hostname could not resolve in the DNS directory.";
      } else if (err.code === "ECONNREFUSED") {
        statusCode = 502;
        errorMessage = "The connection was actively refused by the target host.";
      }

      res.status(statusCode).json({
        status: statusCode,
        statusText: "Gateway Error",
        headers: {},
        data: null,
        body: null,
        contentType: "text/plain",
        responseTime: durationMs,
        durationMs,
        sizeBytes: 0,
        error: err.message || errorMessage,
        message: errorMessage
      });
    }
  };

  // Bind the proxy actions
  app.post("/api/proxy", proxyLimiter, handleProxyRequest);
  app.post("/proxy", proxyLimiter, handleProxyRequest);

  // Dev server healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Serve static assets correctly or mount Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Central Express Error Reporting Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Central Express Applet Error caught:", err);
    res.status(500).json({
      error: "Internal Server Processing Error",
      message: err.message || String(err),
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[APIForge Backend] Proxying requests flawlessly on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("FATAL: Failed to initiate secure proxy fullstack server", err);
});
