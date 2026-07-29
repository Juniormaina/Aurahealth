# Aura Health

**Live app:** [aurahealth-delta.vercel.app](https://aurahealth-delta.vercel.app/)

Gamified daily health check-in app with an evolving digital companion, a
"Health Cowries" points economy, sponsor reward pools, and an AI health coach —
backed by real, verified smart contracts on **Avalanche Fuji testnet**.

## Live on-chain deployment

All 5 gamification contracts are deployed and **source-verified** on Avalanche
Fuji (chain ID `43113`). Explorer links go to Routescan, the block explorer
Avalanche's own verification pipeline uses:

| Contract | Address | Explorer |
|---|---|---|
| `LoyaltyPoints` | `0x337769E522647D1541Acc8F20381d9a43B75d4bD` | [View verified source](https://avalanche.testnet.routescan.io/address/0x337769E522647D1541Acc8F20381d9a43B75d4bD#code) |
| `AchievementBadges` | `0x159Bc84b1B693A6235d8C6EE46eC7c5AF120926e` | [View verified source](https://avalanche.testnet.routescan.io/address/0x159Bc84b1B693A6235d8C6EE46eC7c5AF120926e#code) |
| `StreakTracker` | `0xC926fb9344D6C0C7BC3F22549850a847cb0C0b92` | [View verified source](https://avalanche.testnet.routescan.io/address/0xC926fb9344D6C0C7BC3F22549850a847cb0C0b92#code) |
| `TierSystem` | `0x52bEc6D4aA6DFA6a2A8c9ffDc15b63C68122cc46` | [View verified source](https://avalanche.testnet.routescan.io/address/0x52bEc6D4aA6DFA6a2A8c9ffDc15b63C68122cc46#code) |
| `IncentiveToken` (DUKA) | `0x4B446a6f8de7F58951c74Aaa6c98D0666f165FfE` | [View verified source](https://avalanche.testnet.routescan.io/address/0x4B446a6f8de7F58951c74Aaa6c98D0666f165FfE#code) |

Deployed by issuer `0x066d4646Ce97959fa45a933065946ED5A162E686`. Full deployment
metadata (network, constructor args, timestamps) lives in [deployments.json](deployments.json).

### What's actually on-chain in the app

- **Smart Contracts tab** (`src/components/SmartContractsViewer.tsx`) reads the
  real, verified Solidity source straight from `src/contracts/*.sol` and does
  **live reads** against the deployed contracts over the public Fuji RPC
  (`LoyaltyPoints.outstandingLiability()`, `AchievementBadges.badgeCount()`,
  `IncentiveToken.totalSupply()` / `remainingBudget()`) — no mocked numbers.
- **Daily Health Check-In** (`src/components/HealthCheckinModal.tsx`): when a
  real wallet is connected (MetaMask / Core Wallet, on Fuji), submitting a
  check-in calls `StreakTracker.checkIn()` directly from the user's wallet and
  waits for the real transaction receipt. `StreakTracker` enforces its own
  24h/48h grace window on-chain per address, so a real check-in only succeeds
  once per day per wallet — if it's already been called today, or no wallet is
  connected, the app falls back to a simulated log entry so the demo flow
  never blocks on gas or wallet friction.
- **Sponsor pools / reward wheel** remain a simulated in-app economy. Their
  underlying actions (`issueReward`, `awardBadge`, `earnPoints`) are
  issuer-gated on-chain (only the deploying address may call them), so they
  can't be triggered directly from an end user's wallet without a backend
  signer service — out of scope for this pass.

## Smart contracts

Solidity sources live in [`src/contracts/`](src/contracts/):

- **`LoyaltyPoints.sol`** — the points ledger. Issuer mints (`earnPoints`) and
  anyone can burn their own balance (`redeemPoints`). Every other contract
  reads this one instead of keeping its own copy of a balance.
- **`AchievementBadges.sol`** — soulbound (non-transferable) badges. Two award
  paths: issuer-attested (`awardBadge`) and self-claimed against a points
  threshold read from `LoyaltyPoints` (`claimBadge`).
- **`StreakTracker.sol`** — daily check-in habit loop with a one-day grace
  window; tracks current and all-time-longest streak.
- **`TierSystem.sol`** — computes Member/Silver/Gold/Platinum tier on-demand
  from a customer's `LoyaltyPoints` balance. Zero storage, can never drift out
  of sync with the ledger.
- **`IncentiveToken.sol`** — an ERC-20 (`DUKA`) reward token with an immutable
  emission cap, burn-on-redeem, and a closed-loop transfer restriction (only
  to/from approved merchants) so it stays a redemption tool, not a tradeable
  asset.

## Prerequisites

- Node.js 18+
- npm (or bun — a `bun.lock` is also present)
- A Fuji AVAX-funded private key if you want to (re)deploy or send real
  on-chain transactions (get free testnet AVAX from the
  [Avalanche Fuji faucet](https://faucet.avax.network/))

## Environment variables

Create `src/.env` (already gitignored) with:

```bash
# Frontend / server
GEMINI_API_KEY=your-gemini-api-key

# Contract deployment (Avalanche Fuji testnet)
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=0xyour-test-only-private-key
EMISSION_CAP=10000000000000000000000000   # 10,000,000 DUKA, 18 decimals

# Optional: attach to an existing LoyaltyPoints ledger instead of deploying a new one
# LOYALTY_ADDRESS=0x...
```

> **Never use a private key that holds real funds.** `PRIVATE_KEY` should only
> ever be a throwaway testnet key. `.env*` files are gitignored — double-check
> before committing anything that touches this file.

See [`.env.example`](.env.example) for the app-level (Gemini/Cloud Run) variables.

## Running the app

```bash
npm install
npm run dev       # starts the Express + Vite dev server
```

```bash
npm run build      # production build (vite build + esbuild server bundle)
npm run start      # run the production server
npm run lint       # tsc --noEmit
```

## Smart contract workflow

```bash
npm run contracts:compile          # hardhat compile (src/contracts -> artifacts/)
npm run contracts:deploy:fuji      # deploy all 5 contracts, writes deployments.json
npm run contracts:verify:fuji      # verify every contract in deployments.json on Routescan
```

Under the hood these wrap Hardhat scripts in `src/Scripts/`:

- `deploy-all.cjs` — deploys `LoyaltyPoints` (or attaches to `LOYALTY_ADDRESS`
  if set), then `AchievementBadges`, `StreakTracker`, `TierSystem`, and
  `IncentiveToken`, and writes addresses + constructor args to
  `deployments.json`.
- `deploy.cjs` — redeploys just `IncentiveToken` and merges its address into
  the existing `deployments.json` instead of overwriting it.
- `interact.cjs` — exercises the full `IncentiveToken` solvency story
  end-to-end (issue → closed-loop transfer restriction → approve merchant →
  redeem/burn) against whatever is currently deployed.
- `verify-all.cjs` — loops over `deployments.json` and runs `hardhat verify`
  for each contract/constructor-arg pair.

Avalanche's public C-Chain RPC rejects `eth_estimateGas` calls against the
`"pending"` block tag, which is what ethers' default gas estimation uses —
every write in these scripts passes an explicit `gasLimit` to skip estimation
entirely.

There's also a parallel Foundry script pair in `src/script/` (`Deploy.s.sol`,
`LoyaltyPoints.s.sol`) for anyone who prefers `forge`. They aren't wired into
npm scripts since this repo uses Hardhat as its primary toolchain — running
them requires `forge install foundry-rs/forge-std` first.

## Project structure

```
src/
  contracts/        Solidity sources (LoyaltyPoints, AchievementBadges, StreakTracker, TierSystem, IncentiveToken)
  script/           Foundry deployment scripts (optional, requires forge-std)
  Scripts/          Hardhat deployment/verification scripts (.cjs)
  services/         avalanche.ts (chain config + on-chain reads/writes), firebase.ts, healthDataService.ts
  components/       React UI components
  App.tsx           Main app shell and state
server.ts           Express server (Gemini AI endpoints, static/Vite serving)
hardhat.config.cjs  Hardhat network + Routescan verification config
deployments.json    Deployed contract addresses (this repo's live Fuji deployment)
```

## Notes on what changed in this pass

- Set up the missing Hardhat toolchain (`hardhat.config.cjs`, `@openzeppelin/contracts`)
  — none of the 5 contracts had a working build/deploy pipeline before.
- Fixed a broken import in `src/script/LoyaltyPoints.s.sol` (pointed at a
  nonexistent `../src/LoyaltyPoints.sol`; corrected to `../contracts/LoyaltyPoints.sol`).
- Renamed the Hardhat scripts in `src/Scripts/` from `.js` to `.cjs` — the
  project's `package.json` has `"type": "module"`, so plain `.js` files were
  being parsed as ES modules and failing on `require()`.
- Fixed `interact.cjs`, which read a flat `deployments.json` schema that
  `deploy-all.cjs` no longer produces after being extended to deploy all 5
  contracts (it now reads the nested `contracts.<Name>.address` shape).
- Removed `src/contracts/SolidityCode.ts` — dead code holding three fictional,
  never-deployed contracts (`ProofOfAdherence`, `HealthCompanionNFT`,
  `RewardSponsorPool`) with fabricated addresses that the Smart Contracts tab
  displayed as if they were real.
- Replaced the fake `CONTRACT_ADDRESSES` in `src/services/avalanche.ts` (three
  made-up addresses) with the 5 real, deployed, verified contract addresses,
  and pointed the explorer config at the real Routescan Fuji explorer instead
  of a placeholder `explorer.aurahealth.io` URL.
