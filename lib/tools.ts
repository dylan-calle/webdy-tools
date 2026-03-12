import {
  BracketsCurlyIcon,
  ImageSquareIcon,
  PasswordIcon,
  FingerprintIcon,
  HashIcon,
  FileJsIcon,
  AsteriskIcon,
  PaletteIcon,
  ClockIcon,
  LinkSimpleHorizontalIcon,
  GitDiffIcon,
  CubeIcon,
} from "@phosphor-icons/react/ssr";

export type ToolCategory = "converters" | "generators" | "formatters" | "playground" | "links";

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: ToolCategory;
  tags: string[];
  isNew?: boolean;
}

export interface LinkItem {
  name: string;
  url: string;
  description: string;
  category: string;
}

export const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON",
    href: "/tools/json-formatter",
    icon: BracketsCurlyIcon,
    category: "formatters",
    tags: ["json", "format", "validate", "minify"],
  },
  {
    id: "base64",
    name: "Base64",
    description: "Encode/decode Base64 and convert images",
    href: "/tools/base64",
    icon: ImageSquareIcon,
    category: "converters",
    tags: ["base64", "encode", "decode", "image"],
  },
  {
    id: "playground",
    name: "JS Playground",
    description: "Run JavaScript and TypeScript in the browser",
    href: "/tools/playground",
    icon: FileJsIcon,
    category: "playground",
    tags: ["javascript", "typescript", "run", "code", "playground"],
  },
  {
    id: "bcrypt",
    name: "BCrypt",
    description: "Hash passwords and verify BCrypt hashes",
    href: "/tools/bcrypt",
    icon: PasswordIcon,
    category: "generators",
    tags: ["bcrypt", "hash", "password", "security"],
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JWT tokens",
    href: "/tools/jwt-decoder",
    icon: FingerprintIcon,
    category: "converters",
    tags: ["jwt", "token", "decode", "auth"],
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes",
    href: "/tools/hash-generator",
    icon: HashIcon,
    category: "generators",
    tags: ["hash", "md5", "sha", "crypto"],
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate UUID v4 and ULID identifiers",
    href: "/tools/uuid-generator",
    icon: CubeIcon,
    category: "generators",
    tags: ["uuid", "ulid", "id", "generate"],
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions",
    href: "/tools/regex-tester",
    icon: AsteriskIcon,
    category: "formatters",
    tags: ["regex", "regexp", "test", "match"],
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL formats",
    href: "/tools/color-converter",
    icon: PaletteIcon,
    category: "converters",
    tags: ["color", "hex", "rgb", "hsl"],
  },
  {
    id: "timestamp-converter",
    name: "Timestamp",
    description: "Convert Unix timestamps to human-readable dates",
    href: "/tools/timestamp-converter",
    icon: ClockIcon,
    category: "converters",
    tags: ["timestamp", "unix", "date", "time"],
  },
  {
    id: "url-encoder",
    name: "URL Encoder",
    description: "Encode and decode URLs and query strings",
    href: "/tools/url-encoder",
    icon: LinkSimpleHorizontalIcon,
    category: "converters",
    tags: ["url", "encode", "decode", "query"],
  },
  {
    id: "diff-viewer",
    name: "Diff Viewer",
    description: "Compare two blocks of text side by side",
    href: "/tools/diff-viewer",
    icon: GitDiffIcon,
    category: "formatters",
    tags: ["diff", "compare", "text"],
  },
];

export const devLinks: LinkItem[] = [
  { name: "Lucide Icons", url: "https://lucide.dev", description: "Beautiful & consistent icons", category: "Design" },
  { name: "Shadcn/ui", url: "https://ui.shadcn.com", description: "Accessible component library", category: "Design" },
  {
    name: "Tailwind CSS",
    url: "https://tailwindcss.com/docs",
    description: "Utility-first CSS framework",
    category: "Design",
  },
  {
    name: "Radix UI",
    url: "https://www.radix-ui.com",
    description: "Unstyled accessible components",
    category: "Design",
  },
  { name: "Vercel", url: "https://vercel.com", description: "Deploy frontend projects", category: "Hosting" },
  {
    name: "Supabase",
    url: "https://supabase.com",
    description: "Open source Firebase alternative",
    category: "Backend",
  },
  { name: "Prisma", url: "https://www.prisma.io", description: "Next-gen Node.js ORM", category: "Backend" },
  {
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "The web platform reference",
    category: "Reference",
  },
  {
    name: "TypeScript Docs",
    url: "https://www.typescriptlang.org/docs",
    description: "TypeScript documentation",
    category: "Reference",
  },
  { name: "Can I Use", url: "https://caniuse.com", description: "Browser support tables", category: "Reference" },
  { name: "DevDocs", url: "https://devdocs.io", description: "All docs in one place", category: "Reference" },
  { name: "Bundlephobia", url: "https://bundlephobia.com", description: "Find npm package costs", category: "Tools" },
  { name: "npm trends", url: "https://npmtrends.com", description: "Compare npm packages", category: "Tools" },
  {
    name: "Excalidraw",
    url: "https://excalidraw.com",
    description: "Virtual whiteboard & diagrams",
    category: "Tools",
  },
  { name: "Ray.so", url: "https://ray.so", description: "Beautiful code screenshots", category: "Tools" },
  { name: "Roadmap.sh", url: "https://roadmap.sh", description: "Developer roadmaps", category: "Learning" },
];

export const categories = [
  { id: "all", label: "All Tools" },
  { id: "formatters", label: "Formatters" },
  { id: "converters", label: "Converters" },
  { id: "generators", label: "Generators" },
  { id: "playground", label: "Playground" },
] as const;
