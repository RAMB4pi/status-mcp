# Claude stdio bridge

Build with `npm ci && npm run build`. Adapt the absolute checkout path in [`claude_desktop_config.example.json`](claude_desktop_config.example.json), generate a credential from **Mi cuenta → Conectar asistente** at `https://status.harthad.com`, and insert it into your local configuration. Never commit a real credential. It expires in 30 days and can be revoked from your page.

The stdio process forwards the hosted tool list and calls to `https://status.harthad.com/mcp`. The schema is discovered from the backend. Without `STATUS_MCP_URL`, the process uses the legacy stub tools; `get_profile` then returns `NOT_IMPLEMENTED`.

Try: “Revisa mi Status y propón unos pocos servicios y una primera entrada con lo que sabes de mí. Muéstrame la propuesta antes de publicar. No inventes datos ni publiques información privada.”

See [the connection guide](../../docs/local-preview.md) for attribution semantics and the local demo endpoint. Native remote OAuth is still pending.
