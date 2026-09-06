import { scanWorkspaceCatalog } from './lib/catalog.js';
import { generateLocalAnimationFrame } from './lib/pipeline.js';

process.env.WORKSPACE_ROOT ||= 'C:/Users/hp/Desktop/Aurahealth-2';
process.env.LOCAL_MOTION_OUT ||= 'C:/Users/hp/Desktop/Aurahealth-2/tmp/local-free-motion';

const prompt = process.argv[2] || 'downward dog, pedal the heels, shoulders away from ears';
const result = await generateLocalAnimationFrame({
  prompt,
  progress: 0.35,
  elapsed: 1.6,
  breath_phase: 'inhale',
  trainer_id: 'aurora',
  engine: 'python',
  frame_index: 0,
});
console.log(JSON.stringify({ catalog: scanWorkspaceCatalog(), result }, null, 2));
