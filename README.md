# Harthad Status MCP

Open-source integration scaffold for a personal status page: services, status changes, entries and comments.

**Stage: MVP bridge plus legacy scaffold.** Set `STATUS_MCP_URL=https://status.harthad.com/mcp` and an account credential to discover and forward the hosted tools over stdio. The hosted app/API is now deployed. Without these variables the original ten draft tool handlers still return `NOT_IMPLEMENTED`. Remote OAuth and native ChatGPT connector registration remain unimplemented. This package is not published to npm.

## Open-source boundary

Apache-2.0 covers this repository: MCP server, tool definitions, schemas (the initial Status Protocol), API client transport, auth scaffolding, examples, documentation and tests.

The webapp, backend, databases, production infrastructure and hosted operations are **not open source** and are not included here. The current MVP serves web and backend together at `status.harthad.com`; `api.status.harthad.com` remains a planned address. MCP and web use the same backend. This repository never accesses the database directly.

```text
Compatible assistant → status-mcp → status.harthad.com/mcp → backend → database
status.harthad.com                                       → backend → database
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

## Next steps

1. Implement remote OAuth and verify a native ChatGPT connector end to end.
2. Promote the discoverable hosted tool schema to a versioned public contract; the original REST schemas remain a legacy draft.
3. Add paginated history and subscriber lists before expanding hosted MVP limits.

Subscriptions, notifications, integrations, search, UI extensions and billing are deferred. Google login belongs to the hosted webapp/backend.

## License

[Apache License 2.0](LICENSE).

## Connecting the hosted MVP

See [the hosted connection guide](docs/local-preview.md) for an executable stdio-to-HTTP bridge, account credentials and current tool semantics. Without connection variables, tools retain the original scaffold behavior.
