# Local Claude example

Build with `npm ci && npm run build`. Adapt the absolute checkout path in [`claude_desktop_config.example.json`](claude_desktop_config.example.json) and add the entry to your client's MCP configuration. This launches a local stdio process; it does not connect to a hosted service and needs no token while handlers remain stubs.

Try: “List the tools available in Harthad Status, then read my profile.” Tool discovery should succeed; `get_profile` returns `NOT_IMPLEMENTED` until the API is connected. Do not interpret this as an account or API failure.
