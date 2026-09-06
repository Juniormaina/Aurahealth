#!/usr/bin/env node
/**
 * local-free-motion — stdio MCP server.
 * Maps Aura Health motion prompts to a zero-cost local frame pipeline.
 */
import fs from 'node:fs';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { scanWorkspaceCatalog, workspaceRoot } from './lib/catalog.js';
import { defaultOutDir, generateLocalAnimationFrame, PYTHON_HOOK } from './lib/pipeline.js';

function textResult(payload) {
  return {
    content: [{ type: 'text', text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2) }],
  };
}

const TOOLS = [
  {
    name: 'generate_local_animation_frame',
    description:
      'Generate a zero-cost local animation frame from a motion prompt. Maps to Aura Health yoga/calisthenics poses, writes JSON + SVG + PNG, and optionally runs a local Python/SVD hook. Never uses paid studio APIs.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Motion prompt, cue, or pose name (e.g. downward dog, push-up at mid-rep)' },
        progress: { type: 'number', description: '0 = extended/A, 1 = compressed/B for calisthenics' },
        elapsed: { type: 'number', description: 'Seconds of overlay time (sway, heel pedal)' },
        breath_phase: {
          type: 'string',
          enum: ['inhale', 'hold_top', 'exhale', 'hold_bottom', 'idle'],
        },
        is_breathing: { type: 'boolean' },
        trainer_id: { type: 'string', enum: ['aura', 'aurora'] },
        asset_id: { type: 'string', description: 'Optional yoga animation_asset_id hint' },
        engine: {
          type: 'string',
          enum: ['procedural', 'python', 'svd'],
          description:
            'Local engine. Default procedural. python runs pipelines/generate_frame.py. svd stays dormant unless LOCAL_SVD_SCRIPT points at a verified local open-weight wrapper — never Runway/Luma/cloud.',
        },
        frame_index: {
          type: 'number',
          description: 'Optional iterative frame index for sequenced local generation (writes _f0001 suffix).',
        },
        width: { type: 'number' },
        height: { type: 'number' },
        out_dir: { type: 'string' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'list_local_motion_catalog',
    description: 'List local yoga/calisthenics motion ids and scan Aura Health workspace content files.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Optional filter string' },
      },
    },
  },
  {
    name: 'probe_local_pipeline',
    description: 'Report local runtime, workspace root, output dir, and optional SVD script — no network calls.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function handleTool(name, args) {
  if (name === 'generate_local_animation_frame') {
    return textResult(await generateLocalAnimationFrame(args ?? {}));
  }
  if (name === 'list_local_motion_catalog') {
    const catalog = scanWorkspaceCatalog();
    const query = String(args?.query ?? '').toLowerCase();
    if (!query) return textResult(catalog);
    const filterList = (arr) => arr.filter((x) => String(x).toLowerCase().includes(query));
    return textResult({
      ...catalog,
      localYogaFamilies: filterList(catalog.localYogaFamilies),
      localCaliStates: filterList(catalog.localCaliStates),
      scanned: catalog.scanned.map((s) => ({
        ...s,
        poseIds: filterList(s.poseIds),
        animationAssetIds: filterList(s.animationAssetIds),
        animationStates: filterList(s.animationStates),
        displayNames: filterList(s.displayNames),
      })),
    });
  }
  if (name === 'probe_local_pipeline') {
    return textResult({
      server: 'local-free-motion',
      transport: 'stdio',
      cost: 0,
      workspaceRoot: workspaceRoot(),
      outDir: defaultOutDir(),
      pythonHook: fs.existsSync(PYTHON_HOOK) ? PYTHON_HOOK : null,
      localSvdScript: process.env.LOCAL_SVD_SCRIPT || null,
      node: process.version,
    });
  }
  throw new Error(`Unknown tool: ${name}`);
}

const server = new Server(
  { name: 'local-free-motion', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};
  try {
    return await handleTool(name, args);
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
