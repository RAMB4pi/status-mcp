# Hosted OAuth and legacy scaffold

The private hosted backend at `https://status.harthad.com` owns shared Harthad Google sessions, explicit consent and OAuth issuance. Google login identifies a person; OAuth separately grants ChatGPT access to that person's Status. The Apache-2.0 package does not contain the hosted backend.

The hosted flow implements Authorization Code with PKCE (`S256`), registered ChatGPT redirect URLs, a browser-bound approval request, state forwarding, one-use codes, resource binding to `/mcp`, one-hour access tokens and rotating thirty-day refresh tokens. The browser must authorize the connection; existing Harthad sessions can be reused. A new connection replaces the account's previous one. Disconnecting revokes access and prevents refresh.

Discovery: `/.well-known/oauth-protected-resource/mcp` and `/.well-known/oauth-authorization-server`. Endpoints: `/register`, `/authorize`, `/token`, `/revoke`. These are standards-based endpoints, not JSON login shortcuts.

Hosted scopes:

- `status:read`: profile, services, status, changelog and accessible context.
- `status:write`: create services, publish entries/transitions and comment on accessible entries.

The original `src/auth/index.ts` and REST schemas remain a legacy draft (including its separate `comments:write` scope). They do not obtain or validate remote OAuth tokens. The optional stdio bridge forwards an independently provided account bearer credential; it does not perform OAuth. Never commit credentials.

Local synthetic tests cover consent/login requirements, PKCE rejection, code replay, resource binding, scopes, rotation and revocation. Native ChatGPT and production OAuth end-to-end verification remain pending. Use the [ChatGPT guide](../examples/chatgpt/README.md).

Publication provenance records declared intent (`explicit` → human, `context` → AI), independently of transport. It is not cryptographic proof of human consent. Owner IDs, timestamps and previous states remain backend-owned.
