import Link from "next/link";
import { tools } from "@/lib/tools";
import { ArrowRightIcon, LightningIcon, GithubLogoIcon, InfinityIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { DarkParticles } from "@/components/particles-dark";
export default function HomePage() {
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
    <div className="min-h-screen pb-24 md:pb-8 relative isolate overflow-hidden px-4">
      <DarkParticles />
      <div className="max-w-5xl mx-auto pt-8 relative z-10">
        <div className="mb-16 pt-8">
          <h1 className="text-5xl font-bold tracking-tighter leading-none mb-4">
            Developer
            <br />
            <span className="text-primary">Tools.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            A fast, open-source toolkit with the tools you actually use every day. No ads. No tracking. Lock-in.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <Button
              nativeButton={false}
              className="text-black bg-primary/80 hover:bg-primary"
              render={
                <Link href="/tools/base64">
                  <LightningIcon size={14} />
                  Get started
                </Link>
              }
            />

            <Button
              variant="outline"
              nativeButton={false}
              render={
                <a href="https://github.com/dylan-calle/webdy-tools" target="_blank" rel="noopener noreferrer">
                  <GithubLogoIcon size={14} />
                  GitHub
                </a>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-16 max-w-sm">
          {[
            { label: "Tools", value: tools.length.toString() },
            { label: "Free forever", value: <InfinityIcon weight="bold" size={18} /> },
            { label: "Open source", value: "100%" },
          ].map((stat) => (
            <div key={stat.label} className="border hover:border-primary/80 rounded-xl p-4">
              <p className="text-2xl font-bold font-mono text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-12">
          {Object.entries(grouped).map(([category, categoryTools]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {categoryLabels[category] || category}
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className=" border border-border overflow-hidden rounded-xl p-4 group cursor-pointer flex items-start gap-3 hover:border-primary transition-all duration-600"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10  transition-colors">
                        <Icon size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{tool.name}</p>
                          {tool.isNew && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1 py-0.5 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tool.description}</p>
                      </div>
                      <ArrowRightIcon
                        size={13}
                        className="text-border group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-(--surface) border border-(--surface) overflow-hidden rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Built for developers, by developers</h2>
          <p className="text-sm text-muted-foreground mb-5">Missing a tool? Open an issue or submit a PR on GitHub.</p>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a href="https://github.com/dylan-calle/webdy-tools/issues/new" target="_blank" rel="noopener noreferrer">
                <GithubLogoIcon size={14} />
                Contribute on Github
              </a>
            }
          />
        </div>
      </div>
    </div>
  );
}
