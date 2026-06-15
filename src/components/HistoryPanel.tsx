import React, { useState, useRef } from "react";
import { 
  History, 
  Sparkles, 
  Trash2, 
  Clock, 
  FolderPlus, 
  Folder, 
  FolderOpen, 
  FileText, 
  Download, 
  Upload, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  X 
} from "lucide-react";
import { HistoryItem, ApiPreset, Collection, RequestConfig } from "../types";

interface HistoryPanelProps {
  historyItems: HistoryItem[];
  presets: ApiPreset[];
  collections: Collection[];
  onLoadRequest: (config: any) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  sidebarTab: "history" | "presets" | "collections";
  setSidebarTab: (tab: "history" | "presets" | "collections") => void;
  onAddCollection: (name: string, description?: string) => void;
  onDeleteCollection: (id: string) => void;
  onDeleteCollectionRequest: (collectionId: string, requestId: string) => void;
  onExportCollection: (collection: Collection) => void;
  onImportCollections: (imported: Collection[]) => void;
}

export default function HistoryPanel({
  historyItems,
  presets,
  collections,
  onLoadRequest,
  onClearHistory,
  onDeleteHistoryItem,
  sidebarTab,
  setSidebarTab,
  onAddCollection,
  onDeleteCollection,
  onDeleteCollectionRequest,
  onExportCollection,
  onImportCollections
}: HistoryPanelProps) {
  const [newCollName, setNewCollName] = useState("");
  const [newCollDesc, setNewCollDesc] = useState("");
  const [showCreateColl, setShowCreateColl] = useState(false);
  const [expandedColls, setExpandedColls] = useState<Record<string, boolean>>({
    "coll-default": true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCollection = (id: string) => {
    setExpandedColls((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCreateCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollName.trim()) return;
    onAddCollection(newCollName.trim(), newCollDesc.trim());
    setNewCollName("");
    setNewCollDesc("");
    setShowCreateColl(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Handle both single collection and array of collections
        let importedList: Collection[] = [];
        if (Array.isArray(parsed)) {
          importedList = parsed.filter(item => item && item.name && Array.isArray(item.requests));
        } else if (parsed && parsed.name && Array.isArray(parsed.requests)) {
          importedList = [parsed];
        } else {
          alert("Invalid Collection Format. Please import a properly formatted JSON backup file.");
          return;
        }

        if (importedList.length > 0) {
          onImportCollections(importedList);
          alert(`Successfully imported ${importedList.length} collection(s)!`);
        } else {
          alert("No valid collections found in JSON.");
        }
      } catch (err) {
        alert("Failed to parse JSON file. Please ensure it is a valid collections export.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-900 w-80 shrink-0">
      {/* Sidebar Tab Selector */}
      <div className="flex border-b border-slate-900 bg-slate-900/40 p-2 gap-1" id="sidebar-tabs-container">
        <button
          onClick={() => setSidebarTab("presets")}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition ${
            sidebarTab === "presets"
              ? "bg-slate-800 text-amber-400 border border-slate-800"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
          id="tab-presets"
        >
          <Sparkles className="h-3 w-3" />
          <span>Presets</span>
        </button>
        <button
          onClick={() => setSidebarTab("collections")}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition ${
            sidebarTab === "collections"
              ? "bg-slate-800 text-amber-400 border border-slate-800"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
          id="tab-collections"
        >
          <Folder className="h-3 w-3" />
          <span>Folders ({collections.length})</span>
        </button>
        <button
          onClick={() => setSidebarTab("history")}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition ${
            sidebarTab === "history"
              ? "bg-slate-800 text-amber-400 border border-slate-800"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
          id="tab-history"
        >
          <History className="h-3 w-3" />
          <span>History ({historyItems.length})</span>
        </button>
      </div>

      {/* Panel Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sidebarTab === "presets" && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">API Templates</h3>
            <div className="space-y-1.5" id="presets-list">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => onLoadRequest(preset)}
                  className="w-full text-left p-2.5 rounded border border-slate-900 bg-slate-900/30 hover:bg-slate-900/60 hover:border-slate-800 transition flex flex-col gap-1 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  id={`preset-${index}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs text-slate-200 truncate">{preset.name}</span>
                    <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded select-none ${
                      preset.method === "GET" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                    }`}>
                      {preset.method}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{preset.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-full bg-slate-950/60 px-1 py-0.5 rounded border border-slate-900/10">{preset.url}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {sidebarTab === "collections" && (
          <div className="space-y-3" id="collections-list-container">
            {/* Header Tools */}
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Saved Libraries</h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 hover:bg-slate-900/60 text-slate-400 hover:text-amber-400 rounded transition"
                  title="Import collections from JSON"
                  id="btn-import-collections"
                >
                  <Upload className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setShowCreateColl(true)}
                  className="p-1 hover:bg-slate-900/60 text-slate-400 hover:text-amber-400 rounded transition flex items-center gap-1"
                  title="Create folder / bucket"
                  id="btn-show-create-collection"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>

            {/* Create Collection Drawer Form */}
            {showCreateColl && (
              <form onSubmit={handleCreateCollectionSubmit} className="p-3 bg-slate-900/40 rounded border border-slate-800 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">New Collection</span>
                  <button type="button" onClick={() => setShowCreateColl(false)} className="text-slate-500 hover:text-rose-400">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={newCollName}
                    onChange={(e) => setNewCollName(e.target.value)}
                    placeholder="Folder name (e.g. Stripe Sync)"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-medium"
                    id="input-new-collection-name"
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={newCollDesc}
                    onChange={(e) => setNewCollDesc(e.target.value)}
                    placeholder="Optional details..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-slate-700"
                    id="input-new-collection-desc"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newCollName.trim()}
                  className="w-full py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-[10px] rounded uppercase tracking-wider"
                >
                  Build Folder
                </button>
              </form>
            )}

            {/* Collections List */}
            {collections.length === 0 ? (
              <div className="p-6 text-center rounded border border-dashed border-slate-900 bg-slate-900/10 flex flex-col items-center gap-2">
                <Folder className="h-5 w-5 text-slate-700" />
                <p className="text-xs text-slate-500">No folders configured</p>
              </div>
            ) : (
              <div className="space-y-2" id="folders-collapsible-list">
                {collections.map((col) => {
                  const isExpanded = !!expandedColls[col.id];
                  return (
                    <div key={col.id} className="border border-slate-900/60 rounded-lg overflow-hidden bg-slate-950/40">
                      {/* folder header row */}
                      <div className="flex items-center justify-between p-2 bg-slate-900/20 hover:bg-slate-900/40 transition">
                        <button
                          onClick={() => toggleCollection(col.id)}
                          className="flex-1 flex items-center gap-1.5 text-left text-xs font-semibold text-slate-300 hover:text-white transition focus:outline-none truncate"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          )}
                          {isExpanded ? (
                            <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <Folder className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{col.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-normal">({col.requests.length})</span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Export */}
                          <button
                            onClick={() => onExportCollection(col)}
                            title="Export single collection"
                            className="p-1 text-slate-500 hover:text-amber-400 hover:bg-slate-800/30 rounded transition"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          
                          {/* Delete Collection */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete the entire folder "${col.name}" and all its saved requests?`)) {
                                onDeleteCollection(col.id);
                              }
                            }}
                            title="Delete collection folder"
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800/30 rounded transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* collection details subtitle if expanded */}
                      {isExpanded && col.description && (
                        <p className="px-3.5 py-1 text-[10px] text-slate-500 bg-slate-900/10 italic border-b border-slate-900/40">
                          {col.description}
                        </p>
                      )}

                      {/* Items under this collection */}
                      {isExpanded && (
                        <div className="p-1.5 space-y-1 bg-slate-950/20 border-t border-slate-900/30 animate-fadeIn">
                          {col.requests.length === 0 ? (
                            <p className="text-[10px] text-slate-600 italic p-2 text-center">Empty directory</p>
                          ) : (
                            col.requests.map((req) => (
                              <div
                                key={req.id}
                                className="group relative flex items-center justify-between p-1.5 rounded bg-slate-950/60 hover:bg-slate-900/40 border border-slate-900/40 hover:border-slate-800/60 transition"
                              >
                                <button
                                  onClick={() => onLoadRequest(req)}
                                  className="flex-1 text-left flex flex-col gap-0.5 truncate focus:outline-none"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className={`text-[8px] font-mono font-extrabold px-1 rounded select-none ${
                                      req.method === "GET" ? "bg-emerald-500/15 text-emerald-400" :
                                      req.method === "POST" ? "bg-blue-500/15 text-blue-400" :
                                      req.method === "PUT" ? "bg-amber-500/15 text-amber-400" :
                                      "bg-rose-500/15 text-rose-400"
                                    }`}>
                                      {req.method}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-400 transition truncate">
                                      {req.name || "Untitled"}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-slate-500 font-mono truncate px-1">
                                    {req.url}
                                  </span>
                                </button>

                                <button
                                  onClick={() => onDeleteCollectionRequest(col.id, req.id)}
                                  title="Remove from Folder"
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-rose-400 transition rounded"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {sidebarTab === "history" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Execution Logs</h3>
              {historyItems.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[11px] text-slate-500 hover:text-rose-400 font-medium transition flex items-center gap-1"
                  id="btn-clear-all-history"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {historyItems.length === 0 ? (
              <div className="p-6 text-center rounded border border-dashed border-slate-900 bg-slate-900/10 flex flex-col items-center gap-2">
                <Clock className="h-5 w-5 text-slate-700" />
                <p className="text-xs text-slate-500">No recent request logs</p>
              </div>
            ) : (
              <div className="space-y-1.5" id="history-items-list">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded border border-slate-900 bg-slate-900/10 hover:bg-slate-900/40 hover:border-slate-800 transition flex flex-col gap-1 relative group"
                  >
                    <div className="flex items-start justify-between pr-5">
                      <button
                        onClick={() => onLoadRequest({
                          url: item.config.url,
                          method: item.config.method,
                          name: item.config.name,
                          headers: item.config.headers,
                          params: item.config.params,
                          bodyType: item.config.bodyType,
                          bodyContent: item.config.bodyContent,
                          auth: item.config.auth
                        })}
                        className="text-left text-xs font-semibold text-slate-300 hover:text-amber-400 transition truncate focus:outline-none"
                        id={`curr-hist-${item.id}`}
                      >
                        {item.config.name || item.config.url}
                      </button>
                      <button
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 transition rounded opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5"
                        title="Delete record"
                        id={`del-hist-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-extrabold px-1 rounded select-none ${
                        item.config.method === "GET" ? "bg-emerald-500/15 text-emerald-400" :
                        item.config.method === "POST" ? "bg-blue-500/15 text-blue-400" :
                        item.config.method === "PUT" ? "bg-amber-500/15 text-amber-400" :
                        "bg-rose-500/15 text-rose-400"
                      }`}>
                        {item.config.method}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${
                        item.response.status >= 200 && item.response.status < 300 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {item.response.status}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono ml-auto">{item.timestamp}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate bg-slate-950 px-1 py-0.5 rounded border border-slate-900/20">{item.config.url}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
