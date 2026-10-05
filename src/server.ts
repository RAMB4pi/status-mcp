import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/index.js';
import { startBridge } from './bridge.js';

if (process.env.STATUS_MCP_URL) {
  await startBridge(process.env.STATUS_MCP_URL, process.env.STATUS_MCP_TOKEN || '');
} else {
  const server = new McpServer({ name: 'harthad-status', version: '0.1.0' });
  registerTools(server);
  await server.connect(new StdioServerTransport());
}
