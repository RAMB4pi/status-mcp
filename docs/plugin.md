# Status plugin

The editable plugin source lives in `plugin/harthad-status`. It connects directly to the existing hosted MCP server, preserving its hosting, shared Harthad sign-in and OAuth. The hosted webapp/backend remain private; no backend code, credentials, user data or direct database access are packaged.

## Build

```sh
npm ci
npm test
npm run package:plugin
```

The last command validates the portable manifest, contained square icons, skill and credential-free remote MCP configuration, then builds `dist/harthad-status-plugin.zip`. Archives are deterministic; runtime dependencies and local environment files are excluded. The portable format follows [Agent Plugins 1.0](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json).

## Connect and start

1. Open the private [Status plugin](https://chatgpt.com/plugins/plugins_6ac4370e8de4819192ca056e3c94f762), install it and connect its Status account using the host's OAuth flow.
2. Harthad reuses your signed-in session where available. Review and authorize the connection yourself; a created package does not grant account access.
3. In a new conversation select Status and ask: **¿Cuál es mi estado actual?** This is a read-only connection check.
4. Then use:

> Ayúdame a iniciar mi Status con lo que sabes de mí en esta conversación. Revisa mi página y propón unos pocos servicios, sus estados actuales y una primera entrada. Pregunta solo lo indispensable y muéstrame la propuesta antes de publicar. No inventes datos ni publiques información privada.

Review the proposal before the first publication. Later explicit requests count as human intent. Context-derived automatic updates count as AI intent and need prior authorization. Entries generate linked changelog records only when they change service states.

## Current release

- Plugin: `plugins_6ac4370e8de4819192ca056e3c94f762`
- Release: `pluginrel_6ac4370f31e48191bd026cc2f9634531`
- Version: `0.1.0`
- Scope: personal (`USER`), private (`PRIVATE`). Not a public directory submission.
- Endpoint: `https://status.harthad.com/mcp`, Streamable HTTP, OAuth.

The private plugin was saved by Plugin Creator on 2026-10-05. Account creation is distinct from installation and real OAuth authorization. Native ChatGPT tool discovery and a read-only call after connection still require verification in the user's account. Legacy REST stubs in `src/tools` are not the plugin runtime: the plugin discovers and executes the deployed tools directly. See [hosted semantics](local-preview.md) and [OAuth](auth.md).

Update this exact plugin and release rather than creating another Status plugin. Never put OAuth bearer tokens into the manifest or MCP configuration.

## Verification, 2026-10-05

- `npm test`: 3 public-repo schema/scaffold/credential-boundary tests passed.
- Both JSON manifests validated against the official Agent Plugins 1.0.0 JSON schemas.
- Reproducible archive: 6 files, contained icons and skill, no credentials or private app binding.
- Production OAuth discovery returned 200 with the correct `/mcp` resource, `status:read`, `status:write` and PKCE `S256`; unauthenticated MCP initialization returned 401 and the discovery challenge.
- Existing private-backend API and OAuth integration tests passed (2 scenarios, isolated synthetic users); they exercise 10-tool discovery, provenance, permissions, revocation and OAuth lifecycle. No real user publications were created.
- ChatGPT's private plugin detail page visibly shows Status, one MCP server and one skill with the startup prompt. This verifies saved packaging, not real authenticated tool execution.
