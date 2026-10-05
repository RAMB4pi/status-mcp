# ChatGPT integration plan

The hosted endpoint is `https://status.harthad.com/mcp`, with an account-scoped bearer credential. A native ChatGPT connector still requires remote OAuth/discovery and registration, which are not implemented. Merely pasting this URL into a client that cannot supply bearer headers will not connect your account. `api.status.harthad.com` remains a planned address.

After connecting a compatible client, start with:

> Ayúdame a iniciar mi Status con lo que sabes de mí en esta conversación. Revisa mi página y propón unos pocos servicios, sus estados actuales y una primera entrada. Pregunta solo lo indispensable y muéstrame la propuesta antes de publicar. No inventes datos ni publiques información privada.

An explicit request such as “Cambia Energy a degraded y registra ‘Semana intensa’” must use `intent: explicit`, which records human provenance. A contextual autonomous update uses `intent: context`, which records AI provenance. Use the hosted schema from `tools/list`; draft REST schemas are not a deployed compatibility guarantee.

See [the connection guide](../../docs/local-preview.md) for supported bearer-header and stdio clients. The unconnected legacy scaffold still returns `NOT_IMPLEMENTED`.
