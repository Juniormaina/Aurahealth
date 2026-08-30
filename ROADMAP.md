# Aura Health Roadmap

**Status:** MVP live at [aurahealth-delta.vercel.app](https://aurahealth-delta.vercel.app/)  
**Last updated:** August 2026

This roadmap takes Aura Health from the current MVP to a production-complete
wellness product: durable data, real payments, verified health integrations,
a production rewards rail, and a shippable corporate + consumer experience.

---

## Where we are (MVP)

Shipped and demoable today:

| Area | MVP state |
|---|---|
| **Landing & brand** | Forest glass marketing site, proof chart, pricing, sticky nav |
| **Auth** | Google / email / guest walkthrough (Firebase) |
| **Companion** | Astra dashboard, habits (litres / glasses), quick log, streaks |
| **AI Coach** | Gemini-backed chat + mood-adaptive 5-minute sessions |
| **Check-ins** | Water (L), sleep, meds, mood, anxiety; AI attestation |
| **Rewards UI** | Cowries, loot wheel, conversion calculator, voucher cards |
| **Settings** | Plan, language, Health Pass / wearables placeholders |
| **Chain** | 5 contracts verified on **Avalanche Fuji**; live reads + optional wallet check-in |
| **Commerce** | Trial / plan APIs in **memory** (not Stripe yet) |

Known MVP gaps: simulated wearables & sponsor economy, no durable Postgres
wiring in production, issuer-gated on-chain rewards need a backend signer,
clinical claims remain soft / self-reported.

---

## North star (full build)

Aura Health becomes a **production wellness companion** for professionals and
teams in Africa-first markets:

1. Users keep a durable daily habit with Astra (sessions, check-ins, language).
2. Progress is private by default, exportable, and optionally attested on-chain.
3. Premium and corporate seats are paid through a real billing stack.
4. Wearables and Health Pass sync real metrics (hydration in L / glasses).
5. Rewards redeem into real partner value (clinic vouchers, data, gym) with
   auditable issuance — without turning the home screen into a crypto wallet.
6. Employers get impact reports that stay wellness-framed, not clinical claims.

---

## Phase 0 — MVP freeze *(now)*

**Goal:** Stable demo for investors, partners, and pilot users.

- [x] Landing + in-app shell on forest glass theme
- [x] Guest / Google / email entry paths
- [x] Companion, Coach, Rewards, Settings surfaces
- [x] Fuji contracts deployed & source-verified
- [x] Public proof metrics + soft claim disclaimers
- [ ] Tag `v0.1.0-mvp` release; freeze feature scope for pilot demos
- [ ] Short pilot FAQ + “not a medical device” footer on auth & settings

**Exit:** One-click guest walkthrough that never blocks on wallet or payment.

---

## Phase 1 — Foundation hardening *(4–6 weeks)*

**Goal:** Real accounts, real persistence, safe billing path.

### Product
- Durable user profile, check-in history, and Astra state per account
- Replace in-memory commerce with Postgres (schema already sketched in
  `src/db/schema.sql`)
- Stripe (or Paystack / Flutterwave for regional cards) for:
  - 7-day trial → monthly
  - annual
  - lifetime
  - corporate seat packs
- Email receipts + plan status in Settings
- Offline-tolerant quick log with sync queue

### Engineering
- Wire `commerceStore` to Postgres / managed SQL
- Session & subscription webhooks
- Environment-based feature flags (guest demo vs paid)
- Error monitoring (Sentry) + basic product analytics (funnel events already stubbed)

### Trust
- Expand privacy copy (data retention, delete account)
- Soften / legal-review all outcome claims on Proof & landing

**Exit:** Paying tester can complete trial → paid → cancel without data loss.

---

## Phase 2 — Habit core & Astra depth *(6–8 weeks)*

**Goal:** The daily 5-minute loop feels complete without the rewards layer.

### Product
- Full session library by mood + language (Kiswahili, Luo, Kikuyu, Yoruba,
  Hausa, English — expand scripts beyond prompts)
- Guided audio / timer mode for micro-sessions
- Streak repair & gentle reminders (push / email / WhatsApp optional)
- Personal impact dashboard from **user** check-ins (not only seeded proof)
- Export CSV / PDF of self-reported logs
- Onboarding that ends on Companion (no blocking modal on every guest entry)

### Astra
- Memory of recent mood / anxiety (privacy-scoped)
- Crisis redirect: clear “not a clinician” + local helpline resources
- Faster coach responses with caching & streaming

**Exit:** 7-day retention cohort can complete sessions without touching Rewards.

---

## Phase 3 — Real health data *(6–8 weeks)*

**Goal:** Replace mock Apple Health / Google Fit / Fitbit / Garmin sync.

### Integrations
- Apple HealthKit (iOS / PWA constraints documented)
- Google Fit / Health Connect (Android)
- Optional Fitbit & Garmin OAuth
- Map steps, sleep, heart rate → check-in fields; hydration stays **L / glasses**

### Health Pass
- Verifiable check-in summary (QR or signed payload) for clinics / employers
- User-controlled share (opt-in only)

### Compliance
- Data processing agreements; region-aware storage if required
- Clear “wellness data ≠ diagnosis” UX on sync screens

**Exit:** A real wearable sync populates sleep & activity without mock buttons.

---

## Phase 4 — Rewards that redeem *(8–10 weeks)*

**Goal:** Cowries become redeemable value without crypto-first UX.

### Product
- Partner catalogue: clinic vouchers, mobile data, gym / wellness perks
- Redemption codes + wallet of claimed benefits
- Admin console for sponsors (already gated) → live pool funding & claims
- Separate **Rewards** IA from Companion (already started; keep marketing calm)

### Chain / backend
- Custodial or backend issuer service for `earnPoints` / `awardBadge` /
  voucher mint (issuer-gated contracts)
- Optional user wallet for advanced users; default path needs **no MetaMask**
- Move from Fuji → Avalanche C-Chain mainnet when partner volume justifies gas
- Audit + monitoring for LoyaltyPoints / StreakTracker / IncentiveToken

**Exit:** Pilot partner issues 100 real voucher codes through the admin console.

---

## Phase 5 — Corporate wellness *(6–8 weeks)*

**Goal:** B2B is a real SKU, not a form sink.

### Product
- Org accounts, seats, SSO (Google Workspace / Microsoft)
- Team admin: invites, anonymized adherence heatmaps, export
- Cultural session packs for workplaces
- Invoice + seat lifecycle (add / remove / transfer)

### Sales tooling
- Self-serve Team / Org / Enterprise tiers (prices in `valueProps`)
- Pilot playbook for 25–100 seat deployments

**Exit:** One paying org runs a 30-day pilot with anonymized impact report.

---

## Phase 6 — Mobile & distribution *(6–10 weeks, parallelizable)*

**Goal:** Meet users where they are.

- Installable PWA (offline shell, home-screen icon)
- React Native or Capacitor wrappers for App Store / Play Store if PWA limits
  HealthKit / notifications
- WhatsApp or SMS check-in nudges for low-smartphone-bandwidth contexts
- App Store privacy labels & store screenshots (reuse `docs/readme/screenshots`)

**Exit:** Companion + Check-In usable as an installed mobile client.

---

## Phase 7 — Full build completion *(ongoing → v1.0)*

**Goal:** Production-complete Aura Health.

### Product completeness checklist
- [ ] Durable auth, billing, and data deletion
- [ ] Real wearables + Health Pass sharing
- [ ] Redeemable partner rewards with ops tooling
- [ ] Corporate seats + anonymized reporting
- [ ] Mobile install path
- [ ] Mainnet (or deliberate decision to stay off-chain for rewards)
- [ ] Localization pack v1 (UI strings + session scripts)
- [ ] Accessibility pass (WCAG AA on core flows)
- [ ] Performance budget (LCP / interaction) on landing + Companion
- [ ] Security review (auth, admin, webhooks, wallet signer)
- [ ] Legal pack: ToS, Privacy, wellness disclaimers, partner DPAs

### v1.0 definition of done
1. A new user can sign up, finish onboarding, complete a 5-minute session,
   log hydration in **litres / glasses**, and see a personal 14-day trend.
2. A premium user can pay, cancel, and retain history.
3. A rewards user can redeem a real partner perk without installing a wallet.
4. A company admin can invite seats and download an anonymized monthly report.
5. Ops can rotate keys, pause redemptions, and support a user data-deletion request.

**Exit:** Tag `v1.0.0` and treat further work as roadmap v2 (clinical studies,
insurance partners, multi-country billing, Astra voice mode, etc.).

---

## Suggested timeline (indicative)

```text
2026 Q3          MVP freeze + Phase 1 (persistence & billing)
2026 Q4          Phase 2 (habit / Astra) + start Phase 3 (wearables)
2027 Q1          Phase 3 complete + Phase 4 (redeemable rewards)
2027 Q2          Phase 5 (corporate) + Phase 6 (mobile)
2027 Q3          Phase 7 hardening → v1.0.0 full build
```

Dates flex with pilot partners and payment-provider approval.

---

## Principles (do not break while building)

1. **Wellness first, Web3 optional** — Companion never requires a wallet.
2. **No clinical overclaim** — self-reported trends ≠ medical outcomes.
3. **Metric honesty** — hydration in **litres / glasses**, not ounces.
4. **Calm brand** — forest glass, teal primary; rewards stay in their own band.
5. **Africa-first languages & partners** — sessions and perks stay culturally
   grounded.
6. **Privacy by design** — share Health Pass and employer reports only with
   explicit opt-in.

---

## Open decisions

| Topic | Options | Needed by |
|---|---|---|
| Regional payments | Stripe vs Paystack / Flutterwave | Phase 1 |
| Mobile strategy | PWA-only vs native wrapper | Phase 6 |
| Rewards chain | Stay Fuji / go mainnet / off-chain ledger | Phase 4 |
| Data residency | Single region vs multi-region | Phase 3 |
| Clinical partners | Research MoU vs none for v1 | Phase 7 |

---

## How to use this doc

- Ship work against the **current phase** checklist; avoid jumping to Phase 4+
  UX before Phase 1 persistence.
- When a phase exits, move its leftover items explicitly into the next phase
  or into **Open decisions**.
- Keep README screenshots (`docs/readme/`) updated at each major phase exit:

```bash
python scripts/capture_readme_screenshots.py
```
