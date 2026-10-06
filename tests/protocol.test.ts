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
test("all ten tools are discoverable and execute validated API operations", async () => {
  const server = new McpServer({ name: "test", version: "0.1.0" });
  registerTools(server, {async execute(name, input) { return {name,input}; }});
  const client = new Client({ name: "test-client", version: "0.1.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await client.connect(b);
  try {
    const result = await client.listTools();
    assert.deepEqual(result.tools.map(t => t.name).sort(), toolDefinitions.map(t => t.name).sort());
    const call = await client.callTool({ name: "create_entry", arguments: { body: "hello", visibility: "private", intent: "explicit" } });
    assert.notEqual(call.isError, true);
    assert.match(JSON.stringify(call.content), /create_entry/);
    const invalid = await client.callTool({ name: "create_entry", arguments: { body: "hello", visibility: "private", owner_id: "other" } });
    assert.equal(invalid.isError, true);
  } finally { await client.close(); await server.close(); }
});
test("API credentials cannot be sent to another origin or outside /v1", async () => {
  const client = new StatusClient("test-token");
  await assert.rejects(() => client.request("GET", "https://example.com/", StatusSchema), /configured API base/);
  await assert.rejects(() => client.request("GET", "../me", StatusSchema), /configured API base/);
});

test("entry limits agree for create, revisions and transition tools", () => {
  const definition = (name: string) => toolDefinitions.find(t => t.name === name)!.schema;
  assert.equal(CreateEntrySchema.safeParse({body:"a".repeat(1001),visibility:"public"}).success,false);
  assert.equal(definition("create_entry").safeParse({body:"a".repeat(1000),intent:"explicit",private_details:"b".repeat(5000)}).success,true);
  assert.equal(definition("create_entry").safeParse({body:"a".repeat(1001),intent:"explicit"}).success,false);
  assert.equal(definition("revise_status").safeParse({idempotency_key:"key",operations:[{action:"edit_entry",id:"entry",private_details:"b".repeat(5001)}]}).success,false);
  assert.equal(definition("update_service").safeParse({service_id:"service",status:"degraded",body:"a".repeat(1001),intent:"explicit"}).success,false);
});
