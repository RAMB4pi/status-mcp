import { z } from "zod";
import { toolDefinitions, type ToolName, type StatusApi } from "../tools/index.js";

export class StatusApiError extends Error {
  constructor(public readonly status: number) {
    super(`Status API request failed (${status})`);
    this.name = "StatusApiError";
  }
}

/** Shared transport. No direct database access; response validation is required. */
export class StatusClient implements StatusApi {
  private readonly baseUrl: URL;
  constructor(private readonly token?: string, baseUrl = "https://status.harthad.com/v1") {
    this.baseUrl = new URL(baseUrl.replace(/\/$/, "") + "/");
    if (this.baseUrl.username || this.baseUrl.password || this.baseUrl.search || this.baseUrl.hash) throw new Error("Invalid Status API base URL");
    if (this.baseUrl.protocol !== "https:" && !(this.baseUrl.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(this.baseUrl.hostname))) throw new Error("Status API requires HTTPS or loopback");
  }
  async execute(name: ToolName, input: unknown): Promise<unknown> {
    const tool = toolDefinitions.find(t => t.name === name);
    if (!tool) throw new Error("Unknown Status operation");
    return this.request("POST", `mcp/${name}`, z.json(), tool.schema.parse(input));
  }
  async request<T>(method: "GET" | "POST" | "PATCH", path: string, schema: z.ZodType<T>, body?: unknown): Promise<T> {
    const url = new URL(path.replace(/^\//, ""), this.baseUrl);
    if (url.origin !== this.baseUrl.origin || !url.pathname.startsWith(this.baseUrl.pathname)) {
      throw new Error("Request must stay within the configured API base");
    }
    const response = await fetch(url, {
      method, redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) throw new StatusApiError(response.status);
    return schema.parse(await response.json());
  }
}
