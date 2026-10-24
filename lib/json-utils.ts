/**
 * JSON Utilities: Lenient Formatting, Fault-Tolerant Parsing,
 * JS Object Literal to Standard JSON Conversion, Validation, and Minification.
 */

export type IndentSize = "2" | "4" | "tab";

export interface JsonStats {
  type: string;
  sizeBytes: number;
  formattedSize: string;
  lines: number;
  characters: number;
  keysCount: number;
  arraysCount: number;
  objectsCount: number;
  maxDepth: number;
}

export interface JsonIssue {
  type:
    | "unquoted_key"
    | "single_quotes"
    | "trailing_comma"
    | "comments"
    | "unclosed_brace"
    | "extra_brace"
    | "unclosed_bracket"
    | "extra_bracket"
    | "python_literals"
    | "dangling_colon";
  message: string;
  fixable: boolean;
}

export interface JsonSyntaxError {
  message: string;
  line: number;
  column: number;
  position: number | null;
  snippet?: string;
  suggestion?: string;
}

export interface JsonValidationResult {
  isValid: boolean;
  isEmpty: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedData: any;
  error: JsonSyntaxError | null;
  stats: JsonStats | null;
  issues: JsonIssue[];
}

export interface RepairResult {
  output: string;
  rawRepaired: string;
  changes: string[];
  isValid: boolean;
}

/**
 * Helper to get the indentation string from setting
 */
export function getIndentString(indent: IndentSize): string {
  switch (indent) {
    case "2":
      return "  ";
    case "4":
      return "    ";
    case "tab":
      return "\t";
    default:
      return "  ";
  }
}

/**
 * Format bytes into readable string (e.g. 1.2 KB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i] || "B"}`;
}

/**
 * Lenient JSON Formatter
 * Formats JSON or JS Object text line by line with proper indentation,
 * even if brackets or curls are unclosed, syntax is malformed, or commas are missing.
 */
export function lenientFormatJson(input: string, indentStr = "  "): string {
  if (!input || !input.trim()) return "";

  let result = "";
  let indentLevel = 0;
  let inString = false;
  let stringChar = "";
  let isEscaped = false;
  let i = 0;
  const len = input.length;

  const getIndent = (lvl: number) => indentStr.repeat(Math.max(0, lvl));

  function peekNextNonWs(startIdx: number) {
    let idx = startIdx;
    while (idx < len && /\s/.test(input[idx])) idx++;
    return { char: input[idx] || "", idx };
  }

  while (i < len) {
    const char = input[i];

    // Inside string: preserve verbatim
    if (inString) {
      result += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
      i++;
      continue;
    }

    // Skip / preserve comments
    if (char === "/" && i + 1 < len) {
      if (input[i + 1] === "/") {
        let comment = "";
        while (i < len && input[i] !== "\n") {
          comment += input[i];
          i++;
        }
        result = result.replace(/[ \t]+$/, "");
        result += (result.endsWith("\n") || result === "" ? "" : " ") + comment.trim() + "\n" + getIndent(indentLevel);
        continue;
      } else if (input[i + 1] === "*") {
        let comment = "";
        i += 2;
        while (i < len && !(input[i] === "*" && input[i + 1] === "/")) {
          comment += input[i];
          i++;
        }
        i += 2;
        result = result.replace(/[ \t]+$/, "");
        result += " /* " + comment.trim() + " */ ";
        continue;
      }
    }

    // Entering a string literal
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      isEscaped = false;
      result += char;
      i++;
      continue;
    }

    // Opening brackets / braces
    if (char === "{" || char === "[") {
      if (result.endsWith(":") || result.endsWith("=")) {
        result += " ";
      }

      // Check if immediate next non-ws is matching close (e.g. empty {} or [])
      const next = peekNextNonWs(i + 1);
      const matchingClose = char === "{" ? "}" : "]";
      if (next.char === matchingClose) {
        result += char + matchingClose;
        i = next.idx + 1;
        continue;
      }

      result += char + "\n";
      indentLevel++;
      result += getIndent(indentLevel);
      i++;
      continue;
    }

    // Closing brackets / braces
    if (char === "}" || char === "]") {
      indentLevel = Math.max(0, indentLevel - 1);
      result = result.replace(/[ \t]+$/, "");
      if (!result.endsWith("\n")) {
        result += "\n";
      }
      result += getIndent(indentLevel) + char;
      i++;
      continue;
    }

    // Comma separator
    if (char === ",") {
      result = result.replace(/[ \t]+$/, "");
      result += ",\n" + getIndent(indentLevel);
      i++;
      while (i < len && (input[i] === " " || input[i] === "\t" || input[i] === "\r" || input[i] === "\n")) {
        i++;
      }
      continue;
    }

    // Key-value colon
    if (char === ":") {
      result = result.replace(/[ \t]+$/, "");
      result += ": ";
      i++;
      while (i < len && (input[i] === " " || input[i] === "\t")) {
        i++;
      }
      continue;
    }

    // Source newlines outside strings
    if (char === "\n" || char === "\r") {
      i++;
      continue;
    }

    // Source spaces outside strings
    if (char === " " || char === "\t") {
      if (!result.endsWith(" ") && !result.endsWith("\n")) {
        result += " ";
      }
      i++;
      continue;
    }

    // Other characters (alphanumeric, symbols)
    result += char;
    i++;
  }

  return result
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Converter from JavaScript Object Literals & Relaxed JSON to Standard JSON
 * Fixes single quotes, unquoted keys, trailing commas, missing brackets, comments, etc.
 */
export function repairAndConvertJson(input: string, indentStr = "  "): RepairResult {
  if (!input || !input.trim()) {
    return { output: "", rawRepaired: "", changes: [], isValid: false };
  }

  const changes: string[] = [];
  let s = input.trim();

  // 1. Remove JavaScript comments
  if (/\/\/.*|\/\*[\s\S]*?\*\//.test(s)) {
    s = s.replace(/\/\*[\s\S]*?\*\//g, "");
    s = s.replace(/\/\/.*$/gm, "");
    changes.push("Removed JavaScript comments");
  }

  // 2. Tokenize and convert:
  // - Unquoted keys: {var: "abc"} -> {"var": "abc"}
  // - Single quotes: 'value' -> "value" (escaping inner double quotes)
  // - Backticks: `value` -> "value"
  // - Python/JS literals: True -> true, False -> false, None -> null, undefined -> null, NaN -> null
  let result = "";
  let inString = false;
  let stringChar = "";
  let isEscaped = false;
  const bracketStack: string[] = [];
  let unquotedKeysCount = 0;
  let singleQuoteCount = 0;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        result += c;
      } else if (c === "\\") {
        isEscaped = true;
        result += c;
      } else if (c === stringChar) {
        inString = false;
        if (stringChar === "'" || stringChar === "`") {
          result += '"';
        } else {
          result += c;
        }
        stringChar = "";
      } else if ((stringChar === "'" || stringChar === "`") && c === '"') {
        result += '\\"';
      } else {
        result += c;
      }
      continue;
    }

    // Entering double quote string
    if (c === '"') {
      inString = true;
      stringChar = '"';
      result += c;
      continue;
    }

    // Entering single quote string or template literal
    if (c === "'" || c === "`") {
      inString = true;
      stringChar = c;
      result += '"';
      singleQuoteCount++;
      continue;
    }

    // Track brackets for auto-closing
    if (c === "{" || c === "[") {
      bracketStack.push(c === "{" ? "}" : "]");
      result += c;
      continue;
    }

    if (c === "}" || c === "]") {
      if (bracketStack.length > 0 && bracketStack[bracketStack.length - 1] === c) {
        bracketStack.pop();
      }
      result += c;
      continue;
    }

    // Check for unquoted keys or Python / JS special keywords
    if (/[a-zA-Z_$]/.test(c)) {
      let word = "";
      let j = i;
      while (j < s.length && /[a-zA-Z0-9_$-]/.test(s[j])) {
        word += s[j];
        j++;
      }

      // Check if followed by colon (outside quotes)
      let k = j;
      while (k < s.length && /\s/.test(s[k])) k++;

      if (k < s.length && s[k] === ":") {
        result += `"${word}"`;
        i = j - 1;
        unquotedKeysCount++;
        continue;
      } else if (word === "True") {
        result += "true";
        i = j - 1;
        changes.push("Converted Python True to true");
        continue;
      } else if (word === "False") {
        result += "false";
        i = j - 1;
        changes.push("Converted Python False to false");
        continue;
      } else if (word === "None") {
        result += "null";
        i = j - 1;
        changes.push("Converted Python None to null");
        continue;
      } else if (word === "undefined" || word === "NaN" || word === "Infinity") {
        result += "null";
        i = j - 1;
        changes.push(`Converted ${word} to null`);
        continue;
      }
    }

    result += c;
  }

  if (unquotedKeysCount > 0) {
    changes.push(`Enclosed ${unquotedKeysCount} unquoted key${unquotedKeysCount > 1 ? "s" : ""} in double quotes`);
  }
  if (singleQuoteCount > 0) {
    changes.push(`Converted ${singleQuoteCount} single-quoted strings to double quotes`);
  }

  // 3. Fix dangling colons before comma or closing delimiter
  const beforeColonFix = result;
  result = result.replace(/:\s*([}\],]|$)/g, ": null$1");
  if (result !== beforeColonFix) {
    changes.push("Filled missing values with null");
  }

  // 4. Remove trailing commas before } or ]
  const beforeTrailingCommaFix = result;
  result = result.replace(/,(\s*[}\]])/g, "$1");
  if (result !== beforeTrailingCommaFix) {
    changes.push("Removed trailing commas");
  }

  // 5. Auto-close missing brackets and braces
  if (bracketStack.length > 0) {
    const missing = bracketStack.slice().reverse().join("");
    // Ensure clean separation and remove any trailing comma before appending
    result = result.replace(/,\s*$/, "");
    result = result.trimEnd() + missing;
    // Repeat trailing comma clean in case of `,"}`
    result = result.replace(/,(\s*[}\]])/g, "$1");
    changes.push(`Auto-closed ${bracketStack.length} missing bracket(s)/brace(s) (${missing})`);
  }

  // 6. Test parsing and format nicely
  let isValid = false;
  let formatted = "";

  try {
    const parsed = JSON.parse(result);
    formatted = JSON.stringify(parsed, null, indentStr);
    isValid = true;
  } catch {
    formatted = lenientFormatJson(result, indentStr);
    isValid = false;
  }

  return {
    output: formatted,
    rawRepaired: result,
    changes: [...new Set(changes)],
    isValid,
  };
}

/**
 * Minify JSON text. If valid standard JSON, uses JSON.stringify.
 * If invalid/broken JSON, leniently removes whitespace while preserving strings.
 */
export function minifyJson(input: string): string {
  if (!input || !input.trim()) return "";

  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return lenientMinify(input);
  }
}

/**
 * Lenient minifier for malformed or incomplete JSON
 */
export function lenientMinify(input: string): string {
  let result = "";
  let inString = false;
  let stringChar = "";
  let isEscaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inString) {
      result += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      result += char;
      continue;
    }

    // Skip all whitespace outside of strings
    if (/\s/.test(char)) {
      continue;
    }

    result += char;
  }

  return result;
}

/**
 * Comprehensive JSON Sanity Checker & Syntax Validator
 * Provides line, column, context snippet, and actionable suggestions.
 */
export function validateJson(input: string): JsonValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      isEmpty: true,
      parsedData: null,
      error: null,
      stats: null,
      issues: [],
    };
  }

  const issues: JsonIssue[] = [];
  // Strip strings and comments for regex sanity heuristics
  const noStrings = input
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Issue 1: Unquoted keys like {var: "value"}
  if (/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/.test(noStrings)) {
    issues.push({
      type: "unquoted_key",
      message: 'Unquoted object keys detected (e.g. {var: "value"})',
      fixable: true,
    });
  }

  // Issue 2: Single quotes
  if (/'(?:[^'\\]|\\.)*'/.test(input)) {
    issues.push({
      type: "single_quotes",
      message: "Single-quoted strings detected (standard JSON requires double quotes)",
      fixable: true,
    });
  }

  // Issue 3: Trailing commas
  if (/,\s*[}\]]/.test(noStrings)) {
    issues.push({
      type: "trailing_comma",
      message: "Trailing comma detected before closing bracket or brace",
      fixable: true,
    });
  }

  // Issue 4: Comments
  if (/\/\/|\/\*/.test(input.replace(/"(?:[^"\\]|\\.)*"/g, ""))) {
    issues.push({
      type: "comments",
      message: "JavaScript comments detected (standard JSON does not permit comments)",
      fixable: true,
    });
  }

  // Issue 5: Python literals
  if (/\b(True|False|None)\b/.test(noStrings)) {
    issues.push({
      type: "python_literals",
      message: "Python literals detected (True, False, None)",
      fixable: true,
    });
  }

  // Issue 6: Bracket & Brace Balance Check
  let openBraces = 0;
  let openBrackets = 0;
  let inStr = false;
  let strChar = "";
  let esc = false;

  for (let idx = 0; idx < input.length; idx++) {
    const ch = input[idx];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === strChar) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = true;
      strChar = ch;
      continue;
    }
    if (ch === "{") openBraces++;
    if (ch === "}") openBraces--;
    if (ch === "[") openBrackets++;
    if (ch === "]") openBrackets--;
  }

  if (openBraces > 0) {
    issues.push({
      type: "unclosed_brace",
      message: `Missing ${openBraces} closing curly brace(s) '}'`,
      fixable: true,
    });
  } else if (openBraces < 0) {
    issues.push({
      type: "extra_brace",
      message: `Extra ${-openBraces} closing curly brace(s) '}' without opening '{'`,
      fixable: false,
    });
  }

  if (openBrackets > 0) {
    issues.push({
      type: "unclosed_bracket",
      message: `Missing ${openBrackets} closing square bracket(s) ']'`,
      fixable: true,
    });
  } else if (openBrackets < 0) {
    issues.push({
      type: "extra_bracket",
      message: `Extra ${-openBrackets} closing square bracket(s) ']' without opening '['`,
      fixable: false,
    });
  }

  // Strict JSON.parse verification
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null;
  let isValid = false;
  let error: JsonSyntaxError | null = null;

  try {
    parsed = JSON.parse(input);
    isValid = true;
  } catch (e) {
    isValid = false;
    const msg = e instanceof Error ? e.message : String(e);

    let line = 1;
    let column = 1;
    let position: number | null = null;

    const posMatch = msg.match(/at position (\d+)/i);
    const lineColMatch = msg.match(/line (\d+) column (\d+)/i);

    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else if (posMatch) {
      position = parseInt(posMatch[1], 10);
      const lines = input.slice(0, position).split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    const lines = input.split("\n");
    const errorLine = lines[line - 1] || "";
    const pointer = " ".repeat(Math.max(0, column - 1)) + "^";

    let suggestion = "";
    if (issues.some((i) => i.type === "unquoted_key")) {
      suggestion = 'Use "Fix & Convert" to quote object keys.';
    } else if (issues.some((i) => i.type === "single_quotes")) {
      suggestion = 'Replace single quotes with double quotes using "Fix & Convert".';
    } else if (issues.some((i) => i.type === "unclosed_brace" || i.type === "unclosed_bracket")) {
      suggestion = 'Missing closing brackets detected. Use "Fix & Convert" to auto-close.';
    } else if (issues.some((i) => i.type === "trailing_comma")) {
      suggestion = 'Remove trailing comma before "}" or "]".';
    }

    error = {
      message: msg,
      line,
      column,
      position,
      snippet: `${errorLine}\n${pointer}`,
      suggestion,
    };
  }

  // Calculate detailed statistics if valid
  let stats: JsonStats | null = null;
  if (isValid) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getStats = (obj: any, depth = 1): { keys: number; arrays: number; objects: number; maxDepth: number } => {
      let keys = 0;
      let maxDepth = depth;
      let arrays = 0;
      let objects = 0;

      if (Array.isArray(obj)) {
        arrays++;
        for (const item of obj) {
          if (item && typeof item === "object") {
            const s = getStats(item, depth + 1);
            keys += s.keys;
            arrays += s.arrays;
            objects += s.objects;
            maxDepth = Math.max(maxDepth, s.maxDepth);
          }
        }
      } else if (obj && typeof obj === "object") {
        objects++;
        const objKeys = Object.keys(obj);
        keys += objKeys.length;
        for (const k of objKeys) {
          const val = obj[k];
          if (val && typeof val === "object") {
            const s = getStats(val, depth + 1);
            keys += s.keys;
            arrays += s.arrays;
            objects += s.objects;
            maxDepth = Math.max(maxDepth, s.maxDepth);
          }
        }
      }

      return { keys, arrays, objects, maxDepth };
    };

    const s = getStats(parsed);
    const sizeBytes = new Blob([input]).size;

    stats = {
      type: Array.isArray(parsed) ? "Array" : typeof parsed === "object" && parsed !== null ? "Object" : typeof parsed,
      sizeBytes,
      formattedSize: formatBytes(sizeBytes),
      lines: input.split("\n").length,
      characters: input.length,
      keysCount: s.keys,
      arraysCount: s.arrays,
      objectsCount: s.objects,
      maxDepth: s.maxDepth,
    };
  }

  return {
    isValid,
    isEmpty: false,
    parsedData: parsed,
    error,
    stats,
    issues,
  };
}

/**
 * Sample datasets for testing different scenarios
 */
export const JSON_SAMPLES = {
  brokenWithUnquotedKeys: `{
  // User profile with unquoted keys and single quotes
  id: 42,
  user: {
    username: 'developer_42',
    name: 'Alex Rivera',
    active: True,
    skills: ['typescript', 'react', 'nextjs',],
    settings: {
      theme: 'dark',
      notifications: False,
      retryCount: 3,
    },
    // Missing closing brace at the end of this block
`,
  validData: `{
  "status": "success",
  "data": {
    "project": "webdy-tools",
    "version": "1.0.0",
    "active": true,
    "tags": [
      "developer",
      "utilities",
      "json"
    ],
    "maintainers": [
      {
        "name": "Webdy Team",
        "role": "Lead",
        "verified": true
      }
    ]
  }
}`,
};
