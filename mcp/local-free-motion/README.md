# local-free-motion

Zero-cost Stdio MCP server for Aura Health motion frames.

## Tools
- `probe_local_pipeline` — runtime / paths / SVD dormancy
- `list_local_motion_catalog` — yoga + calisthenics ids from the workspace
- `generate_local_animation_frame` — bone eulers + cue flags → JSON / SVG / PNG

## Engines
| Engine | Behavior |
|--------|----------|
| `procedural` | Node raster only (default) |
| `python` | Runs `pipelines/generate_frame.py` (local, no cloud) |
| `svd` | **Dormant** unless `LOCAL_SVD_SCRIPT` points at a verified local open-weight wrapper |

Never uses Runway, Luma, or credit-based APIs.

## Config
Registered in `~/.cursor/mcp.json` and workspace `.cursor/mcp.json`:

```json
{
  "command": "node",
  "args": ["C:/Users/hp/.cursor/mcp-servers/local-free-motion/index.js"],
  "env": {
    "WORKSPACE_ROOT": "C:/Users/hp/Desktop/Aurahealth-2",
    "LOCAL_MOTION_OUT": "C:/Users/hp/Desktop/Aurahealth-2/tmp/local-free-motion"
  }
}
```

## Local CLI
```bash
npm run smoke
node invoke.js "warrior I, arms high"
```

Artifacts land in `tmp/local-free-motion/` (gitignored).
