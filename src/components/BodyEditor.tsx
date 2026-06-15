import React, { useState } from "react";
import { Code, Check, AlertCircle, Sparkles } from "lucide-react";
import { BodyType } from "../types";

interface BodyEditorProps {
  bodyType: BodyType;
  setBodyType: (type: BodyType) => void;
  bodyContent: string;
  setBodyContent: (content: string) => void;
  onFormatJson: () => void;
}

export default function BodyEditor({
  bodyType,
  setBodyType,
  bodyContent,
  setBodyContent,
  onFormatJson
}: BodyEditorProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Validate JSON Structure
  const checkJsonSyntax = (txt: string) => {
    setBodyContent(txt);
    if (bodyType !== "json" || !txt.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(txt);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax");
    }
  };

  return (
    <div className="space-y-4">
      {/* Body Selector Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-2">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Payload Format:</span>
        <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-900/80">
          <button
            type="button"
            onClick={() => {
              setBodyType("none");
              setJsonError(null);
            }}
            className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
              bodyType === "none"
                ? "bg-slate-800 text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="body-type-none"
          >
            None
          </button>
          <button
            type="button"
            onClick={() => {
              setBodyType("json");
              checkJsonSyntax(bodyContent);
            }}
            className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
              bodyType === "json"
                ? "bg-slate-800 text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="body-type-json"
          >
            JSON (application/json)
          </button>
          <button
            type="button"
            onClick={() => {
              setBodyType("text");
              setJsonError(null);
            }}
            className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
              bodyType === "text"
                ? "bg-slate-800 text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="body-type-raw"
          >
            Raw Text
          </button>
        </div>

        {bodyType === "json" && bodyContent.trim() && (
          <button
            type="button"
            onClick={onFormatJson}
            className="ml-auto px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 rounded-md text-xs font-semibold flex items-center gap-1.5 transition"
            id="btn-format-json"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Format JSON Payload</span>
          </button>
        )}
      </div>

      {/* Editor Content Area */}
      {bodyType === "none" ? (
        <div className="p-8 text-center rounded-lg border border-dashed border-slate-900 bg-slate-950 flex flex-col items-center gap-2">
          <Code className="h-6 w-6 text-slate-700" />
          <p className="text-xs text-slate-500">This request does not transmit any content payload body stream.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative border border-slate-900 bg-slate-950 rounded-lg overflow-hidden focus-within:border-slate-800 transition">
            
            <textarea
              value={bodyContent}
              onChange={(e) => checkJsonSyntax(e.target.value)}
              placeholder={
                bodyType === "json"
                  ? '{\n  "demo": "JSONPayload",\n  "enabled": true\n}'
                  : "Insert request raw parameters stream here..."
              }
              rows={6}
              className="w-full text-xs font-mono bg-transparent p-4 focus:outline-none text-slate-200 placeholder:text-slate-700 leading-relaxed resize-y min-h-[120px]"
              id="raw-body-content-textarea"
            />
          </div>

          {/* Syntax check footer */}
          {bodyType === "json" && (
            <div className="flex items-center justify-between text-[11px] font-mono px-1">
              {jsonError ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Invalid JSON Syntax: {jsonError}</span>
                </span>
              ) : bodyContent.trim() ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  <span>Syntactically Valid JSON Structure</span>
                </span>
              ) : (
                <span className="text-slate-500">JSON document is empty</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
