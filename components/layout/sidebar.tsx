"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools, devLinks } from "@/lib/tools";
import {
  HouseIcon,
  ArrowSquareOutIcon,
  MagnifyingGlassIcon,
  GithubLogoIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const grouped = tools.reduce(
    (acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, typeof tools>,
  );

  const categoryLabels: Record<string, string> = {
    formatters: "Formatters",
    converters: "Converters",
    generators: "Generators",
    playground: "Playground",
  };

  return (
    <aside className="sticky left-0 top-0 h-screen w-60 border-r border-border bg-(--surface) flex flex-col overflow-y-auto z-100">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-semibold text-sm tracking-tight">Webdy Tools</span>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              console.log("clicking", theme);
              setTheme(theme === "dark" ? "light" : "dark");
            }}
          >
            {theme === "dark" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
          </Button>
        </div>
        <button
          className="mt-3 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border text-muted-foreground text-xs hover:border-(--border-hover) transition-colors"
          onClick={() => document.dispatchEvent(new CustomEvent("open-command-menu"))}
        >
          <MagnifyingGlassIcon size={11} />
          <span className="flex-1 text-left">Search tools...</span>
          <kbd className="text-[10px] bg-muted px-1 rounded">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5">
        {/* Home */}
        <div>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
              pathname === "/"
                ? "bg-muted text-foreground"
                : "text-muted-foreground] hover:text-foreground hover:bg-muted",
            )}
          >
            <HouseIcon size={14} />
            Home
          </Link>
        </div>

        {Object.entries(grouped).map(([category, categoryTools]) => (
          <div key={category}>
            <p className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-mutet-foreground">
              {categoryLabels[category] || category}
            </p>
            <div className="space-y-0.5">
              {categoryTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = pathname === tool.href;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors group",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon size={13} className={isActive ? "text-accent" : ""} />
                    <span className="flex-1 truncate">{tool.name}</span>
                    {tool.isNew && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1 py-0.5 rounded">
                        New
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Links</p>
          <Link
            href="/links"
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
              pathname === "/links"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <ArrowSquareOutIcon size={13} />
            Dev Links
          </Link>
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <a
          href="https://github.com/dylan-calle/webdy-tools"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <GithubLogoIcon size={13} />
          Open Source on GitHub
        </a>
      </div>
    </aside>
  );
}
