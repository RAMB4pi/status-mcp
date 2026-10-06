import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {createStatusServer, toolDefinitions} from '../src/tools/index.js';
import {StatusClient} from '../src/client/index.js';

test('all public tools execute over HTTP with bearer auth; schema rejection occurs before dispatch',async()=>{
 const calls:{name:string,input:unknown}[]=[];
 const http=createServer(async(req,res)=>{
  assert.equal(req.headers.authorization,'Bearer fixture');
  assert.match(req.url||'',/^\/v1\/mcp\/[a-z_]+$/);
  let data=''; for await(const chunk of req) data+=chunk;
  const name=req.url!.split('/').pop()!;
  calls.push({name,input:JSON.parse(data)});
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({ok:true,operation:name}));
 });
 http.listen(0,'127.0.0.1');await once(http,'listening');
 const port=(http.address() as {port:number}).port;
 const server=createStatusServer(new StatusClient('fixture',`http://127.0.0.1:${port}/v1`));
 const client=new Client({name:'fixture',version:'1'});
 const [a,b]=InMemoryTransport.createLinkedPair();await server.connect(a);await client.connect(b);
 const fixtures:Record<string,unknown>={
  create_service:{name:'Energy'},create_entry:{body:'Hello',visibility:'private',intent:'explicit',changes:[{serviceId:'energy',status:'degraded'}]},
  update_service:{service_id:'energy',status:'degraded',body:'Changed',intent:'context'},
  create_changelog_entry:{service_id:'energy',status:'operational',body:'Recovered',intent:'explicit'},
  create_comment:{entry_id:'entry',body:'Hello'},
  assistant_control:{activity:'preparing'},
  revise_status:{idempotency_key:'revision-1',operations:[{action:'archive_entry',id:'entry'}]},
 };
 try {
  const tools=await client.listTools();assert.equal(tools.tools.length,toolDefinitions.length);
  for (const t of toolDefinitions) {
   const r=await client.callTool({name:t.name,arguments:fixtures[t.name] as Record<string,unknown>||{}});
   assert.notEqual(r.isError,true);assert.match(JSON.stringify(r.content),new RegExp(t.name));
  }
  assert.equal(calls.length,toolDefinitions.length);
  const invalid=await client.callTool({name:'create_entry',arguments:{body:'x',intent:'context',owner_id:'someone-else'}});
  assert.equal(invalid.isError,true);assert.equal(calls.length,toolDefinitions.length);
 } finally {await client.close();await server.close();http.close();}
});
test('backend failures are errors, not successful publications, and do not leak response secrets',async()=>{
 const server=createStatusServer({async execute(){throw new Error('secret-token');}});
 const client=new Client({name:'fixture',version:'1'});const [a,b]=InMemoryTransport.createLinkedPair();
 await server.connect(a);await client.connect(b);
 try {const r=await client.callTool({name:'get_profile',arguments:{}});assert.equal(r.isError,true);assert.doesNotMatch(JSON.stringify(r),/secret-token/);}
 finally {await client.close();await server.close();}
});
test('API credentials cannot follow redirects or unsafe non-loopback HTTP URLs',async()=>{
 assert.throws(()=>new StatusClient('fixture','http://example.com/v1'),/HTTPS/);
 assert.throws(()=>new StatusClient('fixture','https://user:password@example.com/v1'),/Invalid/);
 const http=createServer((_req,res)=>{res.writeHead(302,{Location:'https://example.com/'});res.end();});
 http.listen(0,'127.0.0.1');await once(http,'listening');
 const port=(http.address() as {port:number}).port;
 try {await assert.rejects(()=>new StatusClient('fixture',`http://127.0.0.1:${port}/v1`).execute('get_profile',{}));}
 finally {http.close();}
});
