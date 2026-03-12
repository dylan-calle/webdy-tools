import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function ToolLayout({ title, description, children, className }: ToolLayoutProps) {
  return (
    <div className={cn("min-h-screen p-8", className)}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
