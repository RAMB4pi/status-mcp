import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createStatusServer } from './tools/index.js';
import { StatusClient } from './client/index.js';
import { startBridge } from './bridge.js';

const token = process.env.STATUS_ACCESS_TOKEN?.trim() || process.env.STATUS_MCP_TOKEN?.trim();
if (!token) throw new Error('Set STATUS_ACCESS_TOKEN (or STATUS_MCP_TOKEN) for your own account. Remote plugins use the host OAuth flow.');
if (process.env.STATUS_MCP_URL) {
  await startBridge(process.env.STATUS_MCP_URL, token);
} else {
  const server = createStatusServer(new StatusClient(token, process.env.STATUS_API_URL));
  await server.connect(new StdioServerTransport());
}
