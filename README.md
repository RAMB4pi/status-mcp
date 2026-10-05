# Harthad Status MCP

Functional open-source MCP server, API client and Status plugin for personal services, entries and linked state changes. Apache-2.0.

## Architecture

The ten real tools and their executable request schemas live in `src/tools/index.ts`. They call a private API boundary; there are no stub handlers. The hosted endpoint imports this same public package rather than maintaining a second tool implementation.

```text
ChatGPT / plugin → status.harthad.com/mcp → public MCP tools → private API → database
Local assistant  → public stdio MCP      → private HTTP API → database
Webapp                                  → private API     → database
```

Open source: MCP tool registration and dispatch, request validation, API transport, optional stdio bridge, plugin manifests, skill, icons, examples and tests.

Private: webapp, OAuth/session issuance, API authorization, business logic, database access and hosting. No database SDK or credentials are shipped in this repository. The current API base is `https://status.harthad.com/v1`; `api.status.harthad.com` remains a planned address.

## Run

Node.js 22+ and Python 3 for optional plugin packaging.

```sh
npm ci
npm test
```

For a stdio assistant, supply your own account credential through its environment:

```sh
STATUS_ACCESS_TOKEN='<your account credential>' npm start
```

`STATUS_API_URL` optionally selects another HTTPS API or a loopback development server. Missing credentials fail explicitly on startup rather than exposing nonfunctional tools. Logs belong on stderr; stdout is reserved for MCP.

The remote plugin uses the host OAuth flow and needs no manually supplied token. See [plugin setup](docs/plugin.md), [ChatGPT](examples/chatgpt/README.md) and [auth](docs/auth.md). A saved plugin is distinct from a verified native ChatGPT connection.

## Tools

Read scope `status:read`: `get_profile`, `list_services`, `get_status`, `get_changelog`, `get_context`.

Write scope `status:write`: `create_service`, `update_service`, `create_changelog_entry`, `create_entry`, `create_comment`.

States: `operational`, `degraded`, `major_incident`. Visibility: `public`, `private`. Publishing intent: `explicit` (human request, even through MCP) or `context` (AI inference). The backend derives provenance, ownership, timestamps and linked transitions. An entry may contain zero or more state changes; changes generate the linked changelog atomically. See the [current API contract](docs/api-contract.md).

## Layout

- `src/tools`: ten functional tools and current strict input schemas.
- `src/client`: authenticated HTTPS API transport with credential containment and no retries.
- `src/server.ts`: local stdio server; `src/bridge.ts`: optional upstream relay.
- `src/schemas`: legacy draft domain shapes, explicitly separate from the current request contract.
- `plugin/harthad-status`: editable remote plugin and Spanish workflow.
- `scripts/package-plugin.py`: deterministic private-plugin archive builder.
- `tests`: discovery, execution over HTTP, validation, API failures and transport boundaries.

## Packaging

`npm run package:plugin` creates `dist/harthad-status-plugin.zip` for Plugin Creator.

`npm pack` creates the functional library with compiled source and Apache license. The private hosted repo pins this archive with a lockfile integrity hash. The package is not published to npm; the source is available on GitHub. Rebuild and deliberately update that dependency when changing the public runtime.

The old REST proposal is retained as [historical draft](docs/legacy-api-contract.md), not a deployed compatibility guarantee. Pagination, subscriber tools and UI extensions are future work.

[Apache License 2.0](LICENSE).
