"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  BracketsCurlyIcon,
  WrenchIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  BroomIcon,
  TrashIcon,
  TreeStructureIcon,
  FileCodeIcon,
  DownloadSimpleIcon,
  ArrowUUpLeftIcon,
  ShieldCheckIcon,
  SparkleIcon,
  RowsIcon,
  ColumnsIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { JsonTreeViewer } from "@/components/json-tree-viewer";
import {
  lenientFormatJson,
  repairAndConvertJson,
  validateJson,
  minifyJson,
  getIndentString,
  type IndentSize,
  JSON_SAMPLES,
} from "@/lib/json-utils";

type ActiveTab = "formatted" | "tree" | "sanity";
type LayoutMode = "stacked" | "side-by-side";

export default function JSONFormatterPage() {
  const [input, setInput] = useState<string>(JSON_SAMPLES.brokenWithUnquotedKeys);
  const [output, setOutput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("formatted");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("stacked");
  const [indent, setIndent] = useState<IndentSize>("2");
  const [recentChanges, setRecentChanges] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Real-time sanity check of the input
  const validation = useMemo(() => {
    return validateJson(input);
  }, [input]);

  // Real-time sanity check of the output
  const outputValidation = useMemo(() => {
    return validateJson(output);
  }, [output]);

  // Parsed object for Tree Viewer
  const treeData = useMemo(() => {
    if (outputValidation.isValid && outputValidation.parsedData !== null) {
      return outputValidation.parsedData;
    }
    if (validation.isValid && validation.parsedData !== null) {
      return validation.parsedData;
    }
    // Attempt relaxed parse for tree view
    if (input.trim()) {
      const repaired = repairAndConvertJson(input, getIndentString(indent));
      if (repaired.isValid) {
        try {
          return JSON.parse(repaired.rawRepaired);
        } catch {
          return null;
        }
      }
    }
    return null;
  }, [outputValidation, validation, input, indent]);

  // Action 1: Lenient Format
  const handleLenientFormat = useCallback(() => {
    const formatted = lenientFormatJson(input, getIndentString(indent));
    setOutput(formatted);
    setRecentChanges([]);
    setLastAction("lenient-format");
    setActiveTab("formatted");
  }, [input, indent]);

  // Action 2: Repair & Convert JS Object to valid JSON
  const handleRepairAndConvert = useCallback(() => {
    const repaired = repairAndConvertJson(input, getIndentString(indent));
    setOutput(repaired.output);
    setRecentChanges(repaired.changes);
    setLastAction("repair-convert");
    setActiveTab("formatted");
  }, [input, indent]);

  // Action 3: Minify JSON
  const handleMinify = useCallback(() => {
    const minified = minifyJson(input);
    setOutput(minified);
    setRecentChanges([]);
    setLastAction("minify");
    setActiveTab("formatted");
  }, [input]);

  // Action 4: Replace input with the formatted/repaired output
  const handleApplyToInput = useCallback(() => {
    if (output) {
      setInput(output);
    }
  }, [output]);

  // Handle Tab key in textarea for code editing ergonomics
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indentStr = getIndentString(indent);

      const newValue = input.substring(0, start) + indentStr + input.substring(end);
      setInput(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indentStr.length;
      }, 0);
    }
  };

  // Download output as .json file
  const handleDownload = () => {
    const content = output || input;
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Line count and character count
  const inputLines = input ? input.split("\n").length : 0;
  const inputChars = input.length;
  const editorMinHeight = layoutMode === "stacked" ? "min-h-[280px]" : "min-h-[420px]";

  return (
    <ToolLayout
      title="JSON Manipulator & Formatter"
      description="Fault-tolerant formatting, JavaScript object to strict JSON converter, sanity checker, and interactive tree viewer."
    >
      {/* Top Toolbar: Samples, Layout toggle, Indent selector, Clear */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2.5 bg-muted/50 border border-border rounded-xl">
        {/* Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium px-2 flex items-center gap-1">
            <SparkleIcon size={13} /> Samples:
          </span>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setInput(JSON_SAMPLES.brokenWithUnquotedKeys);
              setOutput("");
              setRecentChanges([]);
            }}
          >
            Unclosed Brackets & Curls
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setInput(JSON_SAMPLES.validData);
              setOutput("");
              setRecentChanges([]);
            }}
          >
            Valid JSON
          </Button>
        </div>

        {/* View Layout, Indent Selector and Clear */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Layout Mode Switcher */}
          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5 text-xs">
            <span className="px-2 text-muted-foreground">Layout:</span>
            <button
              type="button"
              onClick={() => setLayoutMode("stacked")}
              className={`px-2 py-0.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
                layoutMode === "stacked"
                  ? "bg-primary text-primary-foreground font-medium shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Stacked view (one box above the other)"
            >
              <RowsIcon size={13} />
              <span>Stacked</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("side-by-side")}
              className={`px-2 py-0.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
                layoutMode === "side-by-side"
                  ? "bg-primary text-primary-foreground font-medium shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Side-by-side view (columns)"
            >
              <ColumnsIcon size={13} />
              <span>Side-by-Side</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5 text-xs">
            <span className="px-2 text-muted-foreground">Indent:</span>
            {(["2", "4", "tab"] as IndentSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setIndent(size)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  indent === size
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {size === "tab" ? "Tab" : `${size} sp`}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setInput("");
              setOutput("");
              setRecentChanges([]);
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <TrashIcon size={12} className="mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Main Dual-Box Section (Stacked or Side-by-Side) */}
      <div className={layoutMode === "stacked" ? "flex flex-col gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-4"}>
        {/* Input Editor Box */}
        <div className="bg-card text-card-foreground border border-border overflow-hidden rounded-xl flex flex-col transition-colors hover:border-primary/50">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground" title="JSON / JS Object">
                Input
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {inputLines} {inputLines === 1 ? "line" : "lines"} · {inputChars} chars
              </span>
            </div>

            {/* Live Syntax Badge Pill */}
            {!input.trim() ? (
              <span className="text-[11px] text-muted-foreground font-mono">Empty</span>
            ) : validation.isValid ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono font-medium">
                <CheckCircleIcon size={12} /> Valid JSON
              </span>
            ) : (
              <button
                onClick={() => setActiveTab("sanity")}
                className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-full font-mono font-medium transition-colors cursor-pointer"
                title="Click to inspect syntax issues in Sanity Checker"
              >
                <WarningCircleIcon size={12} />
                {validation.issues.some((i) => i.type === "unquoted_key")
                  ? "JS Object"
                  : validation.error
                    ? `Syntax error (line ${validation.error.line})`
                    : "Malformed"}
              </button>
            )}
          </div>

          {/* Editor Textarea */}
          <textarea
            ref={textareaRef}
            className={`w-full flex-1 bg-muted/30 text-foreground font-mono text-[0.8125rem] leading-relaxed resize-y transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 placeholder:text-muted-foreground/60 p-3.5 rounded-none border-0 ${editorMinHeight}`}
            placeholder={`Paste raw JSON or JavaScript Object literal here...\nExample:\n{\n  var: "value",\n  tags: ['web', 'tools',],\n  details: { active: True\n`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />

          {/* Bottom Action Bar for Input */}
          <div className="p-3 border-t border-border bg-muted/10 flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleLenientFormat}
              className="gap-1.5 shadow-sm"
              title="Format even if braces or brackets are missing"
            >
              <BracketsCurlyIcon size={14} />
              Format
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleRepairAndConvert}
              className="gap-1.5"
              title='Converts {var: "value"} into {"var": "value"}, fixes single quotes, trailing commas, missing brackets'
            >
              <WrenchIcon size={14} />
              Fix & Convert to JSON
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinify}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              title="Minify JSON"
            >
              <BroomIcon size={14} />
              Minify
            </Button>
          </div>
        </div>

        {/* Right Pane: Output, Tree, or Sanity Checker */}
        <div className="bg-card text-card-foreground border border-border overflow-hidden rounded-xl flex flex-col transition-colors hover:border-primary/50">
          {/* Tabs Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
            <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
              <button
                onClick={() => setActiveTab("formatted")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "formatted"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCodeIcon size={13} />
                Formatted
              </button>
              <button
                onClick={() => setActiveTab("tree")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "tree"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TreeStructureIcon size={13} />
                Tree Viewer
              </button>
              <button
                onClick={() => setActiveTab("sanity")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "sanity"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheckIcon size={13} />
                Sanity Checker
                {!validation.isValid && input.trim() && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Top right actions for output tab */}
            <div className="flex items-center gap-1.5">
              {output && activeTab === "formatted" && (
                <>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleApplyToInput}
                    title="Copy formatted result back to input"
                  >
                    <ArrowUUpLeftIcon size={12} className="mr-1" />
                    To Input
                  </Button>
                  <Button variant="ghost" size="xs" onClick={handleDownload} title="Download as data.json">
                    <DownloadSimpleIcon size={12} className="mr-1" />
                    .json
                  </Button>
                  <CopyButton text={output} label="Copy" className="h-6 text-xs px-2" />
                </>
              )}
            </div>
          </div>

          {/* TAB 1: Formatted Output View */}
          {activeTab === "formatted" && (
            <div className="flex flex-col flex-1">
              {/* Alert banner if recent repairs were made */}
              {recentChanges.length > 0 && lastAction === "repair-convert" && (
                <div className="px-3.5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <CheckCircleIcon size={14} /> Repaired & converted successfully:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                    {recentChanges.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              <textarea
                className={`w-full flex-1 bg-muted/30 text-foreground font-mono text-[0.8125rem] leading-relaxed resize-y transition-colors focus-visible:outline-none placeholder:text-muted-foreground/60 p-3.5 rounded-none border-0 ${editorMinHeight}`}
                readOnly
                value={output}
                placeholder="Click 'Format' or 'Fix & Convert to JSON' to see formatted results..."
                spellCheck={false}
              />

              {/* Status footer for output */}
              <div className="px-3 py-2 border-t border-border bg-muted/10 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <div>
                  {output ? (
                    <span>
                      {output.split("\n").length} lines · {output.length} chars
                    </span>
                  ) : (
                    <span>No output generated yet</span>
                  )}
                </div>
                {output && outputValidation.isValid && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Valid JSON</span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Tree Viewer */}
          {activeTab === "tree" && (
            <div className={`flex flex-col flex-1 ${editorMinHeight}`}>
              {treeData ? (
                <JsonTreeViewer data={treeData} initialExpandedDepth={2} />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
                  <WarningCircleIcon size={36} className="text-amber-500 mb-2 opacity-80" />
                  <p className="text-sm font-medium mb-1">Cannot build visual tree directly</p>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    The JSON text currently contains syntax issues or missing brackets. Use the converter to repair it
                    and explore the interactive tree.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      handleRepairAndConvert();
                    }}
                    className="gap-1.5"
                  >
                    <WrenchIcon size={14} />
                    Auto-Repair & View Tree
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Sanity Checker / Diagnostics */}
          {activeTab === "sanity" && (
            <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto max-h-[500px]">
              {/* Overall status card */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  validation.isValid
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}
              >
                {validation.isValid ? (
                  <CheckCircleIcon size={24} className="shrink-0 mt-0.5" />
                ) : (
                  <WarningCircleIcon size={24} className="shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-sm font-semibold">
                    {validation.isValid ? "JSON Syntax is Valid" : "JSON Syntax Has Errors"}
                  </h3>
                  <p className="text-xs mt-0.5 opacity-90">
                    {validation.isValid
                      ? "The JSON passes strict JSON.parse validation and conforms to standard RFC 8259."
                      : validation.error?.message ||
                        "The input is not standard JSON (e.g. unquoted keys or missing brackets)."}
                  </p>
                </div>
              </div>

              {/* Error position & pointer snippet if invalid */}
              {!validation.isValid && validation.error && (
                <div className="bg-muted/40 border border-border rounded-xl p-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="font-semibold text-foreground">Syntax Error Location:</span>
                    <span>
                      Line {validation.error.line}, Column {validation.error.column}
                    </span>
                  </div>
                  {validation.error.snippet && (
                    <pre className="p-2.5 bg-background rounded-lg border border-border overflow-x-auto text-destructive whitespace-pre">
                      {validation.error.snippet}
                    </pre>
                  )}
                  {validation.error.suggestion && (
                    <p className="mt-2 text-muted-foreground text-xs font-sans">
                      <span className="font-medium text-foreground">Suggestion:</span> {validation.error.suggestion}
                    </p>
                  )}
                </div>
              )}

              {/* Detected issues list */}
              {validation.issues.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Detected Syntax Issues ({validation.issues.length}):
                    </span>
                    <Button variant="default" size="xs" onClick={handleRepairAndConvert} className="gap-1">
                      <WrenchIcon size={12} /> Auto-Repair All
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {validation.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="font-mono text-muted-foreground">{issue.message}</span>
                        </div>
                        {issue.fixable && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={handleRepairAndConvert}
                            className="text-[11px] h-6 px-2 text-primary hover:text-primary"
                          >
                            Fix
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistics Breakdown if valid */}
              {validation.isValid && validation.stats && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground">Structure & Metrics:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <div className="text-muted-foreground text-[11px]">Root Type</div>
                      <div className="font-mono font-medium mt-0.5">{validation.stats.type}</div>
                    </div>
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <div className="text-muted-foreground text-[11px]">Size</div>
                      <div className="font-mono font-medium mt-0.5">{validation.stats.formattedSize}</div>
                    </div>
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <div className="text-muted-foreground text-[11px]">Max Depth</div>
                      <div className="font-mono font-medium mt-0.5">{validation.stats.maxDepth} levels</div>
                    </div>
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <div className="text-muted-foreground text-[11px]">Object Keys</div>
                      <div className="font-mono font-medium mt-0.5">{validation.stats.keysCount}</div>
                    </div>
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <div className="text-muted-foreground text-[11px]">Arrays</div>
                      <div className="font-mono font-medium mt-0.5">{validation.stats.arraysCount}</div>
                    </div>
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <div className="text-muted-foreground text-[11px]">Lines</div>
                      <div className="font-mono font-medium mt-0.5">{validation.stats.lines}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
