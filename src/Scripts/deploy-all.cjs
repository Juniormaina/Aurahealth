// Deploys the full Aurahealth on-chain gamification stack to Avalanche Fuji:
// LoyaltyPoints (ledger) -> AchievementBadges, StreakTracker, TierSystem, IncentiveToken.
//
//   If LOYALTY_ADDRESS is set in src/.env -> attaches to an existing LoyaltyPoints ledger
//   If it is not set                      -> deploys a fresh LoyaltyPoints first
//
// Run:  npx hardhat run src/Scripts/deploy-all.cjs --network fuji
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Avalanche's public C-Chain RPC rejects eth_estimateGas against the "pending"
// block tag ("state not available for pending block"), which is what ethers'
// default gas estimation uses. Passing an explicit gasLimit skips estimation.
const GAS_LIMIT = 6_000_000;

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying as issuer:", deployer.address);

  // 0. The ledger — existing, or a fresh deploy
  let loyaltyAddress = process.env.LOYALTY_ADDRESS;
  if (loyaltyAddress) {
    console.log("Attaching to existing LoyaltyPoints ->", loyaltyAddress);
  } else {
    const loyalty = await hre.ethers.deployContract("LoyaltyPoints", { gasLimit: GAS_LIMIT });
    await loyalty.waitForDeployment();
    loyaltyAddress = loyalty.target;
    console.log("(no LOYALTY_ADDRESS in .env — deployed a fresh ledger)");
    console.log("LoyaltyPoints      ->", loyaltyAddress);
  }

  // 1. Badges — reads the ledger: composition.
  const badges = await hre.ethers.deployContract("AchievementBadges", [loyaltyAddress], { gasLimit: GAS_LIMIT });
  await badges.waitForDeployment();
  console.log("AchievementBadges  ->", badges.target);

  // 2. Streaks — standalone habit engine.
  const streaks = await hre.ethers.deployContract("StreakTracker", { gasLimit: GAS_LIMIT });
  await streaks.waitForDeployment();
  console.log("StreakTracker      ->", streaks.target);

  // 3. Tiers — a pure view over the ledger.
  const tiers = await hre.ethers.deployContract("TierSystem", [loyaltyAddress], { gasLimit: GAS_LIMIT });
  await tiers.waitForDeployment();
  console.log("TierSystem         ->", tiers.target);

  // 4. IncentiveToken — the budget-enforced reward token.
  const cap = process.env.EMISSION_CAP || hre.ethers.parseUnits("10000000", 18).toString();
  console.log("Emission cap (the budget, forever):", cap);
  const token = await hre.ethers.deployContract("IncentiveToken", [cap], { gasLimit: GAS_LIMIT });
  await token.waitForDeployment();
  console.log("IncentiveToken     ->", token.target);

  const out = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    issuer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      LoyaltyPoints: { address: loyaltyAddress, args: [] },
      AchievementBadges: { address: badges.target, args: [loyaltyAddress] },
      StreakTracker: { address: streaks.target, args: [] },
      TierSystem: { address: tiers.target, args: [loyaltyAddress] },
      IncentiveToken: { address: token.target, args: [cap] },
    },
    emissionCap: cap,
  };

  const outPath = path.join(__dirname, "..", "..", "deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nSaved to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
