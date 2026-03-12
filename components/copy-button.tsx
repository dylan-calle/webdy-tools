"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@phosphor-icons/react";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function CopyButton({ text, className, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant={`outline`} onClick={handleCopy} className={className}>
      {copied ? (
        <>
          <CheckIcon size={12} className="text-(--success)" />
          {label ? "Copied!" : ""}
        </>
      ) : (
        <>
          <CopyIcon size={12} />
          {label || ""}
        </>
      )}
    </Button>
  );
}
