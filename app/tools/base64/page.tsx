"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { UploadSimpleIcon, ImageIcon, ArrowsCounterClockwiseIcon, ArrowRightIcon } from "@phosphor-icons/react";

type Mode = "text" | "image";
type Direction = "encode" | "decode";

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>("text");
  const [direction, setDirection] = useState<Direction>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const process = () => {
    setError("");
    try {
      if (direction === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setError("Invalid input for " + direction);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setOutput(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const decodeImageFromBase64 = () => {
    try {
      const src = input.startsWith("data:") ? input : `data:image/png;base64,${input}`;
      setImagePreview(src);
      setOutput(src);
      setError("");
    } catch {
      setError("Invalid base64 image data");
    }
  };

  return (
    <ToolLayout title="Base64" description="Encode and decode text or images to/from Base64">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
        {(["text", "image"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setInput("");
              setOutput("");
              setError("");
              setImagePreview("");
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
              mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "text" && (
        <>
          <div className="flex items-center gap-3 mb-4">
            {(["encode", "decode"] as Direction[]).map((d) => (
              <Button
                key={d}
                variant={direction === d ? "default" : "ghost"}
                onClick={() => setDirection(d)}
                className="capitalize"
              >
                {d}
              </Button>
            ))}
            <Button variant="ghost" onClick={process} className="ml-auto">
              <ArrowsCounterClockwiseIcon size={13} className="mr-2" />
              Convert
            </Button>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card text-card-foreground border border-border overflow-hidden rounded-xl transition-colors hover:border-primary/50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-xs text-muted-foreground font-medium">
                  {direction === "encode" ? "Plain text" : "Base64"}
                </span>
              </div>
              <textarea
                className="w-full bg-muted text-foreground font-mono text-[0.8125rem] leading-relaxed resize-y transition-colors focus-visible:outline-none focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-2 placeholder:text-muted-foreground p-3 rounded-none border-0 min-h-75"
                placeholder={direction === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="bg-card text-card-foreground border border-border overflow-hidden rounded-xl transition-colors hover:border-primary/50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-xs text-muted-foreground font-medium">
                  {direction === "encode" ? "Base64" : "Plain text"}
                </span>
                {output && <CopyButton text={output} label="Copy" />}
              </div>
              <textarea
                className="w-full bg-muted text-foreground font-mono text-[0.8125rem] leading-relaxed resize-y transition-colors focus-visible:outline-none focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-2 placeholder:text-muted-foreground p-3 rounded-none border-0 min-h-75"
                readOnly
                value={output}
                placeholder="Result will appear here..."
                spellCheck={false}
              />
            </div>
          </div>
        </>
      )}

      {mode === "image" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => fileRef.current?.click()} variant="default">
              <UploadSimpleIcon size={13} className="mr-2" />
              Upload Image <ArrowRightIcon />
              Base64
            </Button>
            <Button onClick={decodeImageFromBase64} variant="ghost">
              <ImageIcon size={13} className="mr-2" />
              Base64 <ArrowRightIcon /> Preview
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card text-card-foreground border border-border overflow-hidden rounded-xl transition-colors hover:border-primary/50">
              <div className="px-4 py-2.5 border-b border-border">
                <span className="text-xs text-muted-foreground font-medium">Base64 Input / Output</span>
              </div>
              <textarea
                className="w-full bg-muted text-foreground font-mono text-[0.8125rem] leading-relaxed resize-y transition-colors focus-visible:outline-none focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-2 placeholder:text-muted-foreground p-3 text-xs rounded-none border-0 min-h-75"
                placeholder="Paste base64 image data here, or upload a file above..."
                value={output || input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="bg-card text-card-foreground border border-border overflow-hidden rounded-xl transition-colors flex flex-col hover:border-primary/50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-xs text-muted-foreground font-medium">Image Preview</span>
                {output && <CopyButton text={output} label="Copy Base64" />}
              </div>
              <div className="flex-1 flex items-center justify-center p-8 min-h-75 bg-muted/30">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-w-full max-h-64 object-contain rounded" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Upload an image or paste base64 data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
