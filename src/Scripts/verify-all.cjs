// Verifies every contract in deployments.json on the block explorer
// (Routescan, configured in hardhat.config.cjs) for the network it was
// deployed to. Safe to re-run — hardhat-verify no-ops already-verified contracts.
// Run:  npm run contracts:verify:fuji
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const deploymentsPath = path.join(__dirname, "..", "..", "deployments.json");
const d = JSON.parse(fs.readFileSync(deploymentsPath));

for (const [name, { address, args }] of Object.entries(d.contracts)) {
  const argsStr = (args || []).map((a) => `"${a}"`).join(" ");
  const cmd = `npx hardhat verify --network ${d.network} ${address} ${argsStr}`.trim();
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    console.warn(`${name} verification failed or already verified — continuing.`);
  }
}
