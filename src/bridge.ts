import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export async function startBridge(url: string, token: string): Promise<void> {
  const target = new URL(url);
  if (target.protocol !== 'https:' && !(target.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname))) {
    throw new Error('Use HTTPS, or a loopback URL for local development.');
  }
  if (!token.trim()) throw new Error('STATUS_MCP_TOKEN is required.');
  const upstream = new Client({ name: 'status-mcp-bridge', version: '0.1.0' });
  await upstream.connect(new StreamableHTTPClientTransport(target, {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  }));
  const server = new Server({ name: 'harthad-status', version: '0.1.0' }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => upstream.listTools());
  server.setRequestHandler(CallToolRequestSchema, async request => {
    try { return await upstream.callTool(request.params); }
    catch { return { isError: true, content: [{ type: 'text', text: 'The Status request failed. Check the connection and permissions.' }] }; }
  });
  server.onclose = () => { void upstream.close(); };
  await server.connect(new StdioServerTransport());
}
