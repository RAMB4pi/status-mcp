# Harthad Status MCP

Open-source integration scaffold for a personal status page: services, status changes, entries and comments.

**Stage: initial MVP scaffold.** The server runs over stdio and exposes ten tools, but every handler currently returns `NOT_IMPLEMENTED`. No hosted API or OAuth flow is implemented, deployed or verified. This package is not published to npm.

## Open-source boundary

Apache-2.0 covers this repository: MCP server, tool definitions, schemas (the initial Status Protocol), API client transport, auth scaffolding, examples, documentation and tests.

The webapp at `status.harthad.com`, backend at `api.status.harthad.com`, databases, production infrastructure and hosted operations are **not open source** and are not included here. The MCP and webapp will share the same backend. This repository never accesses the database directly.

```text
ChatGPT / Claude → status-mcp → api.status.harthad.com → database
status.harthad.com          → api.status.harthad.com → database
```

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm test
npm start
```

`npm test` compiles the project. For build only: `npm run build`. The stdio server waits for MCP messages; do not type ordinary text into it or log to stdout.

## Layout

```text
src/
  tools/     # Ten validated MCP tool stubs
  schemas/   # Public domain and request schemas + TypeScript types
  client/    # HTTPS API transport with response validation
  auth/      # Scope definitions and local token reader
  server.ts  # stdio entrypoint
examples/
  chatgpt/   # Remote integration requirements and sample prompts
  claude/    # Local stdio configuration
docs/       # Expected API contract and OAuth plan
tests/      # Schema, MCP discovery/stub and transport boundary tests
```

## MVP tools

| Tool | Intended scope |
| --- | --- |
| `get_profile`, `list_services`, `get_status`, `get_changelog`, `get_context` | `status:read` |
| `create_service`, `update_service`, `create_changelog_entry`, `create_entry` | `status:write` |
| `create_comment` | `comments:write` |

Statuses: `operational`, `degraded`, `major_incident`. Visibility: `public`, `private`. Provenance: `user`, `ai` (record field `created_by`). Visibility must be chosen explicitly for writes. Author, owner, timestamps and previous status are backend-owned; the AI cannot forge them.

Schemas are an initial **draft contract**, not a stable 1.0 protocol. See [API contract](docs/api-contract.md), [auth plan](docs/auth.md), [ChatGPT example](examples/chatgpt/README.md) and [Claude example](examples/claude/README.md).

## Launch next steps

1. Implement the hosted `/v1` contract with authorization, pagination and atomic status transitions.
2. Implement OAuth and wire handlers through `StatusClient`; validate all response schemas.
3. Add an authenticated remote MCP transport for ChatGPT and verify a real client end to end.

Subscriptions, notifications, integrations, search, UI extensions and billing are deferred. Google login belongs to the hosted webapp/backend.

## License

[Apache License 2.0](LICENSE).
