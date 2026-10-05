# ChatGPT integration plan

The hosted endpoint is `https://status.harthad.com/mcp`. OAuth discovery, dynamic client registration, Authorization Code + PKCE, explicit account consent and token refresh are implemented in the private hosted backend. The protocol is tested locally with synthetic identities; native ChatGPT connection is still pending live verification. This repository supplies the optional stdio bridge and draft schemas, not the hosted authorization server. `api.status.harthad.com` remains a planned address.

1. Sign in at `https://status.harthad.com`, using your existing Harthad session when available.
2. In ChatGPT's browser settings, open Apps and create an app; enable developer mode under advanced settings if needed. Availability depends on the account/workspace. See [OpenAI's developer mode guide](https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt).
3. Use the name **Status**, MCP URL **https://status.harthad.com/mcp**, and **OAuth** authentication. Leave advanced OAuth values at their defaults so dynamic registration can supply the client credentials.
4. Review ChatGPT's notice, create the connection, and authorize your account on the Status consent page.
5. In a new chat, select Status and ask **¿Cuál es mi estado actual?** Then return to Status and select **Comprobar conexión**. Setup will not finish without a valid MCP initialization.

Claude and Other remain coming soon in the product's onboarding. The existing stdio bridge remains available for technical experiments with an independently supplied bearer credential.

After connecting a compatible client, start with:

> Ayúdame a iniciar mi Status con lo que sabes de mí en esta conversación. Revisa mi página y propón unos pocos servicios, sus estados actuales y una primera entrada. Pregunta solo lo indispensable y muéstrame la propuesta antes de publicar. No inventes datos ni publiques información privada.

An explicit request such as “Cambia Energy a degraded y registra ‘Semana intensa’” must use `intent: explicit`, which records human provenance. A contextual autonomous update uses `intent: context`, which records AI provenance. Use the hosted schema from `tools/list`; draft REST schemas are not a deployed compatibility guarantee.

See [the connection guide](../../docs/local-preview.md) for supported bearer-header and stdio clients. The unconnected legacy scaffold still returns `NOT_IMPLEMENTED`.
