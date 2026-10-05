# Authentication plan — not implemented

The hosted webapp uses Google login. The backend owns account creation, sessions, permission checks and token issuance. Google login is separate from delegated MCP authorization.

Intended MCP OAuth flow: Authorization Code with PKCE (`S256`), exact registered redirect URIs, state verification, explicit consent, short-lived access tokens, refresh token rotation/revocation and least privilege scopes. Publish OAuth/protected-resource discovery metadata and follow the MCP authorization specification when the remote transport is added. Do not invent a `POST /oauth/authorize` JSON login shortcut.

Scopes:

- `status:read`: authorized profile, services, status, changelog and bounded context.
- `status:write`: create/update the account owner's services, changelog and entries.
- `comments:write`: comment on accessible entries when allowed.

[`src/auth/index.ts`](../src/auth/index.ts) only defines scopes and reads `STATUS_ACCESS_TOKEN` for future local development. It neither obtains nor validates tokens. The server currently never reads or sends credentials because all tools are stubs. Do not put tokens in this repository or example configuration. The backend must derive `created_by` from authenticated client provenance, not from model arguments.

Remote MCP authentication, consent, discovery and token refresh are launch gates, not features of this scaffold.
