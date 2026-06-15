import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { KeyValuePair } from "../types";

interface HeadersEditorProps {
  items: KeyValuePair[];
  onAddRow: () => void;
  onUpdateRow: (index: number, field: "key" | "value" | "enabled", value: any) => void;
  onDeleteRow: (index: number) => void;
  placeholderKey?: string;
  placeholderValue?: string;
}

export default function HeadersEditor({
  items,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  placeholderKey = "Content-Type",
  placeholderValue = "application/json"
}: HeadersEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium font-mono">Variables & parameters will replace items matching {"{{variableName}}"} automatically</span>
        <button
          type="button"
          onClick={onAddRow}
          className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition"
          id="btn-add-header-row"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Parameter Row</span>
        </button>
      </div>

      <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950 shadow-inner">
        {/* Table Header Section */}
        <div className="grid grid-cols-[30px_1fr_1fr_40px] bg-slate-900/60 p-2 border-b border-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          <div className="text-center">Use</div>
          <div>Header Key</div>
          <div>Header Value</div>
          <div className="text-center">Action</div>
        </div>

        {/* Table Rows */}
        <div className="p-1 space-y-1 min-h-[44px]">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center hover:bg-slate-900/20 p-1 rounded-md transition duration-150">
              {/* Enabled Checkbox */}
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => onUpdateRow(index, "enabled", e.target.checked)}
                  className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-800 text-amber-500 accent-amber-500 focus:ring-0 focus:outline-none cursor-pointer"
                  id={`header-enabled-${index}`}
                />
              </div>

              {/* Key Input Field */}
              <div>
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => onUpdateRow(index, "key", e.target.value)}
                  placeholder={placeholderKey}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-md px-2.5 py-1.5 text-xs text-amber-400 font-mono placeholder:text-slate-700"
                  id={`header-key-${index}`}
                />
              </div>

              {/* Value Input Field */}
              <div>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => onUpdateRow(index, "value", e.target.value)}
                  placeholder={placeholderValue}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-300 font-mono placeholder:text-slate-700"
                  id={`header-val-${index}`}
                />
              </div>

              {/* Delete Icon Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onDeleteRow(index)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition hover:bg-slate-900 rounded"
                  id={`header-del-row-${index}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
