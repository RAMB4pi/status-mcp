# Connect to Harthad Status

The hosted MVP exposes Streamable HTTP MCP at `https://status.harthad.com/mcp`. It requires an account credential. Local development remains available at `http://127.0.0.1:5173/mcp`.

1. Open `https://status.harthad.com` and sign in with Google, or continue with your existing Harthad session. For a synthetic local preview, start the private app with `npm run demo`.
2. Open your page, use **Mi cuenta → Conectar asistente**, and explicitly generate an account-scoped credential.
3. For clients with custom HTTP headers: URL `https://status.harthad.com/mcp`, header `Authorization: Bearer <credential>`.
4. For stdio clients, build this repository and configure:

```json
{
  "mcpServers": {
    "status": {
      "command": "node",
      "args": ["/absolute/path/status-mcp/dist/src/server.js"],
      "env": {
        "STATUS_MCP_URL": "https://status.harthad.com/mcp",
        "STATUS_MCP_TOKEN": "<credential from your own account>"
      }
    }
  }
}
```

Never commit the credential. It expires in 30 days and can be revoked from the webapp. Public OAuth/discovery and ChatGPT connector registration are not implemented. A client without bearer-header or stdio support cannot use this endpoint yet.

The bridge forwards the upstream tool list and input schemas, avoiding duplicate validation logic. The original unconnected scaffold remains available without `STATUS_MCP_URL`.

## Attribution and publication semantics

The hosted tools require `intent: explicit | context` for publications and transitions. An explicit human request produces human provenance, even via MCP. An autonomous contextual inference produces AI provenance. This is an intent declaration by the authorized assistant, not cryptographic proof of human consent. API owner IDs and timestamps are always assigned server-side. Browser publications always count as human.

`create_entry` accepts `body`, `visibility`, `intent` and an optional list of `{ serviceId, status }` changes. Every transition links to its originating publication. The hosted backend's tool schemas and responses differ from the legacy draft v0.1 REST schemas; discover them via `tools/list`. Those draft schemas are not deployed API compatibility guarantees.

Start with: “Ayúdame a iniciar mi Status con lo que sabes de mí en esta conversación. Revisa mi página y propón unos pocos servicios, sus estados actuales y una primera entrada. Pregunta solo lo indispensable y muéstrame la propuesta antes de publicar. No inventes datos ni publiques información privada.”
