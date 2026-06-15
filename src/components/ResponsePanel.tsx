import React, { useState } from "react";
import { Copy, Check, Database, Clock, Terminal, ChevronRight, Eye, Layers, Download, Search, X } from "lucide-react";
import { WebResponse } from "../types";

interface ResponsePanelProps {
  response: WebResponse | null;
  loading: boolean;
  activeResponseTab: "body" | "headers" | "raw";
  setActiveResponseTab: (tab: "body" | "headers" | "raw") => void;
}

export default function ResponsePanel({
  response,
  loading,
  activeResponseTab,
  setActiveResponseTab
}: ResponsePanelProps) {
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Copy entire output payload to clipboard
  const handleCopyPayload = () => {
    if (!response) return;
    const textToCopy = typeof response.body === "object"
      ? JSON.stringify(response.body, null, 2)
      : String(response.body);

    navigator.clipboard.writeText(textToCopy);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Download entire payload as a file (.json or .txt)
  const handleDownloadPayload = () => {
    if (!response) return;
    const isJsonObject = typeof response.body === "object";
    const textToSave = isJsonObject
      ? JSON.stringify(response.body, null, 2)
      : String(response.body);

    const blob = new Blob([textToSave], { 
      type: isJsonObject ? "application/json" : "text/plain" 
    });
    const downloadUrl = URL.createObjectURL(blob);
    const linkElement = document.createElement("a");
    linkElement.href = downloadUrl;
    linkElement.download = `response-${Date.now()}.${isJsonObject ? "json" : "txt"}`;
    
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(downloadUrl);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-slate-950 border border-slate-900 rounded-xl p-8 gap-3" id="response-loading-state">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-slate-800 border-t-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Layers className="h-4 w-4 text-slate-500" />
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono">Routing through Outbound CORS-bypasser...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-slate-950 border border-slate-900 rounded-xl p-12 text-center gap-2" id="response-empty-state">
        <Terminal className="h-8 w-8 text-slate-800" />
        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Awaiting Execution</h4>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          Configure a query URL, choose an HTTP method verb, payload settings, and hit <b>Execute</b> to retrieve a response.
        </p>
      </div>
    );
  }

  // Determine badge colors based on Response HTTP Status Group
  const getStatusColorClass = (code: number) => {
    if (code >= 200 && code < 300) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (code >= 300 && code < 400) return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (code >= 400 && code < 500) return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  };

  // Convert response size to readable formats
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Recursive highlighter for matching search strings in code blocks
  const highlightSearchMatch = (tokenText: string, query: string): React.ReactNode => {
    if (!query || !tokenText.toLowerCase().includes(query.toLowerCase())) {
      return tokenText;
    }
    const parts: React.ReactNode[] = [];
    let currentIdx = 0;
    const length = query.length;

    while (currentIdx < tokenText.length) {
      const matchIdx = tokenText.toLowerCase().indexOf(query.toLowerCase(), currentIdx);
      if (matchIdx === -1) {
        parts.push(tokenText.substring(currentIdx));
        break;
      }
      if (matchIdx > currentIdx) {
        parts.push(tokenText.substring(currentIdx, matchIdx));
      }
      parts.push(
        <mark key={matchIdx} className="bg-amber-400/90 text-slate-950 font-bold rounded px-0.5 animate-pulse select-all">
          {tokenText.substring(matchIdx, matchIdx + length)}
        </mark>
      );
      currentIdx = matchIdx + length;
    }

    return <>{parts}</>;
  };

  // Compute search match counts safely
  const getSearchMatchCount = (): number => {
    if (!searchQuery || !response.body) return 0;
    const contentString = typeof response.body === "object"
      ? JSON.stringify(response.body)
      : String(response.body);
    
    let occurrences = 0;
    let pos = contentString.toLowerCase().indexOf(searchQuery.toLowerCase());
    while (pos !== -1) {
      occurrences++;
      pos = contentString.toLowerCase().indexOf(searchQuery.toLowerCase(), pos + searchQuery.length);
    }
    return occurrences;
  };

  // Pretty JSON highlighters with precise class names & word matcher integrations
  const renderFormattedJson = (obj: any): React.ReactNode => {
    if (obj === null || obj === undefined) return <span className="text-slate-600">null</span>;
    try {
      const jsonStr = JSON.stringify(obj, null, 2);
      
      // Tokenize for high contrast VS Code dark aesthetic
      const tokens = jsonStr.split(/(".*?"|[-+\d.eE]+|true|false|null|[{}[\]:,])/);
      
      return (
        <pre className="text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre select-text selection:bg-slate-800" id="formatted-json-view">
          <code>
            {tokens.map((token, i) => {
              if (token.startsWith('"')) {
                // Key format: "key":
                if (jsonStr[jsonStr.indexOf(token) + token.length] === ':') {
                  return <span key={i} className="text-sky-400">{highlightSearchMatch(token, searchQuery)}</span>;
                }
                // String value format
                return <span key={i} className="text-amber-300">{highlightSearchMatch(token, searchQuery)}</span>;
              }
              if (/^(true|false)$/.test(token)) {
                return <span key={i} className="text-emerald-400 font-bold">{highlightSearchMatch(token, searchQuery)}</span>;
              }
              if (token === "null") {
                return <span key={i} className="text-slate-500">{highlightSearchMatch(token, searchQuery)}</span>;
              }
              if (/^\d+$/.test(token)) {
                return <span key={i} className="text-purple-400">{highlightSearchMatch(token, searchQuery)}</span>;
              }
              // Normal markup separators
              return <span key={i} className="text-slate-400">{highlightSearchMatch(token, searchQuery)}</span>;
            })}
          </code>
        </pre>
      );
    } catch {
      return <pre className="text-xs font-mono text-slate-300">{highlightSearchMatch(String(obj), searchQuery)}</pre>;
    }
  };

  const matchesFound = getSearchMatchCount();

  return (
    <div className="flex-1 flex flex-col border border-slate-900 bg-slate-950 rounded-xl overflow-hidden shadow-2xl" id="response-panel-card">
      {/* Response Summary Header */}
      <div className="bg-slate-900/40 p-4 border-b border-slate-900/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Response Console</span>
          
          {/* Code badge */}
          <span className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg ${getStatusColorClass(response.status)}`}>
            {response.status} {response.statusText}
          </span>

          {/* Time speed badge */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-xs font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>{response.durationMs} ms</span>
          </span>

          {/* Payload weight */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-xs font-mono text-slate-300">
            <Database className="h-3.5 w-3.5 text-slate-500" />
            <span>{formatBytes(response.sizeBytes)}</span>
          </span>
        </div>

        {/* Exporter Actions row */}
        <div className="flex items-center gap-2">
          {/* Download button */}
          <button
            onClick={handleDownloadPayload}
            className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-md flex items-center gap-1.5 transition"
            id="btn-download-response"
            title="Download full response data as JSON or TXT file"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>

          {/* Copy trigger button */}
          <button
            onClick={handleCopyPayload}
            className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-805 border border-slate-800 text-slate-300 hover:text-white rounded-md flex items-center gap-1.5 transition"
            id="btn-copy-response-payload"
          >
            {copiedPayload ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Payload</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Selector row + Search Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-900 bg-slate-950/80 p-2 gap-2">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveResponseTab("body")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
              activeResponseTab === "body"
                ? "bg-slate-900 border-slate-800 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            id="btn-resp-tab-body"
          >
            Response Body
          </button>
          <button
            onClick={() => setActiveResponseTab("headers")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
              activeResponseTab === "headers"
                ? "bg-slate-900 border-slate-800 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            id="btn-resp-tab-headers"
          >
            Headers ({Object.keys(response.headers).length})
          </button>
          <button
            onClick={() => setActiveResponseTab("raw")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
              activeResponseTab === "raw"
                ? "bg-slate-900 border-slate-800 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            id="btn-resp-tab-raw"
          >
            Raw String
          </button>
        </div>

        {/* Filter / Search inside active Response body */}
        {(activeResponseTab === "body" || activeResponseTab === "raw") && (
          <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-800 px-2.5 py-1 text-xs shrink-0 max-w-full sm:max-w-[220px]">
            <Search className="h-3.5 w-3.5 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search JSON response..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none w-full"
              id="input-response-search"
            />
            {searchQuery && (
              <div className="flex items-center gap-1.5 ml-1.5 shrink-0 select-none">
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 font-bold px-1 rounded">
                  {matchesFound} hits
                </span>
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="text-slate-500 hover:text-slate-300"
                  id="btn-clear-response-search"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Frame details block */}
      <div className="flex-1 p-5 overflow-auto max-h-[420px] bg-slate-950/20" id="response-contents-panel">
        {response.error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-semibold" id="response-error-banner">
            Gateway Error: {response.error}
          </div>
        )}

        {activeResponseTab === "body" && (
          <div className="font-mono bg-slate-950 p-4 border border-slate-900 rounded-lg max-h-[350px] overflow-y-auto w-full">
            {typeof response.body === "object" ? (
              renderFormattedJson(response.body)
            ) : response.body ? (
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap">{highlightSearchMatch(String(response.body), searchQuery)}</pre>
            ) : (
              <p className="text-xs text-slate-600 italic">No JSON readable content was returned in response payload.</p>
            )}
          </div>
        )}

        {activeResponseTab === "headers" && (
          <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950" id="response-headers-content-table">
            <div className="grid grid-cols-2 bg-slate-900/60 p-2 border-b border-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <div>HTTP Header Key</div>
              <div>Value</div>
            </div>
            
            <div className="p-1 space-y-1 divide-y divide-slate-900/50">
              {Object.entries(response.headers).map(([key, val]) => (
                <div key={key} className="grid grid-cols-2 gap-4 py-2 px-2 text-xs font-mono">
                  <div className="text-sky-400 font-medium break-all">{key}</div>
                  <div className="text-slate-300 break-all select-all">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeResponseTab === "raw" && (
          <div className="bg-slate-950 p-4 border border-slate-900 rounded-lg max-h-[350px] overflow-auto">
            <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed select-text">
              {highlightSearchMatch(
                typeof response.body === "object" 
                  ? JSON.stringify(response.body, null, 2) 
                  : String(response.body || "No result data available."),
                searchQuery
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
