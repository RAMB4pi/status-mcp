# Connect to Harthad Status

The hosted MVP exposes Streamable HTTP MCP at `https://status.harthad.com/mcp`. It requires an account credential. Local development remains available at `http://127.0.0.1:5173/mcp`.

1. Open `https://status.harthad.com` and sign in with Google, or continue with your existing Harthad session. For a synthetic local preview, start the private app with `npm run demo`.
2. For ChatGPT, follow [the OAuth connection guide](../examples/chatgpt/README.md). The web setup now prioritizes this flow; Claude and Other are coming soon in its UI. The following bridge steps are for advanced clients with an independently supplied account credential. The owner-only `/v1/me/mcp-token` endpoint remains available to authenticated browser sessions for development, but is no longer part of default onboarding.
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

Never commit the credential. It expires in 30 days and can be revoked from the webapp. OAuth/discovery and dynamic ChatGPT client registration are now implemented in the hosted backend; native ChatGPT still needs live verification. The stdio bridge only forwards its supplied credential and does not perform OAuth.

The bridge forwards the upstream tool list and input schemas, avoiding duplicate validation logic. Without `STATUS_MCP_URL`, the stdio server executes the public tools against `STATUS_API_URL` (default `https://status.harthad.com/v1`) using `STATUS_ACCESS_TOKEN` or `STATUS_MCP_TOKEN`. There are no stub handlers.

## Attribution and publication semantics

The hosted tools require `intent: explicit | context` for publications and transitions. An explicit human request produces human provenance, even via MCP. An autonomous contextual inference produces AI provenance. This is an intent declaration by the authorized assistant, not cryptographic proof of human consent. API owner IDs and timestamps are always assigned server-side. Browser publications always count as human.

`create_entry` accepts `body`, `visibility`, `intent` and an optional list of `{ serviceId, status }` changes. Every transition links to its originating publication. The hosted backend's tool schemas and responses differ from the legacy draft v0.1 REST schemas; discover them via `tools/list`. Those draft schemas are not deployed API compatibility guarantees.

Start with: “Ayúdame a crear mi Status con el contexto sobre mí que tengas disponible. Prepara los pilares, sus componentes y las primeras entradas sin que yo tenga que dirigir cada paso. Si falta contexto o no puedes respaldar los estados, hazme una sola pregunta breve y agrupada sobre qué me importa y cómo voy. Usa solo Operativo, Capacidad reducida o Incidente mayor. Muéstrame una propuesta completa para una sola aprobación, con su visibilidad y una opción de seguimiento automático en las conversaciones donde Status esté activo. No crees ni publiques nada hasta que la apruebe.”
