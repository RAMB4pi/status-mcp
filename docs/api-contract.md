# Status MCP API boundary — v0.2

Base: `https://status.harthad.com/v1`. All operations use `POST /mcp/{tool_name}` with a JSON body matching the strict executable schema in `src/tools/index.ts`. `Authorization: Bearer <account token>` is required. Browser sessions alone cannot use this integration API. JSON success returns the operation result directly; HTTP errors are failures, never successful publications.

| Operation | Input | Result | Scope |
| --- | --- | --- | --- |
| get_profile | optional username | accessible profile | status:read |
| list_services | optional username | service array | status:read |
| get_status | optional username | services (name/status), as_of | status:read |
| get_context | optional username | profile, services, 10 recent entries/changes, as_of | status:read |
| get_changelog | optional username | accessible linked changes | status:read |
| create_service | name, optional status (operational default) | created service | status:write |
| create_entry | body, intent, optional visibility/public default and changes | created entry with linked changes | status:write |
| update_service | service_id, status, body, intent | entry with state transition | status:write |
| create_changelog_entry | service_id, status, body, intent | entry with state transition; unchanged state rejected | status:write |
| create_comment | entry_id, body | created comment | status:write |

IDs are opaque. `changes` contains `{serviceId, status}` and is limited to 20. Entry/transition bodies are 1–5000 characters; comment bodies 1–1000; service names 1–60. Unknown request fields are rejected, including forged owner/provenance fields. Returned JSON uses the hosted MVP's camelCase record shapes; legacy domain schemas are not applied to these responses.

`intent` is `explicit` or `context`; the private backend derives human or AI provenance. Explicit human requests remain human through MCP. Contextual AI updates require prior authorization. This declaration is not cryptographic proof of human approval.

`create_entry` can choose public/private visibility. Single-transition convenience methods currently publish publicly. Prefer `create_entry` with explicit visibility, particularly for private state changes. A text-only entry produces no changelog; actual state changes produce linked records in the same backend operation. Do not duplicate a transition using another tool.

The API validates credentials, token expiry, scopes, access to other profiles/entries, and ownership. MCP annotations and schemas are not authorization. OAuth issuance, revocation, all storage and atomic persistence stay private. The hosted MCP calls this same private API service in-process, under the authenticated request, avoiding an HTTP round trip to itself; the local public server calls the authenticated HTTP boundary.

The API returns 401 for invalid/missing credentials, 403 for insufficient scope, and 400/404 for rejected operations. Responses do not disclose private error details. The client uses a 15-second timeout, refuses redirects and credential-bearing URLs, and rejects requests escaping the configured base. HTTPS is required except loopback development. Writes are not retried automatically; after uncertain outcomes inspect context before a deliberate retry.

Successful integration operations mark the assistant connection; merely creating a credential does not. Remote OAuth metadata and `/mcp` endpoint remain unchanged. See [OAuth](auth.md).

The original speculative REST design is retained in [legacy-api-contract.md](legacy-api-contract.md) for historical reference only.
