import React, { useState, useEffect } from "react";
import { 
  Layers, 
  RefreshCw, 
  Settings, 
  HelpCircle, 
  Sparkles, 
  Database, 
  Eye, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Save, 
  Terminal,
  Code,
  Copy,
  Check,
  X,
  FolderOpen,
  FolderPlus
} from "lucide-react";

import { 
  HttpMethod, 
  KeyValuePair, 
  AuthConfig, 
  BodyType, 
  RequestConfig, 
  WebResponse, 
  HistoryItem, 
  Collection, 
  EnvironmentVariable,
  Environment,
  ApiPreset 
} from "./types";
import { API_PRESETS } from "./presets";

import HistoryPanel from "./components/HistoryPanel";
import HeadersEditor from "./components/HeadersEditor";
import BodyEditor from "./components/BodyEditor";
import ResponsePanel from "./components/ResponsePanel";
import RequestPanel from "./components/RequestPanel";

const getBackendUrl = (path: string): string => {
  const base = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  return base ? `${base}${path}` : path;
};

export default function App() {
  // Core API Request State
  const [url, setUrl] = useState<string>("https://jsonplaceholder.typicode.com/todos/1");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [requestName, setRequestName] = useState<string>("Get Mock Todo");
  
  const [params, setParams] = useState<KeyValuePair[]>([
    { key: "completed", value: "false", enabled: false }
  ]);
  const [headers, setHeaders] = useState<KeyValuePair[]>([
    { key: "Accept", value: "application/json", enabled: true }
  ]);
  
  const [bodyType, setBodyType] = useState<BodyType>("none");
  const [bodyContent, setBodyContent] = useState<string>("");
  
  const [auth, setAuth] = useState<AuthConfig>({
    type: "none",
    bearerToken: "",
    basicUsername: "",
    basicPassword: "",
    apiKeyKey: "x-api-key",
    apiKeyValue: "",
    apiKeyAddTo: "header"
  });

  // UI Tabs State
  const [activeRequestTab, setActiveRequestTab] = useState<"params" | "headers" | "body" | "auth">("params");
  const [activeResponseTab, setActiveResponseTab] = useState<"body" | "headers" | "raw">("body");
  const [sidebarTab, setSidebarTab] = useState<"presets" | "history" | "collections">("presets");

  // Loading & Outputs
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<WebResponse | null>(null);
  const [proxyHealthy, setProxyHealthy] = useState<boolean | null>(null);

  // Persistence States
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "coll-default",
      name: "API Workbench",
      description: "Default workspace for saving HTTP transactions",
      requests: []
    }
  ]);

  // Environment Config States
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>("none");
  const [showEnvModal, setShowEnvModal] = useState<boolean>(false);
  const [editingEnvId, setEditingEnvId] = useState<string>("");

  // Code Snippets Exporter States
  const [activeCodeLang, setActiveCodeLang] = useState<"curl" | "fetch" | "python">("curl");
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  // State Persisters
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistoryItems(newHistory);
    localStorage.setItem("apiforge_history", JSON.stringify(newHistory));
  };

  const saveCollections = (newColls: Collection[]) => {
    setCollections(newColls);
    localStorage.setItem("apiforge_collections", JSON.stringify(newColls));
  };

  const saveEnvironments = (newEnvs: Environment[]) => {
    setEnvironments(newEnvs);
    localStorage.setItem("apiforge_environments", JSON.stringify(newEnvs));
  };

  // Interpolate Environment variables: replaces {{variable_name}} with active value
  const interpolate = (text: string): string => {
    if (!text) return "";
    let resolved = text;
    
    const activeEnv = environments.find((e) => e.id === selectedEnvironmentId);
    if (activeEnv) {
      activeEnv.variables.forEach((v) => {
        if (v.enabled && v.key.trim()) {
          const pattern = new RegExp(`\\{\\{\\s*${v.key.trim()}\\s*\\}\\}`, "g");
          resolved = resolved.replace(pattern, v.value);
        }
      });
    }
    return resolved;
  };

  // Load storage states and check shared parameters on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("apiforge_history");
      if (storedHistory) setHistoryItems(JSON.parse(storedHistory));

      const storedCollections = localStorage.getItem("apiforge_collections");
      if (storedCollections) {
        setCollections(JSON.parse(storedCollections));
      } else {
        const defaultColls: Collection[] = [
          {
            id: "coll-default",
            name: "API Workbench",
            description: "Default workspace for saving HTTP transactions",
            requests: []
          }
        ];
        saveCollections(defaultColls);
      }

      const storedEnvironments = localStorage.getItem("apiforge_environments");
      if (storedEnvironments) {
        setEnvironments(JSON.parse(storedEnvironments));
      } else {
        const defaultEnvironments: Environment[] = [
          {
            id: "env-dev",
            name: "Development Env",
            variables: [
              { key: "baseUrl", value: "https://jsonplaceholder.typicode.com", enabled: true },
              { key: "apiKey", value: "dev_secret_auth_token_99x", enabled: true }
            ]
          },
          {
            id: "env-staging",
            name: "Staging Sandbox",
            variables: [
              { key: "baseUrl", value: "https://staging.api.example.com/v1", enabled: true },
              { key: "apiKey", value: "staging_key_abc_123", enabled: true }
            ]
          },
          {
            id: "env-prod",
            name: "Production API Suite",
            variables: [
              { key: "baseUrl", value: "https://api.example.com", enabled: true },
              { key: "apiKey", value: "live_security_signing_token_key_prod", enabled: true }
            ]
          }
        ];
        setEnvironments(defaultEnvironments);
        localStorage.setItem("apiforge_environments", JSON.stringify(defaultEnvironments));
      }

      const storedSelectedEnv = localStorage.getItem("apiforge_selected_env");
      if (storedSelectedEnv) {
        setSelectedEnvironmentId(storedSelectedEnv);
      } else {
        setSelectedEnvironmentId("env-dev");
      }
    } catch (e) {
      console.warn("Could not retrieve local persistence data:", e);
    }

    // Check shared URL query params: ?import=<base64_encoded_state>
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const importData = urlParams.get("import");
      if (importData) {
        const decodedJson = decodeURIComponent(escape(atob(importData)));
        const config = JSON.parse(decodedJson);
        if (config) {
          if (config.url) setUrl(config.url);
          if (config.method) setMethod(config.method);
          if (config.requestName) setRequestName(config.requestName);
          if (config.headers) setHeaders(config.headers);
          if (config.params) setParams(config.params);
          if (config.bodyType) setBodyType(config.bodyType);
          if (config.bodyContent) setBodyContent(config.bodyContent);
          if (config.auth) setAuth(config.auth);

          // Clean URL parameter so it doesn't dirty future edits
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
          
          setTimeout(() => {
            alert("Loaded shared request settings successfully!");
          }, 400);
        }
      }
    } catch (err) {
      console.warn("Could not unpack shared request URL configuration:", err);
    }

    checkProxyStatus();
  }, []);

  const checkProxyStatus = async () => {
    try {
      const res = await fetch(getBackendUrl("/api/health"));
      const data = await res.json();
      if (data && data.status === "healthy") {
        setProxyHealthy(true);
      } else {
        setProxyHealthy(false);
      }
    } catch {
      setProxyHealthy(false);
    }
  };

  // Helper trigger to parse and load request configs
  const handleLoadRequest = (preset: any) => {
    setUrl(preset.url || "");
    setMethod(preset.method || "GET");
    setRequestName(preset.name || "Loaded Endpoint");

    if (preset.headers) {
      setHeaders(preset.headers.map((h: any) => ({ ...h, enabled: true })));
    } else {
      setHeaders([{ key: "", value: "", enabled: true }]);
    }

    if (preset.params) {
      setParams(preset.params.map((p: any) => ({ ...p, enabled: true })));
    } else {
      setParams([{ key: "", value: "", enabled: true }]);
    }

    if (preset.bodyType) {
      setBodyType(preset.bodyType);
      setBodyContent(preset.bodyContent || "");
    } else {
      setBodyType("none");
      setBodyContent("");
    }

    if (preset.auth) {
      setAuth(preset.auth);
    } else {
      setAuth({
        type: "none",
        bearerToken: "",
        basicUsername: "",
        basicPassword: "",
        apiKeyKey: "x-api-key",
        apiKeyValue: "",
        apiKeyAddTo: "header"
      });
    }

    setResponse(null);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = historyItems.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  // Compile final url using variables, query parameters, auth in query
  const compileFinalUrl = (): string => {
    let resolved = interpolate(url);
    const activeParams = params.filter((p) => p.enabled && p.key.trim());

    if (activeParams.length > 0) {
      try {
        const urlObj = new URL(resolved);
        activeParams.forEach((p) => {
          urlObj.searchParams.append(interpolate(p.key.trim()), interpolate(p.value));
        });
        resolved = urlObj.toString();
      } catch {
        // Fallback for relative paths or partially typed parameters
        const connector = resolved.includes("?") ? "&" : "?";
        const queryStr = activeParams
          .map((p) => `${encodeURIComponent(interpolate(p.key))}=${encodeURIComponent(interpolate(p.value))}`)
          .join("&");
        resolved = `${resolved}${connector}${queryStr}`;
      }
    }

    if (auth.type === "apikey" && auth.apiKeyAddTo === "query" && auth.apiKeyKey.trim()) {
      const connector = resolved.includes("?") ? "&" : "?";
      resolved = `${resolved}${connector}${encodeURIComponent(interpolate(auth.apiKeyKey))}=${encodeURIComponent(interpolate(auth.apiKeyValue))}`;
    }

    return resolved;
  };

  // Compile headers for output proxification
  const compileHeaders = (): Record<string, string> => {
    const compiled: Record<string, string> = {};

    headers.forEach((h) => {
      if (h.enabled && h.key.trim()) {
        compiled[interpolate(h.key.trim())] = interpolate(h.value);
      }
    });

    if (auth.type === "bearer" && auth.bearerToken) {
      compiled["Authorization"] = `Bearer ${interpolate(auth.bearerToken)}`;
    } else if (auth.type === "basic" && auth.basicUsername) {
      const b64 = btoa(`${interpolate(auth.basicUsername)}:${interpolate(auth.basicPassword || "")}`);
      compiled["Authorization"] = `Basic ${b64}`;
    } else if (auth.type === "apikey" && auth.apiKeyAddTo === "header" && auth.apiKeyKey.trim()) {
      compiled[interpolate(auth.apiKeyKey.trim())] = interpolate(auth.apiKeyValue);
    }

    if (bodyType === "json" && !compiled["Content-Type"]) {
      compiled["Content-Type"] = "application/json";
    }

    return compiled;
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResponse(null);

    const resolvedUrl = compileFinalUrl();
    const finalHeaders = compileHeaders();
    let payloadBody: any = undefined;

    if (bodyType === "json" && bodyContent.trim()) {
      try {
        payloadBody = JSON.parse(interpolate(bodyContent));
      } catch {
        payloadBody = interpolate(bodyContent);
      }
    } else if (bodyType === "text" && bodyContent.trim()) {
      payloadBody = interpolate(bodyContent);
    }

    const payload = {
      url: resolvedUrl,
      method,
      headers: finalHeaders,
      body: payloadBody
    };

    const startTime = Date.now();

    try {
      const res = await fetch(getBackendUrl("/proxy"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const responseTime = Date.now() - startTime;
      const data = await res.json();

      if (!res.ok) {
        setResponse({
          status: res.status,
          statusText: res.statusText || "Gateway Proxy Error",
          headers: {},
          body: data,
          contentType: "application/json",
          durationMs: responseTime,
          sizeBytes: JSON.stringify(data).length,
          error: data.message || "Failed to parse API target reaction."
        });
      } else {
        setResponse({
          status: data.status,
          statusText: data.statusText || "OK",
          headers: data.headers || {},
          body: data.body,
          contentType: data.contentType || "application/json",
          durationMs: data.durationMs || responseTime,
          sizeBytes: data.sizeBytes || 0,
          error: data.error
        });

        // Push to localStorage request history
        const newHistory: HistoryItem = {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          config: {
            name: requestName,
            url,
            method,
            headers: [...headers],
            params: [...params],
            bodyType,
            bodyContent,
            auth: { ...auth }
          },
          response: {
            status: data.status,
            statusText: data.statusText,
            headers: data.headers || {},
            body: data.body,
            contentType: data.contentType,
            durationMs: data.durationMs || responseTime,
            sizeBytes: data.sizeBytes || 0
          }
        };

        saveHistory([newHistory, ...historyItems.slice(0, 49)]);
      }
    } catch (err: any) {
      setResponse({
        status: 0,
        statusText: "Connection Offline or Timeout",
        headers: {},
        body: null,
        contentType: "text/plain",
        durationMs: Date.now() - startTime,
        sizeBytes: 0,
        error: err.message || "Network request failed to establish."
      });
    } finally {
      setLoading(false);
    }
  };

  // Format active JSON editor content
  const formatJsonContent = () => {
    if (!bodyContent.trim()) return;
    try {
      const parsed = JSON.parse(bodyContent);
      setBodyContent(JSON.stringify(parsed, null, 2));
    } catch {
      alert("Invalid JSON payload structure. Please verify formatting syntax.");
    }
  };

  // Collection folder actions
  const handleSaveToCollection = (collectionId: string) => {
    const taskConfig: RequestConfig = {
      id: `task-${Date.now()}`,
      name: requestName || `${method} Request`,
      url,
      method,
      headers: [...headers],
      params: [...params],
      bodyType,
      bodyContent,
      auth: { ...auth }
    };

    const updated = collections.map((col) => {
      if (col.id === collectionId) {
        return {
          ...col,
          requests: [taskConfig, ...col.requests]
        };
      }
      return col;
    });

    saveCollections(updated);
    alert(`Successfully saved "${requestName}" to selected folder!`);
  };

  const handleAddCollection = (name: string, description?: string) => {
    const newColl: Collection = {
      id: `coll-${Date.now()}`,
      name,
      description,
      requests: []
    };
    const updated = [...collections, newColl];
    saveCollections(updated);
  };

  const handleDeleteCollection = (id: string) => {
    const updated = collections.filter((col) => col.id !== id);
    saveCollections(updated);
  };

  const handleDeleteCollectionRequest = (collectionId: string, requestId: string) => {
    const updated = collections.map((col) => {
      if (col.id === collectionId) {
        return {
          ...col,
          requests: col.requests.filter((r) => r.id !== requestId)
        };
      }
      return col;
    });
    saveCollections(updated);
  };

  const handleExportCollection = (col: Collection) => {
    const jsonStr = JSON.stringify(col, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = downloadUrl;
    downloadAnchor.download = `collection-${col.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleImportCollections = (imported: Collection[]) => {
    const updated = [...collections];
    imported.forEach((newCol) => {
      // Re-key IDs with unique descriptors to avoid overlap keys
      const mappedCol = {
        ...newCol,
        id: `coll-imp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        requests: newCol.requests.map((req) => ({
          ...req,
          id: `task-imp-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        }))
      };
      updated.push(mappedCol);
    });
    saveCollections(updated);
  };

  // URL Sharing base64 generator
  const handleShareLink = () => {
    const configToShare = {
      url,
      method,
      requestName,
      headers,
      params,
      bodyType,
      bodyContent,
      auth
    };

    try {
      const jsonStr = JSON.stringify(configToShare);
      // Safe base64 supporting unicode elements
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?import=${b64}`;
      navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      console.error("Could not construct shared link:", err);
    }
  };

  // Code exporter templates generator
  const getExporterSnippet = (): string => {
    const finalUrl = compileFinalUrl();
    const finalHeaders = compileHeaders();
    const headersJson = JSON.stringify(finalHeaders, null, 2);

    switch (activeCodeLang) {
      case "curl": {
        let snippet = `curl -X ${method} "${finalUrl}"`;
        Object.entries(finalHeaders).forEach(([k, v]) => {
          snippet += ` \\\n  -H "${k}: ${v}"`;
        });
        if (bodyType !== "none" && bodyContent) {
          snippet += ` \\\n  -d '${bodyContent.trim().replace(/'/g, "'\\''")}'`;
        }
        return snippet;
      }
      case "fetch": {
        return `fetch("${finalUrl}", {
  method: "${method}",
  headers: ${headersJson.replace(/\n/g, "\n  ")}${bodyType !== "none" && bodyContent ? `,\n  body: JSON.stringify(${bodyContent.trim()})` : ""}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
      }
      case "python": {
        return `import requests

url = "${finalUrl}"
headers = ${headersJson}
${bodyType !== "none" && bodyContent ? `payload = ${bodyContent.trim()}\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=payload)` : `response = requests.${method.toLowerCase()}(url, headers=headers)`}

print(response.status_code)
print(response.json())`;
      }
    }
  };

  const handleCopySnippet = () => {
    const snippetText = getExporterSnippet();
    navigator.clipboard.writeText(snippetText);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Environment Modal Actions
  const currentEditingEnv = environments.find((e) => e.id === editingEnvId);

  const handleAddEnvVariable = () => {
    if (!editingEnvId || !currentEditingEnv) return;
    const updated = environments.map((e) => {
      if (e.id === editingEnvId) {
        return {
          ...e,
          variables: [...e.variables, { key: "new_var", value: "change_me", enabled: true }]
        };
      }
      return e;
    });
    saveEnvironments(updated);
  };

  const handleUpdateEnvVariable = (index: number, field: keyof EnvironmentVariable, value: any) => {
    if (!editingEnvId || !currentEditingEnv) return;
    const updated = environments.map((e) => {
      if (e.id === editingEnvId) {
        const modifiedVars = [...e.variables];
        modifiedVars[index] = { ...modifiedVars[index], [field]: value };
        return {
          ...e,
          variables: modifiedVars
        };
      }
      return e;
    });
    saveEnvironments(updated);
  };

  const handleDeleteEnvVariable = (index: number) => {
    if (!editingEnvId || !currentEditingEnv) return;
    const updated = environments.map((e) => {
      if (e.id === editingEnvId) {
        return {
          ...e,
          variables: e.variables.filter((_, i) => i !== index)
        };
      }
      return e;
    });
    saveEnvironments(updated);
  };

  const handleCreateNewEnvironment = () => {
    const newEnvId = `env-${Date.now()}`;
    const newEnv: Environment = {
      id: newEnvId,
      name: "Custom Environment Suite",
      variables: [
        { key: "baseUrl", value: "https://api.example.com", enabled: true }
      ]
    };
    const updated = [...environments, newEnv];
    saveEnvironments(updated);
    setEditingEnvId(newEnvId);
  };

  const handleDeleteEntireEnvironment = (envId: string) => {
    if (environments.length <= 1) {
      alert("At least one active environment is required.");
      return;
    }
    const updated = environments.filter((e) => e.id !== envId);
    saveEnvironments(updated);
    if (selectedEnvironmentId === envId) {
      setSelectedEnvironmentId("none");
      localStorage.setItem("apiforge_selected_env", "none");
    }
    if (editingEnvId === envId) {
      setEditingEnvId(updated[0]?.id || "");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans select-none">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-md">
            <Layers className="h-4 w-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">APIForge</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 font-mono font-bold px-1 py-0.5 rounded border border-amber-500/10 uppercase tracking-widest">PRO PLATINUM</span>
            </div>
            <p className="text-[10px] text-slate-400">72-Hour Web API Sandbox</p>
          </div>
        </div>

        {/* System parameters and network indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Environment Variable Switcher Desk */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900" id="environment-selector-deck">
            <span className="text-slate-500 font-semibold font-mono text-[9px] uppercase tracking-wider">Env:</span>
            <select
              value={selectedEnvironmentId}
              onChange={(e) => {
                setSelectedEnvironmentId(e.target.value);
                localStorage.setItem("apiforge_selected_env", e.target.value);
              }}
              className="bg-transparent text-xs text-amber-400 font-bold focus:outline-none cursor-pointer pr-1"
              id="select-environment-dropdown"
            >
              <option value="none" className="bg-slate-950 text-slate-400">No Environment</option>
              {environments.map((env) => (
                <option key={env.id} value={env.id} className="bg-slate-950 text-slate-200 font-medium">
                  {env.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setEditingEnvId(selectedEnvironmentId !== "none" ? selectedEnvironmentId : (environments[0]?.id || ""));
                setShowEnvModal(true);
              }}
              className="p-1 hover:bg-slate-900 text-slate-400 hover:text-amber-400 rounded transition"
              title="Configure environment variables"
              id="btn-manage-envs"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900">
            <span className="text-slate-500 font-semibold">Proxy Engine:</span>
            {proxyHealthy === null ? (
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-pulse"></span> Connecting
              </span>
            ) : proxyHealthy ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> ACTIVE (CORS-FREE)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> SANDBOX CHANNELS
              </span>
            )}
            <button 
              onClick={checkProxyStatus}
              title="Ping Backend health check"
              className="p-0.5 hover:bg-slate-900 text-slate-500 hover:text-white rounded transition"
              id="btn-trigger-health-check"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (History, Presets & Folders panel) */}
        <HistoryPanel
          historyItems={historyItems}
          presets={API_PRESETS}
          collections={collections}
          onLoadRequest={handleLoadRequest}
          onClearHistory={handleClearHistory}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          onAddCollection={handleAddCollection}
          onDeleteCollection={handleDeleteCollection}
          onDeleteCollectionRequest={handleDeleteCollectionRequest}
          onExportCollection={handleExportCollection}
          onImportCollections={handleImportCollections}
        />

        {/* WORK BENCH DECK */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          
          {/* TOP CONTROLS FOR HTTP REQUEST DESIGNER */}
          <RequestPanel
            url={url}
            setUrl={setUrl}
            method={method}
            setMethod={setMethod}
            loading={loading}
            onSendRequest={handleSendRequest}
            activeRequestTab={activeRequestTab}
            setActiveRequestTab={setActiveRequestTab}
            requestName={requestName}
            setRequestName={setRequestName}
            collections={collections}
            onSaveToCollection={handleSaveToCollection}
            headerCount={headers.filter((h) => h.key.trim()).length}
            paramCount={params.filter((p) => p.enabled && p.key.trim()).length}
            bodyType={bodyType}
            onShareLink={handleShareLink}
          />

          {/* ACTIVE REQUEST DETAILS SUB-PANELS */}
          <div className="p-6 bg-slate-950/20 border-b border-slate-900/60 min-h-[160px]">
            {activeRequestTab === "params" && (
              <HeadersEditor
                items={params}
                onAddRow={() => setParams([...params, { key: "", value: "", enabled: true }])}
                onUpdateRow={(index, field, value) => {
                  const updated = [...params];
                  updated[index] = { ...updated[index], [field]: value };
                  setParams(updated);
                }}
                onDeleteRow={(index) => {
                  const filtered = params.filter((_, i) => i !== index);
                  setParams(filtered.length ? filtered : [{ key: "", value: "", enabled: true }]);
                }}
                placeholderKey="query_param"
                placeholderValue="value"
              />
            )}

            {activeRequestTab === "headers" && (
              <HeadersEditor
                items={headers}
                onAddRow={() => setHeaders([...headers, { key: "", value: "", enabled: true }])}
                onUpdateRow={(index, field, value) => {
                  const updated = [...headers];
                  updated[index] = { ...updated[index], [field]: value };
                  setHeaders(updated);
                }}
                onDeleteRow={(index) => {
                  const filtered = headers.filter((_, i) => i !== index);
                  setHeaders(filtered.length ? filtered : [{ key: "", value: "", enabled: true }]);
                }}
                placeholderKey="X-Custom-Header"
                placeholderValue="header-value"
              />
            )}

            {activeRequestTab === "body" && (
              <BodyEditor
                bodyType={bodyType}
                setBodyType={setBodyType}
                bodyContent={bodyContent}
                setBodyContent={setBodyContent}
                onFormatJson={formatJsonContent}
              />
            )}

            {activeRequestTab === "auth" && (
              <div className="space-y-4 max-w-2xl animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Authentication Type:</span>
                  <select
                    value={auth.type}
                    onChange={(e) => setAuth({ ...auth, type: e.target.value as any })}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-1 rounded focus:outline-none cursor-pointer"
                    id="select-auth-type"
                  >
                    <option value="none">None (Public API)</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apikey">API Key Credentials</option>
                  </select>
                </div>

                {auth.type === "bearer" && (
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
                    <label className="block text-xs text-slate-400 font-semibold font-mono">Token Payload Value</label>
                    <input
                      type="password"
                      value={auth.bearerToken}
                      onChange={(e) => setAuth({ ...auth, bearerToken: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded px-3 py-2 text-xs font-mono text-amber-400 placeholder:text-slate-700 focus:outline-none"
                      id="input-auth-bearer"
                    />
                  </div>
                )}

                {auth.type === "basic" && (
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs text-slate-400 font-semibold font-mono">Username</label>
                      <input
                        type="text"
                        value={auth.basicUsername}
                        onChange={(e) => setAuth({ ...auth, basicUsername: e.target.value })}
                        placeholder="admin"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                        id="input-auth-basic-username"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs text-slate-400 font-semibold font-mono">Password</label>
                      <input
                        type="password"
                        value={auth.basicPassword}
                        onChange={(e) => setAuth({ ...auth, basicPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                        id="input-auth-basic-password"
                      />
                    </div>
                  </div>
                )}

                {auth.type === "apikey" && (
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs text-slate-400 font-semibold font-mono">Key Parameter Name</label>
                        <input
                          type="text"
                          value={auth.apiKeyKey}
                          onChange={(e) => setAuth({ ...auth, apiKeyKey: e.target.value })}
                          placeholder="x-api-key"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none"
                           id="input-auth-api-key"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs text-slate-400 font-semibold font-mono">Key Secret Value</label>
                        <input
                          type="password"
                          value={auth.apiKeyValue}
                          onChange={(e) => setAuth({ ...auth, apiKeyValue: e.target.value })}
                          placeholder="api_secret_token_val_..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none"
                          id="input-auth-api-val"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono">Inject Credential inside:</span>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name="apiKeyAddTo"
                            checked={auth.apiKeyAddTo === "header"}
                            onChange={() => setAuth({ ...auth, apiKeyAddTo: "header" })}
                            className="bg-slate-900 border-slate-800 text-amber-500 focus:ring-0 font-bold"
                          />
                          <span>HTTP Header Row</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer ml-3">
                          <input
                            type="radio"
                            name="apiKeyAddTo"
                            checked={auth.apiKeyAddTo === "query"}
                            onChange={() => setAuth({ ...auth, apiKeyAddTo: "query" })}
                            className="bg-slate-900 border-slate-800 text-amber-500 focus:ring-0 font-bold"
                          />
                          <span>URL Query parameters string</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {auth.type === "none" && (
                  <p className="text-xs text-slate-500 italic">No authentication is active for this Request Session.</p>
                )}
              </div>
            )}
          </div>

          {/* DUAL CODES & REACTION LAYOUT VIEW */}
          <div className="p-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 flex-1 min-h-[460px] bg-slate-950/40">
            
            {/* COLUMN 1: INTERACTIVE RESPONSE FEEDBACK VIEWER */}
            <ResponsePanel
              response={response}
              loading={loading}
              activeResponseTab={activeResponseTab}
              setActiveResponseTab={setActiveResponseTab}
            />

            {/* COLUMN 2: EXPORT SOURCE CODE GENERATOR */}
            <div className="border border-slate-900 bg-slate-950 rounded-xl p-5 flex flex-col justify-between max-h-[420px] shadow-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">cURL Generator</span>
                  <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-900/80">
                    <button
                      onClick={() => setActiveCodeLang("curl")}
                      className={`px-2 py-0.5 text-[10px] rounded font-bold transition ${
                        activeCodeLang === "curl" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                      id="export-lang-curl"
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setActiveCodeLang("fetch")}
                      className={`px-2 py-0.5 text-[10px] rounded font-bold transition ${
                        activeCodeLang === "fetch" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                      id="export-lang-fetch"
                    >
                      Fetch
                    </button>
                    <button
                      onClick={() => setActiveCodeLang("python")}
                      className={`px-2 py-0.5 text-[10px] rounded font-bold transition ${
                        activeCodeLang === "python" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                      id="export-lang-python"
                    >
                      python
                    </button>
                  </div>
                </div>

                <div className="relative border border-slate-900 bg-slate-950 rounded-lg p-3 overflow-hidden max-h-[205px] overflow-y-auto">
                  <pre className="text-[10px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap break-all select-all">
                    {getExporterSnippet()}
                  </pre>
                </div>
              </div>

              <button
                onClick={handleCopySnippet}
                className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-xs font-bold rounded-lg flex items-center justify-center gap-2 text-slate-200 hover:text-white transition"
                id="btn-copy-export"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied command!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Equivalent cURL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* OVERLAY DIALOG: ENVIRONMENT VARIABLES MANAGER (Requirement #3) */}
      {showEnvModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="modal-manage-environments">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-sm tracking-tight text-slate-100 uppercase font-mono">Environment Variables Manager</span>
              </div>
              <button 
                onClick={() => setShowEnvModal(false)}
                className="text-slate-500 hover:text-white transition"
                id="btn-close-env-modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Split Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[300px]">
              {/* Left sidebar: environment list */}
              <div className="w-full md:w-56 border-r border-slate-800 p-3 bg-slate-950/20 flex flex-col justify-between overflow-y-auto shrink-0">
                <div className="space-y-1">
                  <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Environments</span>
                  {environments.map((env) => (
                    <div 
                      key={env.id}
                      className={`flex items-center justify-between p-2 rounded text-xs transition cursor-pointer ${
                        editingEnvId === env.id 
                          ? "bg-slate-800 text-amber-400 font-bold border border-slate-700" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                      onClick={() => setEditingEnvId(env.id)}
                    >
                      <span className="truncate flex-1">{env.name}</span>
                      {environments.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntireEnvironment(env.id);
                          }}
                          className="hover:text-rose-500 text-slate-600 p-0.5"
                          title="Delete environment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCreateNewEnvironment}
                  className="mt-4 w-full py-1.5 px-2.5 bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-200 hover:text-amber-400 rounded-lg font-bold flex items-center justify-center gap-1.5 transition uppercase tracking-wider shrink-0"
                  id="btn-add-environment"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Env</span>
                </button>
              </div>

              {/* Right content: selected environment detail */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {currentEditingEnv ? (
                  <div className="space-y-4">
                    {/* Env Name Editor */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Environment Name</label>
                      <input
                        type="text"
                        value={currentEditingEnv.name}
                        onChange={(e) => {
                          const updated = environments.map((env) => {
                            if (env.id === editingEnvId) {
                              return { ...env, name: e.target.value };
                            }
                            return env;
                          });
                          saveEnvironments(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                        id="input-edit-env-name"
                      />
                    </div>

                    {/* Variables table list */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                          Variables (replaces <code>{"{{variable_key}}"}</code> strings)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddEnvVariable}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                          id="btn-add-env-var-row"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Key</span>
                        </button>
                      </div>

                      {currentEditingEnv.variables.length === 0 ? (
                        <div className="p-4 text-center rounded border border-dashed border-slate-800 bg-slate-950/20">
                          <p className="text-[11px] text-slate-500 italic">No variables added. Click "Add Key" to create substitution variables.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto">
                          {currentEditingEnv.variables.map((v, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              {/* Enabled Checkbox */}
                              <input
                                type="checkbox"
                                checked={v.enabled}
                                onChange={(e) => handleUpdateEnvVariable(idx, "enabled", e.target.checked)}
                                className="bg-slate-950 border-slate-800 rounded text-amber-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                                title="Toggle variable activation"
                              />

                              {/* Key String */}
                              <input
                                type="text"
                                value={v.key}
                                onChange={(e) => handleUpdateEnvVariable(idx, "key", e.target.value)}
                                placeholder="variableKey"
                                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-amber-300 font-mono focus:outline-none focus:border-slate-700"
                              />

                              {/* Value String */}
                              <input
                                type="text"
                                value={v.value}
                                onChange={(e) => handleUpdateEnvVariable(idx, "value", e.target.value)}
                                placeholder="actual value"
                                className="flex-[2] bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-slate-700"
                              />

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteEnvVariable(idx)}
                                className="text-slate-600 hover:text-rose-400 p-1"
                                title="Remove variable row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-6 text-center">Select an environment or create a new one to begin editing variables.</p>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowEnvModal(false)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg uppercase tracking-wider"
                id="btn-save-env-modal"
              >
                Save & Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
