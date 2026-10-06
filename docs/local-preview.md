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

Start with: “Primero revisa mi Status existente, incluidas las entradas y servicios archivados. Si ya tiene datos, prepara diferencias para conservar, añadir, corregir, archivar o restaurar, usando sus IDs; no lo reinicies. Volver a preparar la propuesta no escribe datos. Después de mi aprobación aplica solo las diferencias, usando claves estables para que los reintentos no dupliquen entradas ni transiciones. Ayúdame a crear mi Status con todo el contexto sobre mí que tengas disponible. Prepara mis pilares y componentes y una cronología de 20–50 entradas útiles de los últimos 30 días, con fechas respaldadas, visibilidad y cambios de estado vinculados cuando haya evidencia de una transición. Si no alcanza el contexto, pídeme en un solo bloque breve notas o hitos del último mes antes de cerrar la propuesta; indica cuántas entradas puedes respaldar y qué falta. No inventes historia ni rellenes con duplicados. Usa solo Operativo, Capacidad reducida o Incidente mayor y no deduzcas estados de la ausencia de problemas o de objetivos pendientes. Muéstrame la cronología completa y el alcance del seguimiento para una sola aprobación; después ejecuta lo aprobado. Antes de pedir aprobación, verifica el conteo exacto y presenta una referencia accesible o fragmento de evidencia para cada entrada y estado. Excluye datos demo y hechos no confirmados. Propón un resumen público seguro por entrada y guarda precios, métricas internas, negociaciones, evidencia y contexto sensible en private_details, solo para mí. Conserva la opción de entrada completamente privada cuando incluso el resumen revela demasiado. Comprueba la vigencia de incidentes y que cada resolución corresponda al mismo problema. Define el seguimiento como desactivado, solo propuestas, registro privado o publicación pública, con permisos explícitos.”
