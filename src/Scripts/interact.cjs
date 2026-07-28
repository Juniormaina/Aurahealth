// The full solvency story, end to end, against your deployed token.
// Run AFTER deploy:  npx hardhat run src/Scripts/interact.cjs --network fuji
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Avalanche's public RPC rejects eth_estimateGas against "pending" — pass an
// explicit gasLimit on every write to skip estimation (see deploy-all.cjs).
const GAS_LIMIT = 200_000;

async function main() {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "deployments.json")));
  const tokenAddress = d.contracts?.IncentiveToken?.address || d.IncentiveToken;
  const [me] = await hre.ethers.getSigners();
  const t = await hre.ethers.getContractAt("IncentiveToken", tokenAddress);
  const fmt = (x) => hre.ethers.formatUnits(x, 18);

  console.log("1) Issuer rewards 1500 DUKA for a 'purchase'...");
  await (await t.issueReward(me.address, hre.ethers.parseUnits("1500", 18), "purchase", { gasLimit: GAS_LIMIT })).wait();
  console.log("   balance:", fmt(await t.balanceOf(me.address)));

  console.log("2) The closed loop in action: transfer to a random address should FAIL...");
  const stranger = hre.ethers.Wallet.createRandom().address;
  try {
    await (await t.transfer(stranger, hre.ethers.parseUnits("10", 18), { gasLimit: GAS_LIMIT })).wait();
    console.log("   !! transfer succeeded — closed loop NOT working");
  } catch {
    console.log("   ✓ reverted: 'Closed-loop token' — no open trading, by design");
  }

  console.log("3) Issuer approves that address as a merchant...");
  await (await t.setMerchant(stranger, true, { gasLimit: GAS_LIMIT })).wait();
  await (await t.transfer(stranger, hre.ethers.parseUnits("10", 18), { gasLimit: GAS_LIMIT })).wait();
  console.log("   ✓ paying a merchant works — the loop is closed, not sealed");

  console.log("4) Customer redeems 200 DUKA for 'airtime-topup' (burn on redeem)...");
  await (await t.redeem(hre.ethers.parseUnits("200", 18), "airtime-topup", { gasLimit: GAS_LIMIT })).wait();

  console.log("5) The CFO dashboard — free with the ledger:");
  console.log("   outstanding liability (totalSupply):", fmt(await t.totalSupply()));
  console.log("   lifetime emitted:", fmt(await t.totalEmitted()));
  console.log("   remaining budget:", fmt(await t.remainingBudget()));
  console.log("\nEvery number above is live, on-chain, verifiable by any client or auditor.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
