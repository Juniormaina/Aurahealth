import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: [fileURLToPath(new URL('./index.js', import.meta.url))],
  env: {
    ...process.env,
    WORKSPACE_ROOT: process.env.WORKSPACE_ROOT || 'C:/Users/hp/Desktop/Aurahealth-2',
    LOCAL_MOTION_OUT: process.env.LOCAL_MOTION_OUT || 'C:/Users/hp/Desktop/Aurahealth-2/tmp/local-free-motion',
  },
});

const client = new Client({ name: 'local-free-motion-invoke', version: '1.0.0' });
await client.connect(transport);

const tools = await client.listTools();
const probe = await client.callTool({ name: 'probe_local_pipeline', arguments: {} });
const catalog = await client.callTool({
  name: 'list_local_motion_catalog',
  arguments: { query: 'dog' },
});
const frame = await client.callTool({
  name: 'generate_local_animation_frame',
  arguments: {
    prompt: process.argv[2] || 'calisthenics push-up mid-rep, ribs down, elbows close',
    progress: 0.6,
    elapsed: 0.9,
    breath_phase: 'exhale',
    trainer_id: 'aura',
    engine: 'python',
  },
});

console.log(JSON.stringify({ tools: tools.tools.map((t) => t.name), probe, catalog, frame }, null, 2));
await client.close();
