<p align="center">
  <img src="docs/readme/logo.svg" alt="Aura Health logo" width="360" />
</p>

<p align="center">
  <img src="docs/readme/cover.jpg" alt="Aura Health cover — misty green hills at dawn" width="100%" />
</p>

**Live app:** [https://www.aurahealth.co.ke/] [aurahealth-delta.vercel.app](https://aurahealth-delta.vercel.app/)

Aura Health is a **dark-only** gamified daily health app: an evolving companion
(**Astra**), a Health Cowries economy, sponsor rewards, and an AI coach (Astra)
— backed by real, verified smart contracts on **Avalanche Fuji testnet**. Sign
in with Google or email, or use **Continue as Guest** / **Guest Walkthrough**
to try the product without an account.

## Screenshots

| Landing | Features | Proof |
|:---:|:---:|:---:|
| <img src="docs/readme/screenshots/01-landing-hero.jpg" alt="Landing hero" /> | <img src="docs/readme/screenshots/02-features.jpg" alt="Features" /> | <img src="docs/readme/screenshots/03-proof.jpg" alt="Proof analytics" /> |

| Pricing | Companion | AI Coach | Rewards |
|:---:|:---:|:---:|:---:|
| <img src="docs/readme/screenshots/05-pricing.jpg" alt="Pricing" /> | <img src="docs/readme/screenshots/06-companion.jpg" alt="Companion dashboard" /> | <img src="docs/readme/screenshots/07-ai-coach.jpg" alt="AI Coach" /> | <img src="docs/readme/screenshots/08-rewards-hub.jpg" alt="Rewards hub" /> |

<details>
<summary>Landing Rewards section</summary>

<img src="docs/readme/screenshots/04-rewards-landing.jpg" alt="Landing Rewards" width="100%" />

</details>

## Value propositions (in-product)

Copy lives in [`src/content/valueProps.ts`](src/content/valueProps.ts) and is
shown in the UI, not only in marketing docs:

1. **Hero headline:** Reduce Stress in 5 Minutes a Day (36–48px). **Subhead:**
   AI-guided micro-sessions in natural language built for busy professionals
   (`#9CA3AF`). CTA: **Start Free Trial**. Astra preview is a glass card with
   a pulsing aura and typewriter prompts (`src/components/landing/Hero.tsx`).
2. **Proof:** culturally relevant tools for sleep and focus within 7 days;
   mood-adaptive anxiety reduction in two weeks — sparkline metric cards
   (e.g. **−50% Anxiety in 14 Days**) plus a Recharts sleep vs anxiety chart
   (`GET /api/metrics/proof`).
3. **Paywall / Pricing:** same 7-day sleep/focus line in
   [`PremiumModal`](src/components/PremiumModal.tsx) and the landing **Pricing**
   section (`src/components/landing/Pricing.tsx`).

Landing flow: **Hero → Features → Proof → Rewards → Pricing → CTA**. Header
nav is **Features**, **Proof**, **Rewards**, **Pricing** (smooth-scroll).
**Sign In** is a ghost pill; **Start Free Trial** is the solid gold CTA.
Cowries count-up and Loot Wheel teaser sit on the landing **Rewards** block;
full wheel / marketplace stay on the in-app Rewards tab.

## Product

| Surface | What it does |
|---|---|
| **Landing** | Nav + ghost Sign In / trial CTA; hero + Astra glass; 2×2 features; proof sparklines; Cowries / Loot Wheel; pricing; Firebase auth |
| **Companion** | Astra-first dashboard, mood-adaptive 5-min session, anxiety impact chart, habit cards, quick log |
| **AI Coach** | Astra chat in the user’s session language; mood-adapted micro-sessions |
| **Rewards** | Cowries balance, loot-wheel modal, community ticker, voucher marketplace |
| **Settings** | Plan, session language (Kiswahili / vernacular), Health Pass, Fitbit / Apple Watch |

Primary nav is **Companion**, **AI Coach**, **Rewards**, and **Settings**. Profile,
Health Pass, and Wearables are settings sections, not top-level tabs.

### Premium, trial, and plans

Sidebar **Upgrade to Premium** opens [`PremiumModal`](src/components/PremiumModal.tsx):
monthly (7-day free trial, then auto-subscribe), annual, one-time lifetime, and
corporate wellness package requests. Free users also see an in-app prompt after
check-in. Plans are in-memory on the Express server (not Stripe).

### Mood, anxiety, and funnel APIs

Schema: [`src/db/schema.sql`](src/db/schema.sql). Store: [`src/server/commerceStore.ts`](src/server/commerceStore.ts).

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/plans` | Tiers, corporate packages, value props |
| `GET` | `/api/subscriptions/:userId` | Current plan (`free` / `trial` / `premium` / `lifetime` / `corporate`) |
| `POST` | `/api/subscriptions/trial` | Start 7-day trial → auto monthly |
| `POST` | `/api/subscriptions/checkout` | Monthly, annual, or lifetime |
| `POST` | `/api/metrics` | Log `moodScore` + `anxietyLevel` |
| `GET` | `/api/metrics/proof` | Public 14-day sleep + anxiety series for landing |
| `GET` | `/api/metrics/:userId/impact` | 14-day anxiety drop headline + series |
| `POST` | `/api/funnel/event` | Engagement / conversion events |
| `GET` | `/api/funnel/summary` | Trial → conversion counts |
| `POST` | `/api/corporate` | Team wellness signup |

Check-ins include an anxiety 1–10 slider. Coach and session cards adapt to
Astra’s mood and Settings language.

### App shell

- Collapsible sidebar (**240px** expanded, **64px** collapsed) that **pushes**
  the main column on desktop (not an overlay). Collapse animates in **250ms**.
- Header: search, tabular Cowries, **+ Check-In** (icon-only on small screens).
- **Quick log** bar for hydration, meds, sleep, and mood, with an Astra reaction
  and XP / Cowries bump.
- **Upgrade to Premium** card at the bottom of the sidebar (paywall, not a
  silent toggle).

## Design system

Theme is locked to dark (no light/dark switcher). `theme-color` is `#0B0F17`.

| Token | Value |
|---|---|
| Base | `#0B0F17` |
| Cards | `#141A26` |
| Borders | `#242E42` |
| Mint | `#00FFC2` |
| Gold | `#FFB800` |
| Violet | `#8C52FF` |

- Fonts: **Inter** (UI) + **Space Grotesk** (display), loaded in `index.html`.
  Counters use tabular numerals.
- Cards: `rounded-2xl`, ~`p-6`, `#242E42` borders.
- Primary CTAs: gold→orange gradient (`#FFB800` → `#FF7A00`), **pill** radius,
  orange glow. Header Sign In uses `.btn-ghost`.
- Progress: teal→mint energy bars (segmented 10-cell `.energy-bar`).
- Astra hero: glassmorphism (`rgba(255,255,255,0.03)` + `backdrop-blur`) and a
  4s ambient pulse behind the avatar.

Landing motion uses [`motion/react`](https://motion.dev/) for scroll fade-ups,
plus CSS hover lift / Loot Wheel tilt. Logo and landing motion are disabled
when `prefers-reduced-motion` is set.

## Brand mark

<p align="center">
  <img src="docs/readme/logo.svg" alt="Aura Health logo" width="280" />
</p>

The Aura Health logo is a circular health-tech mark: a glowing teal–blue–purple
ring with a white heartbeat trace (neon-red glow) that pulses to signal vitality.
It is used as:

- The **favicon** (`public/favicon.svg`) and Apple touch icon
- The **wordmark lockup** (`public/aurahealth-logo.svg` / `docs/readme/logo.svg`)
- The in-app / landing glyph (`src/components/AuraLogo.tsx` — `AuraMark`)

README cover and screenshots live in [`docs/readme/`](docs/readme/). Refresh them with:

```bash
python scripts/capture_readme_screenshots.py
```

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

Dev server: `http://localhost:3000` (`tsx server.ts`).

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
public/             favicon.svg (app icon) and aurahealth-logo.svg (wordmark)
src/
  content/          Value props, session languages, subscription tier catalog
  db/schema.sql     Plans, user_metrics, funnel_events, corporate_leads
  server/           In-memory commerce/metrics store used by Express
  contracts/        Solidity sources (LoyaltyPoints, AchievementBadges, StreakTracker, TierSystem, IncentiveToken)
  script/           Foundry deployment scripts (optional, requires forge-std)
  Scripts/          Hardhat deployment/verification scripts (.cjs)
  services/         avalanche.ts, firebase.ts, healthDataService.ts, commerce.ts (API client)
  components/       React UI (landing Hero/Features/Proof/Rewards/Pricing/Cta, paywall, impact, sidebar, coach, rewards)
  App.tsx           App shell, auth, plans, and tab routing
  index.css         Dark design tokens, energy bars, chat bubbles, gold panels
server.ts           Express (Gemini, metrics, subscriptions, funnel, Vite/static)
hardhat.config.cjs  Hardhat network + Routescan verification config
deployments.json    Deployed contract addresses (this repo's live Fuji deployment)
```

## Notes

Monetization (current): three value props in hero, onboarding, paywall, and
impact chart; trial → auto-subscribe; corporate package endpoint; mood/anxiety
logging. Plan state is process-local until a real billing provider is wired.

UI: locked carbon-mint dark theme; collapsible pushing sidebar; Astra-first
companion home; quick log; loot wheel as a modal; verification in the landing
footer and settings drawer — not in the hero.

Contracts (earlier): Hardhat toolchain, Routescan verification, and the five
live Fuji addresses in `src/services/avalanche.ts`. Fictional contract
placeholders were removed so the Smart Contracts tab only shows deployed
source.
