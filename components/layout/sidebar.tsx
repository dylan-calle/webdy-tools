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
    <aside className="fixed bottom-0 z-50 w-full border-t border-border bg-(--surface) pb-safe md:sticky md:top-0 md:h-screen md:w-60 md:border-r md:border-t-0 md:flex md:flex-col md:overflow-y-auto">
      <div className="hidden md:block px-4 py-5 border-b border-border">
        <div className="flex justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-semibold text-sm tracking-tight">Webdy Tools</span>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              console.log("clicking", theme);
              setTheme(theme === "light" ? "dark" : "light");
            }}
            className="hover:animate-tada animate-duration-100 group cursor-pointer dark:hover:bg-transparent hover:bg-transparent"
            render={
              theme === "light" ? (
                <button className="relative inline-flex items-center justify-center">
                  <SunIcon
                    className="absolute blur-sm text-orange-500 opacity-40 group-hover:opacity-100 transition-opacity size-5"
                    size={30}
                    weight="fill"
                  />
                  <SunIcon className="relative text-orange-500 z-10 size-5" size={30} />
                </button>
              ) : (
                <button className="relative inline-flex items-center justify-center">
                  <MoonIcon
                    className=" absolute blur-sm text-white opacity-40 group-hover:opacity-100 transition-opacity size-5"
                    size={30}
                    weight="fill"
                  />
                  <MoonIcon className=" relative text-white z-10 size-5" size={30} />
                </button>
              )
            }
          ></Button>
        </div>
        <button
          className="mt-3 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border text-muted-foreground text-xs hover:border-(--border-hover) transition-colors"
          onClick={() => document.dispatchEvent(new CustomEvent("open-command-menu"))}
        >
          <MagnifyingGlassIcon size={11} />
          <span className="flex-1 text-left">Search tools...</span>
          <kbd className="hidden md:inline-block text-[10px] bg-muted px-1 rounded">⌘K</kbd>
        </button>
      </div>

      <nav className="flex items-center justify-around px-2 py-2 overflow-x-auto no-scrollbar md:block md:flex-1 md:px-3 md:py-4 md:space-y-5 flex-nowrap">
        {/* Home */}
        <div className="shrink-0">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors md:px-2.5 md:py-1.5 md:text-sm",
              pathname === "/"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted md:text-muted-foreground",
            )}
            title="Home"
          >
            <HouseIcon size={20} className="md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline-block">Home</span>
          </Link>
        </div>

        {Object.entries(grouped).map(([category, categoryTools]) => (
          <div key={category} className="hidden md:block">
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
                    title={tool.name}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 px-3 py-2 rounded-md transition-colors group md:px-2.5 md:py-1.5 md:text-sm",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon size={20} className="md:w-3.5 md:h-3.5" />
                    <span className="hidden md:block flex-1 truncate">{tool.name}</span>
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

        <div className="shrink-0">
          <p className="hidden md:block px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Links
          </p>
          <Link
            href="/links"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors md:px-2.5 md:py-1.5 md:text-sm",
              pathname === "/links"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
            title="Dev Links"
          >
            <ArrowSquareOutIcon size={20} className="md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline-block">Dev Links</span>
          </Link>
        </div>
      </nav>

      <div className="hidden md:block px-4 py-3 border-t border-border">
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
