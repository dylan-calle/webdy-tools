"use client";

import { useState, useMemo } from "react";
import {
  CaretDownIcon,
  CaretRightIcon,
  CopyIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ArrowsOutLineVerticalIcon,
  ArrowsInLineVerticalIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

interface JsonTreeViewerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  initialExpandedDepth?: number;
}

interface TreeNodeProps {
  name?: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  depth: number;
  path: string;
  searchTerm: string;
  isExpandedByDefault: boolean;
  collapseAllTrigger: number;
  expandAllTrigger: number;
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="text-muted-foreground font-mono italic">null</span>;
  }
  if (typeof value === "undefined") {
    return <span className="text-muted-foreground font-mono italic">undefined</span>;
  }
  if (typeof value === "string") {
    return (
      <span className="text-emerald-500 dark:text-emerald-400 font-mono break-all">
        &quot;{value}&quot;
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className="text-sky-500 dark:text-sky-400 font-mono">{String(value)}</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className="text-amber-500 dark:text-amber-400 font-mono font-medium">
        {String(value)}
      </span>
    );
  }
  return <span className="text-foreground font-mono">{String(value)}</span>;
}

function TreeNode({
  name,
  value,
  depth,
  path,
  searchTerm,
  isExpandedByDefault,
  collapseAllTrigger,
  expandAllTrigger,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(isExpandedByDefault);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  // Sync with global expand/collapse buttons
  const [lastExpandTrigger, setLastExpandTrigger] = useState(expandAllTrigger);
  const [lastCollapseTrigger, setLastCollapseTrigger] = useState(collapseAllTrigger);

  if (expandAllTrigger !== lastExpandTrigger) {
    setIsExpanded(true);
    setLastExpandTrigger(expandAllTrigger);
  }
  if (collapseAllTrigger !== lastCollapseTrigger) {
    setIsExpanded(false);
    setLastCollapseTrigger(collapseAllTrigger);
  }

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);

  // Match search term
  const matchesSearch = useMemo(() => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (name !== undefined && String(name).toLowerCase().includes(term)) return true;
    if (!isObject && String(value).toLowerCase().includes(term)) return true;
    if (isObject) {
      try {
        return JSON.stringify(value).toLowerCase().includes(term);
      } catch {
        return false;
      }
    }
    return false;
  }, [name, value, isObject, searchTerm]);

  if (!matchesSearch) return null;

  const handleCopyValue = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    await copyToClipboard(str);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const handleCopyPath = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(path || "root");
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
  };

  if (!isObject) {
    return (
      <div
        className="group/node flex items-center gap-1.5 py-0.5 hover:bg-muted/40 px-2 rounded font-mono text-[0.8125rem] transition-colors"
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        {name !== undefined && (
          <>
            <span className="text-purple-600 dark:text-purple-300 font-medium">
              {typeof name === "number" ? `[${name}]` : `"${name}"`}:
            </span>
          </>
        )}
        <PrimitiveValue value={value} />

        {/* Hover action buttons */}
        <div className="opacity-0 group-hover/node:opacity-100 flex items-center gap-1 ml-auto text-xs text-muted-foreground transition-opacity">
          <button
            onClick={handleCopyValue}
            className="p-1 hover:text-foreground rounded hover:bg-muted"
            title="Copy value"
          >
            {copiedKey ? <CheckIcon size={12} className="text-emerald-500" /> : <CopyIcon size={12} />}
          </button>
          {path && (
            <button
              onClick={handleCopyPath}
              className="px-1.5 py-0.5 hover:text-foreground rounded hover:bg-muted text-[10px]"
              title={`Copy path: ${path}`}
            >
              {copiedPath ? "Copied path!" : "path"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const entries = Object.entries(value);
  const itemCount = entries.length;
  const isSelfOrChildrenMatched = searchTerm ? true : isExpanded;

  return (
    <div className="font-mono text-[0.8125rem]">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="group/node flex items-center gap-1.5 py-0.5 hover:bg-muted/40 px-2 rounded cursor-pointer select-none transition-colors"
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        <span className="text-muted-foreground p-0.5 -ml-1">
          {itemCount === 0 ? (
            <span className="w-3.5 inline-block" />
          ) : isExpanded ? (
            <CaretDownIcon size={12} />
          ) : (
            <CaretRightIcon size={12} />
          )}
        </span>

        {name !== undefined && (
          <span className="text-purple-600 dark:text-purple-300 font-medium">
            {typeof name === "number" ? `[${name}]` : `"${name}"`}:
          </span>
        )}

        <span className="text-muted-foreground text-xs font-sans">
          {isArray ? `Array(${itemCount})` : `{ ${itemCount} ${itemCount === 1 ? "key" : "keys"} }`}
        </span>

        {/* Action icons on hover */}
        <div className="opacity-0 group-hover/node:opacity-100 flex items-center gap-1 ml-auto text-xs text-muted-foreground transition-opacity">
          <button
            onClick={handleCopyValue}
            className="p-1 hover:text-foreground rounded hover:bg-muted"
            title="Copy as JSON"
          >
            {copiedKey ? <CheckIcon size={12} className="text-emerald-500" /> : <CopyIcon size={12} />}
          </button>
          {path && (
            <button
              onClick={handleCopyPath}
              className="px-1.5 py-0.5 hover:text-foreground rounded hover:bg-muted text-[10px]"
              title={`Copy path: ${path}`}
            >
              {copiedPath ? "Copied path!" : "path"}
            </button>
          )}
        </div>
      </div>

      {isSelfOrChildrenMatched && isExpanded && itemCount > 0 && (
        <div className="border-l border-border/40 ml-3.5">
          {entries.map(([key, childVal], idx) => {
            const childName = isArray ? idx : key;
            const childPath = path
              ? isArray
                ? `${path}[${idx}]`
                : `${path}.${key}`
              : isArray
                ? `[${idx}]`
                : key;

            return (
              <TreeNode
                key={childName}
                name={childName}
                value={childVal}
                depth={depth + 1}
                path={childPath}
                searchTerm={searchTerm}
                isExpandedByDefault={depth < 1}
                collapseAllTrigger={collapseAllTrigger}
                expandAllTrigger={expandAllTrigger}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function JsonTreeViewer({ data, initialExpandedDepth = 2 }: JsonTreeViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandAllTrigger, setExpandAllTrigger] = useState(0);
  const [collapseAllTrigger, setCollapseAllTrigger] = useState(0);

  if (data === null || typeof data === "undefined") {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm font-mono">
        No valid JSON data to display.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/20">
        <div className="relative flex-1 min-w-40 max-w-xs">
          <MagnifyingGlassIcon
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search keys or values..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-8 pr-2.5 py-1 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setExpandAllTrigger((prev) => prev + 1)}
            title="Expand All Nodes"
          >
            <ArrowsOutLineVerticalIcon size={12} className="mr-1" />
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setCollapseAllTrigger((prev) => prev + 1)}
            title="Collapse All Nodes"
          >
            <ArrowsInLineVerticalIcon size={12} className="mr-1" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-3 overflow-auto max-h-[550px] min-h-[300px]">
        <TreeNode
          value={data}
          depth={0}
          path=""
          searchTerm={searchTerm}
          isExpandedByDefault={initialExpandedDepth > 0}
          collapseAllTrigger={collapseAllTrigger}
          expandAllTrigger={expandAllTrigger}
        />
      </div>
    </div>
  );
}
