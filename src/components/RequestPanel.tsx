import React, { useState } from "react";
import { Send, RefreshCw, FolderOpen, Save, Share2, Check } from "lucide-react";
import { HttpMethod, Collection } from "../types";

interface RequestPanelProps {
  url: string;
  setUrl: (url: string) => void;
  method: HttpMethod;
  setMethod: (method: HttpMethod) => void;
  loading: boolean;
  onSendRequest: (e: React.FormEvent) => void;
  activeRequestTab: "headers" | "body" | "auth" | "params";
  setActiveRequestTab: (tab: "headers" | "body" | "auth" | "params") => void;
  requestName: string;
  setRequestName: (name: string) => void;
  collections: Collection[];
  onSaveToCollection: (collectionId: string) => void;
  headerCount: number;
  paramCount: number;
  bodyType: "none" | "json" | "text" | "form-data";
  onShareLink: () => void;
}

export default function RequestPanel({
  url,
  setUrl,
  method,
  setMethod,
  loading,
  onSendRequest,
  activeRequestTab,
  setActiveRequestTab,
  requestName,
  setRequestName,
  collections,
  onSaveToCollection,
  headerCount,
  paramCount,
  bodyType,
  onShareLink
}: RequestPanelProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    collections[0]?.id || "coll-default"
  );
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const handleShareClick = () => {
    onShareLink();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSaveClick = () => {
    onSaveToCollection(selectedFolderId);
  };

  return (
    <div className="p-5 border-b border-slate-900 bg-slate-950/70 space-y-4" id="request-panel-inputs-deck">
      {/* Target Title label and storage controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
          <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">Request Label:</span>
          <input
            type="text"
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
            placeholder="Fetch Endpoint Title"
            className="bg-transparent text-slate-100 font-bold text-xs border-b border-transparent hover:border-slate-800 focus:outline-none focus:border-slate-700 px-1 py-0.5 flex-1"
            id="input-req-name"
          />
        </div>

        {/* Action button deck */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Shareable Links */}
          <button
            type="button"
            onClick={handleShareClick}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-805 text-slate-300 hover:text-amber-400 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
            id="btn-share-request-link"
            title="Generate a URL of this configuration and copy it to the clipboard"
          >
            {copiedShare ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Share Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Request</span>
              </>
            )}
          </button>

          {/* Collection folder selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 shrink-0">
            <span className="text-[10px] text-slate-500 font-mono font-bold mr-1.5 uppercase">Folder:</span>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer max-w-[125px] pr-1 py-1"
              id="select-save-destination-folder"
            >
              {collections.map((col) => (
                <option key={col.id} value={col.id} className="bg-slate-900 text-slate-200">
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSaveClick}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            id="btn-save-request"
          >
            <Save className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Save to Folder</span>
          </button>
        </div>
      </div>

      <form onSubmit={onSendRequest} className="space-y-4">
        {/* URL + Send deck */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            
            {/* HTTP verb selector */}
            <div className="relative">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className={`h-full min-w-[95px] font-mono text-xs font-extrabold focus:outline-none rounded-lg border px-3.5 cursor-pointer appearance-none text-center transition ${
                  method === "GET" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                  method === "POST" ? "bg-blue-500/15 border-blue-500/30 text-blue-400" :
                  method === "PUT" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" :
                  "bg-rose-500/15 border-rose-500/30 text-rose-400"
                }`}
                id="select-method"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
                <option value="HEAD">HEAD</option>
              </select>
            </div>

            {/* Main URL Textbar */}
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/resource"
                className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-lg px-4 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none transition leading-relaxed shadow-inner"
                id="input-url"
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-extrabold text-xs text-slate-950 uppercase tracking-widest rounded-lg shadow-lg hover:shadow-rose-950/20 shadow-rose-950/5 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
            id="btn-send-request"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tabs list inside RequestPanel */}
      <div className="border-b border-slate-900 flex py-1 bg-transparent gap-1 overflow-x-auto" id="request-subtabs-row">
        <button
          type="button"
          onClick={() => setActiveRequestTab("params")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition shrink-0 ${
            activeRequestTab === "params"
              ? "bg-slate-900 border-slate-800 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="btn-req-tab-params"
        >
          Params ({paramCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveRequestTab("headers")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition shrink-0 ${
            activeRequestTab === "headers"
              ? "bg-slate-900 border-slate-800 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="btn-req-tab-headers"
        >
          Headers ({headerCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveRequestTab("body")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition shrink-0 ${
            activeRequestTab === "body"
              ? "bg-slate-900 border-slate-800 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="btn-req-tab-body"
        >
          Body ({bodyType.toUpperCase()})
        </button>
        <button
          type="button"
          onClick={() => setActiveRequestTab("auth")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition shrink-0 ${
            activeRequestTab === "auth"
              ? "bg-slate-900 border-slate-800 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="btn-req-tab-auth"
        >
          Auth Settings
        </button>
      </div>
    </div>
  );
}
