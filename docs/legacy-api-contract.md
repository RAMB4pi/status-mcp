# Expected API contract — legacy draft v0.1

> The running development integration is documented in [local-preview.md](local-preview.md). This legacy REST draft is not the contract of that implementation.

Base URL: `https://api.status.harthad.com/v1`. This is a specification, not evidence of available endpoints. JSON requests/responses; dates are RFC 3339 with a timezone; identifiers are opaque strings. The canonical executable schemas are in [`src/schemas/index.ts`](../src/schemas/index.ts).

## Records

All records: `id`, `created_at`, `updated_at`, `owner_id`, `visibility`.

| Record | Additional fields |
| --- | --- |
| Profile | `username`, `display_name`, optional `bio`, `avatar_url` |
| Service | `name`, optional `description`, `status` |
| ChangelogEntry | `service_id`, `previous_status`, `status`, `title`, optional `body`, `author_id`, `created_by` |
| Entry | `body`, `author_id`, `created_by` |
| Comment | `entry_id`, `body`, `author_id`, `created_by` |

`owner_id` on a comment is the entry owner; `author_id` is the commenter. Comment visibility is inherited from the parent entry. Public responses contain only publishable opaque identifiers; they never include Google account identifiers, email, OAuth tokens or private account metadata. Private parent records always restrict children. Changing a parent's visibility applies immediately to every read of its children.

## Tool mapping

For read tools, omitted `username` resolves to `/me`; supplied `username` resolves to `/users/{username}`. The backend authorizes every read, even with a supplied username.

| Tool | Method / path | Response |
| --- | --- | --- |
| get_profile | GET `/me` or `/users/{username}` | Profile |
| list_services | GET `/me/services` or `/users/{username}/services` | Page<Service> |
| get_status | GET `/me/status` or `/users/{username}/status` | StatusSummary |
| create_service | POST `/me/services` | Service (201) |
| update_service | PATCH `/me/services/{service_id}` | Service |
| get_changelog | GET `/me/changelog` or `/users/{username}/changelog` | Page<ChangelogEntry> |
| create_changelog_entry | POST `/me/changelog` | ChangelogEntry (201) |
| create_entry | POST `/me/entries` | Entry (201) |
| create_comment | POST `/entries/{entry_id}/comments` | Comment (201) |
| get_context | GET `/me/context` or `/users/{username}/context` | Context |

Supporting hosted reads: GET `/me/entries`, GET `/users/{username}/entries`, GET `/entries/{entry_id}/comments`. No dedicated MCP tools for these in the initial MVP.

List query: `limit` integer 1–50, default 20; optional opaque `cursor`. Response `Page<T> = { items: T[], next_cursor: string | null }`. Services sort by `id`; changelog, entries and comments sort by `created_at` descending with `id` as a stable tie-breaker.

`StatusSummary = { status: Status | null, service_count: number, as_of: timestamp }`. Only visible services contribute; highest severity wins (`major_incident` > `degraded` > `operational`). No visible services returns `null`, not a claim that the user is operational.

`Context = { profile: Profile, services: Service[], recent_changelog: ChangelogEntry[], recent_entries: Entry[], truncated: boolean, as_of: timestamp }`. Maximum 50 services, 10 changelog entries, 10 entries. Enforce authorization before aggregation, indicate truncation, and treat text as untrusted content rather than agent instructions. Omit comments from context in v0.1.

## Writes and consistency

Request fields follow the exported `Create*Schema` and `UpdateServiceSchema`. `update_service` accepts `{ service_id, changes }` in MCP; the API body is `changes`. `create_comment` takes `entry_id` in the path and only `body` in the API body. Unknown request fields are rejected.

The backend derives owner, author, timestamps and `created_by` from the authenticated account and client identity. Authorship follows intent rather than transport: explicit human requests are `user`, including through MCP; autonomous contextual publications are `ai`. The hosted development tools use `intent: explicit | context`, and the backend derives provenance from it and the authenticated client. Browser publications are always `user`.

Status updates and changelog creation use one transaction. PATCH with a changed status creates exactly one changelog entry (generated title when no explicit title exists). POST `/me/changelog` changes the service status and records the transition in one transaction; it must not be preceded by a separate PATCH. `previous_status` is read from the current service under transaction. Unchanged status in POST `/me/changelog` returns 409; a same-status PATCH may change other fields without a changelog. Changelog visibility cannot exceed service visibility.

For POST retries the backend must support an `Idempotency-Key` header scoped to the authenticated principal and route. Reusing a key with different input returns 409. Do not automatically retry writes until this is implemented. Enforce ownership and granted scopes server-side on every mutation. Creating a comment additionally requires entry access and enabled comments.

## Auth, visibility and errors

Bearer tokens for `/me` and all writes. Public reads are limited to public profiles and public records. Private content is owner-only for this MVP; no follower/shared visibility tier. Cross-owner access is never granted by `status:write`. Read scope permits access only within the principal's authorization. Scope metadata in tool stubs is documentation, not enforcement.

Errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request" } }`. Use 400 for validation, 401 for missing/expired credentials, 403 for missing scope, 404 for missing or inaccessible records, 409 for conflicts, 429 for rate limits. Responses must not reveal private record existence. Rate limits and maximum sizes are enforced by the backend. Tokens and private request bodies must never be logged.

Subscriptions, notification delivery and public deletion endpoints are outside this contract version.
