export const scopes = ["status:read", "status:write"] as const;
export type Scope = typeof scopes[number];

// Local development only. OAuth acquisition, refresh and consent are not implemented.
export function readAccessToken(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const token = env.STATUS_ACCESS_TOKEN?.trim();
  return token || undefined;
}
