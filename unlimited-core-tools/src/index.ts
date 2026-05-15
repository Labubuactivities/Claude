#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { request } from "undici";
import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024;

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function httpGet(
  url: string,
  opts: { headers?: Record<string, string>; timeoutMs?: number } = {}
): Promise<{ status: number; body: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );
  try {
    const res = await request(url, {
      method: "GET",
      maxRedirections: 5,
      headers: {
        "user-agent": USER_AGENT,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        ...opts.headers,
      },
      signal: controller.signal,
    });

    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of res.body) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buf.length;
      if (total > MAX_BODY_BYTES) {
        throw new Error(
          `Response exceeded ${MAX_BODY_BYTES} bytes; aborting to protect memory.`
        );
      }
      chunks.push(buf);
    }
    return {
      status: res.statusCode,
      body: Buffer.concat(chunks).toString("utf8"),
      finalUrl: url,
    };
  } finally {
    clearTimeout(timer);
  }
}

function assertHttpUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid URL: ${raw}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Only http(s) URLs are allowed; got ${parsed.protocol}`);
  }
  return parsed;
}

function decodeDuckRedirect(href: string): string {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    const uddg = u.searchParams.get("uddg");
    if (uddg) return decodeURIComponent(uddg);
    return u.toString();
  } catch {
    return href;
  }
}

async function freeGoogleSearch(
  query: string,
  limit: number
): Promise<SearchResult[]> {
  const q = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${q}`;
  const { status, body } = await httpGet(url, {
    headers: {
      referer: "https://duckduckgo.com/",
    },
  });
  if (status >= 400) {
    throw new Error(`Search backend returned HTTP ${status}`);
  }

  const $ = cheerio.load(body);
  const results: SearchResult[] = [];

  $("div.result, div.web-result").each((_, el) => {
    if (results.length >= limit) return false;
    const $el = $(el);
    const $a = $el.find("a.result__a").first();
    const title = $a.text().trim();
    const rawHref = $a.attr("href") ?? "";
    if (!title || !rawHref) return;
    const link = decodeDuckRedirect(rawHref);
    const snippet = $el.find(".result__snippet").text().trim();
    results.push({ title, url: link, snippet });
    return;
  });

  return results;
}

function htmlToCleanText(html: string): {
  title: string;
  text: string;
  links: { text: string; href: string }[];
} {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, svg, canvas").remove();

  const title = ($("title").first().text() || "").trim();

  const blockSelectors = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "li",
    "blockquote",
    "pre",
    "tr",
    "br",
    "div",
    "section",
    "article",
  ];
  $(blockSelectors.join(",")).each((_, el) => {
    $(el).append("\n");
  });

  const root = $("main").length
    ? $("main")
    : $("article").length
      ? $("article")
      : $("body");

  const raw = root.text();
  const text = raw
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const links: { text: string; href: string }[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const txt = $(el).text().trim();
    if (!href || !txt) return;
    if (href.startsWith("#") || href.startsWith("javascript:")) return;
    links.push({ text: txt, href });
  });

  return { title, text, links: links.slice(0, 50) };
}

async function fetchWebPage(
  rawUrl: string,
  maxChars: number
): Promise<string> {
  const url = assertHttpUrl(rawUrl);
  const { status, body } = await httpGet(url.toString());
  if (status >= 400) {
    throw new Error(`Fetch failed: HTTP ${status} for ${url.toString()}`);
  }
  const { title, text, links } = htmlToCleanText(body);
  const header = `# ${title || url.hostname}\nSource: ${url.toString()}\n\n`;
  const linkBlock = links.length
    ? `\n\n---\nLinks:\n${links
        .map((l) => `- [${l.text}](${l.href})`)
        .join("\n")}`
    : "";
  const truncated = text.length > maxChars;
  const trimmed = truncated ? text.slice(0, maxChars) + "\n…[truncated]" : text;
  return header + trimmed + linkBlock;
}

interface WikiSearchHit {
  title: string;
  pageid: number;
  snippet: string;
}

async function wikipediaSearch(
  query: string,
  limit: number,
  lang: string
): Promise<WikiSearchHit[]> {
  const endpoint = `https://${encodeURIComponent(lang)}.wikipedia.org/w/api.php`;
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(Math.max(1, Math.min(limit, 25))),
    format: "json",
    formatversion: "2",
    origin: "*",
  });
  const url = `${endpoint}?${params.toString()}`;
  const { status, body } = await httpGet(url, {
    headers: { accept: "application/json" },
  });
  if (status >= 400) throw new Error(`Wikipedia search HTTP ${status}`);
  const json = JSON.parse(body) as {
    query?: { search?: WikiSearchHit[] };
  };
  return json.query?.search ?? [];
}

async function wikipediaSummary(
  title: string,
  lang: string
): Promise<{
  title: string;
  description?: string;
  extract: string;
  url: string;
}> {
  const slug = encodeURIComponent(title.replace(/ /g, "_"));
  const url = `https://${encodeURIComponent(lang)}.wikipedia.org/api/rest_v1/page/summary/${slug}`;
  const { status, body } = await httpGet(url, {
    headers: { accept: "application/json" },
  });
  if (status === 404) throw new Error(`No Wikipedia page found for "${title}"`);
  if (status >= 400) throw new Error(`Wikipedia summary HTTP ${status}`);
  const json = JSON.parse(body) as {
    title: string;
    description?: string;
    extract: string;
    content_urls?: { desktop?: { page?: string } };
  };
  return {
    title: json.title,
    description: json.description,
    extract: json.extract,
    url:
      json.content_urls?.desktop?.page ??
      `https://${lang}.wikipedia.org/wiki/${slug}`,
  };
}

const TOOLS: Tool[] = [
  {
    name: "free_google_search",
    description:
      "Free, anonymous web search. Returns a ranked list of {title, url, snippet} results. Uses public HTML search endpoints — no API key required.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query." },
        limit: {
          type: "number",
          description: "Maximum results (1–25, default 10).",
          minimum: 1,
          maximum: 25,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "fetch_web_page",
    description:
      "Download a public web page and return its main content sanitized to clean, LLM-readable text with a short list of outbound links.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Absolute http(s) URL to fetch." },
        max_chars: {
          type: "number",
          description: "Truncate text body to this many chars (default 20000).",
          minimum: 500,
          maximum: 200000,
        },
      },
      required: ["url"],
    },
  },
  {
    name: "wikipedia_lookup",
    description:
      "Search Wikipedia or fetch the summary of an article using the public, key-free Wikipedia REST/MediaWiki APIs.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Either a search phrase or an exact article title (see mode).",
        },
        mode: {
          type: "string",
          enum: ["search", "summary"],
          description:
            "'search' returns top hits; 'summary' returns the article summary for the given title. Default: search.",
        },
        limit: {
          type: "number",
          description: "Results when mode=search (1–25, default 5).",
          minimum: 1,
          maximum: 25,
        },
        lang: {
          type: "string",
          description: "Wikipedia language code (default 'en').",
        },
      },
      required: ["query"],
    },
  },
];

function asText(payload: unknown): { content: { type: "text"; text: string }[] } {
  const text =
    typeof payload === "string"
      ? payload
      : JSON.stringify(payload, null, 2);
  return { content: [{ type: "text", text }] };
}

function asError(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: `Error: ${message}` }],
  };
}

async function runDiagnostic(): Promise<void> {
  process.stderr.write("[unlimited-core-tools] diagnostic starting...\n");
  for (const tool of TOOLS) {
    process.stderr.write(`  • tool registered: ${tool.name}\n`);
  }
  process.stderr.write("[unlimited-core-tools] OK\n");
}

async function main(): Promise<void> {
  if (process.argv.includes("--diagnose")) {
    await runDiagnostic();
    return;
  }

  const server = new Server(
    { name: "unlimited-core-tools", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = req.params.name;
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;
    try {
      switch (name) {
        case "free_google_search": {
          const query = String(args.query ?? "").trim();
          if (!query) throw new Error("'query' is required.");
          const limit = Math.max(
            1,
            Math.min(25, Number(args.limit ?? 10) || 10)
          );
          const results = await freeGoogleSearch(query, limit);
          if (results.length === 0)
            return asText(`No results found for "${query}".`);
          return asText({ query, count: results.length, results });
        }
        case "fetch_web_page": {
          const url = String(args.url ?? "").trim();
          if (!url) throw new Error("'url' is required.");
          const maxChars = Math.max(
            500,
            Math.min(200_000, Number(args.max_chars ?? 20_000) || 20_000)
          );
          const text = await fetchWebPage(url, maxChars);
          return asText(text);
        }
        case "wikipedia_lookup": {
          const query = String(args.query ?? "").trim();
          if (!query) throw new Error("'query' is required.");
          const mode = (args.mode === "summary" ? "summary" : "search") as
            | "search"
            | "summary";
          const lang = String(args.lang ?? "en").trim() || "en";
          if (mode === "summary") {
            const summary = await wikipediaSummary(query, lang);
            return asText(summary);
          }
          const limit = Math.max(
            1,
            Math.min(25, Number(args.limit ?? 5) || 5)
          );
          const hits = await wikipediaSearch(query, limit, lang);
          return asText({ query, lang, count: hits.length, results: hits });
        }
        default:
          return asError(`Unknown tool: ${name}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return asError(msg);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(
    "[unlimited-core-tools] MCP server connected over stdio.\n"
  );
}

main().catch((err) => {
  process.stderr.write(
    `[unlimited-core-tools] fatal: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`
  );
  process.exit(1);
});
