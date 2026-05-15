# unlimited-core-tools

A single, key-free **Model Context Protocol (MCP)** server that bundles three core research tools for Claude:

| Tool | Purpose |
|------|---------|
| `free_google_search` | Anonymous web search via a public HTML search endpoint. No API keys. |
| `fetch_web_page` | Downloads any public http(s) URL and returns clean, LLM-readable text. |
| `wikipedia_lookup` | Searches Wikipedia and fetches article summaries through the public Wikipedia REST/MediaWiki APIs. |

Transport: **stdio** (per the MCP spec).

## Install & build

```bash
cd unlimited-core-tools
npm install
npm run build
```

This produces `dist/index.js`, the executable entry point.

## Smoke test

```bash
npm run diagnose
```

Prints the registered tools and exits 0 if startup is clean.

## Register with Claude

### Claude Desktop

Add this block to `claude_desktop_config.json` (under the existing `mcpServers` object):

```json
{
  "mcpServers": {
    "unlimited-core-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/unlimited-core-tools/dist/index.js"]
    }
  }
}
```

The config file lives at:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop. The three tools will appear in the tools panel.

### Claude Code

```bash
claude mcp add unlimited-core-tools -- node /ABSOLUTE/PATH/TO/unlimited-core-tools/dist/index.js
```

## Notes

- Outbound HTTP is capped at 5 MB and 15 s per request to bound memory and latency.
- `free_google_search` uses the public DuckDuckGo HTML endpoint as the no-key search backend — Google directly is impractical without paid APIs because of CAPTCHAs.
- No telemetry, no auth, no API keys.
