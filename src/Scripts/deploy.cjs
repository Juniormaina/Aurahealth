// Deploys (or redeploys) just IncentiveToken with your emission cap
// (Solvency Rule 2: immutable budget). Merges into the existing deployments.json
// written by deploy-all.cjs instead of clobbering the other 4 addresses.
// Run:  npx hardhat run src/Scripts/deploy.cjs --network fuji
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const cap = process.env.EMISSION_CAP || hre.ethers.parseUnits("10000000", 18).toString();

  console.log("Deploying as issuer:", deployer.address);
  console.log("Emission cap (the budget, forever):", cap);

  const token = await hre.ethers.deployContract("IncentiveToken", [cap], { gasLimit: 6_000_000 });
  await token.waitForDeployment();
  console.log("IncentiveToken ->", token.target);

  const outPath = path.join(__dirname, "..", "..", "deployments.json");
  const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath)) : { contracts: {} };
  existing.network = hre.network.name;
  existing.issuer = deployer.address;
  existing.contracts = existing.contracts || {};
  existing.contracts.IncentiveToken = { address: token.target, args: [cap] };
  existing.emissionCap = cap;
  fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
  console.log(`\nSaved to ${outPath}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
