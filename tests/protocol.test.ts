import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTools, toolDefinitions } from "../src/tools/index.js";
import { StatusSchema, CreateEntrySchema, UpdateServiceSchema } from "../src/schemas/index.js";
import { StatusClient } from "../src/client/index.js";

test("requests reject forged ownership/provenance and invalid status values", () => {
  assert.equal(CreateEntrySchema.safeParse({ body: "hello", visibility: "private", owner_id: "other", created_by: "user" }).success, false);
  assert.equal(StatusSchema.safeParse("unknown").success, false);
  assert.equal(UpdateServiceSchema.safeParse({}).success, false);
  assert.equal(CreateEntrySchema.safeParse({ body: "hello", visibility: "private" }).success, true);
});
test("all ten tools are discoverable and a write returns an explicit stub error", async () => {
  const server = new McpServer({ name: "test", version: "0.1.0" });
  registerTools(server);
  const client = new Client({ name: "test-client", version: "0.1.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await client.connect(b);
  try {
    const result = await client.listTools();
    assert.deepEqual(result.tools.map(t => t.name).sort(), toolDefinitions.map(t => t.name).sort());
    const call = await client.callTool({ name: "create_entry", arguments: { body: "hello", visibility: "private" } });
    assert.equal(call.isError, true);
    assert.match(JSON.stringify(call.content), /NOT_IMPLEMENTED/);
    const invalid = await client.callTool({ name: "create_entry", arguments: { body: "hello", visibility: "private", owner_id: "other" } });
    assert.equal(invalid.isError, true);
  } finally { await client.close(); await server.close(); }
});
test("API credentials cannot be sent to another origin or outside /v1", async () => {
  const client = new StatusClient("test-token");
  await assert.rejects(() => client.request("GET", "https://example.com/", StatusSchema), /configured API base/);
  await assert.rejects(() => client.request("GET", "../me", StatusSchema), /configured API base/);
});
