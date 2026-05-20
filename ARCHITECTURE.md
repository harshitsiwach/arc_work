# Arc Work — AI Agent Project Overview

> **Purpose:** This file is the single entry-point for any AI agent to understand the
> full project in one read, without scanning the directory tree repeatedly.  
> Read this file first, then jump directly to the relevant section and file paths.

---

## 1 · What Is This Project?

**Arc Work** is a decentralized freelance marketplace on the **Arc blockchain** (Ethereum
L2 for consumer apps, built by Circle). It escrows USDC payments via Circle's **EIP-712
Refund Protocol smart contract**, and uses **OpenAI** (vision models) to auto-validate
work deliverables before release.

The app has two surfaces:
| Surface | Description |
|---|---|
| Freelance marketplace | Post gigs, see them in a marketplace, create escrow agreements, claim or release funds |
| Bridge & Swap UI | Bridge USDC from Sepolia → Arc via CCTP; swap USDC ↔ EURC natively on Arc |

Both humans and AI agents can interact—the `/api/agents` route registers ERC-8004
on-chain identities so autonomous agents can participate as workers.

---

## 2 · Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 15** (App Router, React Server Components) |
| Language | **TypeScript** |
| Database | **Supabase** (PostgreSQL, Auth, Realtime, Storage) |
| Blockchain | **Arc Testnet** (L2, `chain-id: 5042002`) |
| Wallet SDK | **@reown/appkit** + **wagmi** + **viem** |
| Circle SDKs | `@circle-fin/app-kit`, `@circle-fin/developer-controlled-wallets`,
`@circle-fin/smart-contract-platform`, `@circle-fin/adapter-viem-v2` |
| AI / Validation | **OpenAI API** (GPT-4o vision for document validation) |
| Smart contract | EIP-712 Refund Protocol, **Solidity**, ABI in `lib/constants.ts` |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Dev infra | Docker / Supabase CLI, ngrok, pnpm workspaces (editor sub-package) |
| Styling | Tailwind CSS 4, shadcn/ui (Radix primitives), next-themes |
| Misc | React Query, Sonner toasts, Lucide icons |

---

## 3 · Directory Tree (at a glance)

```
arc_work/                          ← repo root (this README.md has plain English docs)
├── app/
│   ├── layout.tsx                  Root layout: providers (AppKit, Wallet, Supabase, Theme)
│   ├── page.tsx                    Landing page — "Get Started" → /dashboard
│   ├── globals.css                 Global styles + CSS custom properties (Arc Work dark theme)
│   ├── middleware.ts               Auth guard: all /dashboard/* routes require login
│   ├── actions/                    Server Action helpers (agreement service, structuredClues)
│   │   └── index.ts
│   ├── hooks/                      React client hooks
│   │   ├── useWalletBalance.ts
│   │   ├── useEscrowAgreements.ts
│   │   ├── useContractUpload.ts
│   │   └── useSmartContract.ts
│   ├── services/                   Server-side business-logic modules
│   │   ├── agreement.service.ts    CRUD + AI validation lifecycle for escrow agreements
│   │   ├── escrow.service.ts       Escrow agreement queries (supabase joins)
│   │   └── file.service.ts         PDF/DOCX upload + text extraction via pdf-parse / mammoth
│   ├── (auth-pages)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                Main dashboard (agreements list)
│   │   ├── agents/                 AI agent identity page
│   │   ├── bridge/                 CCTP bridge page
│   │   ├── clipper/                Video fragmenter
│   │   ├── marketplace/            Browse gigs
│   │   ├── products/               Products / purchase pages
│   │   ├── profile/                Profile edit
│   │   ├── reset-password/         Password reset flow
│   │   ├── transaction/            Transaction history
│   │   └── verify/                 Identity/badge verification
│   ├── creator/[id]/page.tsx       Creator profile page (ID in slug)
│   ├── api/                        ← Next.js Route Handlers (all server-side)
│   │   ├── agents/route.ts         POST → register an AI agent (ERC-8004 model)
│   │   ├── agents/profile/         PUT → update agent profile
│   │   ├── contract/…              Smart-contract lifecycle (create/deposit/refund/validate)
│   │   ├── gigs/route.ts           POST → create a gig post
│   │   ├── products/…              Product CRUD + purchase flow
│   │   ├── profile/edit/…          PUT → update user profile
│   │   ├── smart-wallet/route.ts   POST → create/manage modular smart wallet
│   │   ├── swap/route.ts           POST → fetch Circle swap quote/tx (server-side, no CORS)
│   │   ├── usdc/…                  USDC buy/sell via partner ramp
│   │   ├── verify/connect/route.ts POST → initiate identity verification
│   │   ├── wallet/route.ts         POST → create Circle developer-controlled wallet
│   │   ├── wallet/balance/…        GET wallet balance; request USDC drip
│   │   ├── wallet/transactions/…   GET / POST tx history
│   │   ├── wallet-set/route.ts     PUT → update wallet association
│   │   ├── circle-proxy/...route   Catch-all: proxy Circle API through our server
│   │   └── webhooks/circle/…       POST Circle webhook (Tx status, wallet events)
│   └── auth/…                      Auth callback + error pages
│
├── components/
│   ├── *-button.tsx, *-dialog.tsx, *-table.tsx  Functional UI components
│   ├── hero.tsx, header-auth.tsx, theme-switcher.tsx  Core layout pieces
│   ├── env-var-warning.tsx         Checks env vars, blocks unconfigured sessions
│   └── ui/                         shadcn/ui primitives (button, card, dialog, tabs, …)
│
├── lib/
│   ├── constants.ts                SYSTEM_AGENT_ADDRESS, REFUND_PROTOCOL_ABI, ABI_JSON, bytecode
│   ├── utils/
│   │   ├── cn.ts                   cn() — clsx + tailwind-merge (className joiner)
│   │   ├── amount.ts               USDC amount formatter / parser
│   │   ├── escrow.ts               Status color helpers, formatAmount
│   │   ├── sleep.ts                Delay helper
│   │   ├── assistant-config.ts     Config passed to OpenAI calls
│   │   ├── openAIClient.ts         Shared OpenAI client instance
│   │   ├── openai-error-handler.ts
│   │   ├── executeContract.ts      Driver for calling smart contracts (Circle SDK + viem)
│   │   ├── developer-controlled-wallets-client.ts  Thin wrapper over Circle DCW API
│   │   ├── smart-contract-platform-client.ts       Thin wrapper over Circle Smart Contract Platform API
│   │   ├── create-circle-ramp-session.ts           USDC on-ramp session creation
│   │   ├── utils.ts                General util helpers
│   │   └── supabase/               Supabase helpers (client/server SSR, middleware, env checks)
│   └── web3/
│       ├── appkit-provider.tsx     Reown AppKit + Arc Testnet chain config + wagmi config
│       └── wallet-provider.tsx     Wallet state context: connect, send, approve, swap, bridge
│
├── types/
│   ├── database.types.ts           Full Supabase generated types (the 4 public tables)
│   ├── escrow.ts                   EscrowAgreementWithDetails, AgreementStatus enum
│   └── agreements.ts               Agreement-related client types
│
├── contracts/                      Solidity contracts source / deployment artifacts
├── editor/                         Video editor sub-package (pnpm workspace)
├── public/                         Static assets (screenshots, icons)
├── .agents/skills/                 Promoted AI skills (appkit, impeccable, oauth, supabase-best-practices)
├── .env.example                    Reference env-var template (never commit .env.local)
├── .env.local                      ACTUAL env vars — never commit
├── next.config.js                  Next.js config (Circle API rewrite, SSR externals)
├── tsconfig.json                   TypeScript config
├── tailwind.config.ts              Tailwind CSS 4 config
├── package.json                    Dependencies + scripts
├── generate-wallet.mjs             CLI script: `npm run generate-wallet` → Circle DCW wallet init
├── DESIGN.md                       Design system docs
├── PRODUCT.md                      Product / feature specifications
├── SECURITY.md                     Security considerations
├── README.md                       User-facing setup + usage guide
├── llms.txt                        Short LLM-friendly link/summary page
└── supabase.bak                    Supabase backup dump
```

---

## 4 · Supabase Data Model

All tables live in the `public` schema (`types/database.types.ts` contains the types).

```sql
profile          auth_user_id TEXT PK   → Supabase Auth user
                 name TEXT
                 created_at TIMESTAMPTZ

wallet           id UUID PK             → Circle developer-controlled wallet entry
                 profile_id FK → profile
                 wallet_address TEXT
                 circle_wallet_id TEXT
                 balance TEXT
                 blockchain TEXT
                 created_at TIMESTAMPTZ

transaction      id UUID PK
                 wallet_id FK → wallet
                 profile_id FK → profile
                 circle_transaction_id TEXT
                 transaction_type TEXT        -- e.g. 'escrow_deposit', 'escrow_release', …
                 amount NUMERIC
                 currency TEXT
                 status TEXT                  -- pending / completed / failed
                 description TEXT
                 created_at TIMESTAMPTZ

escrow_agreement id UUID PK
                 beneficiary_wallet_id FK → wallet   -- freelancer / worker
                 depositor_wallet_id FK    → wallet   -- client / poster
                 transaction_id FK → transaction    -- the deposit tx
                 circle_contract_id TEXT             -- the deployed Refund Protocol contract
                 status TEXT  -- PENDING | OPEN | LOCKED | CLOSED
                 terms JSONB                          -- amounts[], tasks[], documentUrl, …
                 created_at, updated_at TIMESTAMPTZ
```

### Agreement status flow

```
PENDING  →  OPEN     (client deposits USDC into the Refund Protocol contract)
OPEN     →  LOCKED   (worker submits deliverable + AI validates)
OPEN     →  CLOSED   (worker claimed funds without valid deliverable? or manual close)
```

---

## 5 · Smart Contract — EIP-712 Refund Protocol

The contract is built from `REFUND_PROTOCOL_BYTECODE` + `REFUND_PROTOCOL_ABI_JSON`,
both defined in **`lib/constants.ts`** (a large embedded blob — never paste inline).

**Key contract concepts:**

| Role | Address |
|---|---|
| Arbiter (agent wallet) | `0x3d7ffed295e555052233544ba74eaa1c0920fa20` (hard-coded in `lib/constants.ts`) |
| USDC faucet / token address | `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` env var |
| Circle blockchain | `CIRCLE_BLOCKCHAIN` env var (e.g. `ARC-TESTNET`) |

**Key contract functions**
- `pay(to, amount, refundTo)` → deposits USDC into the contract for `to` address
- `withdraw(paymentIDs[])` → beneficiary withdraws after lock expires
- `withdrawArbiterFunds(amount)` → arbiter (agent) withdraws its share
- `refundByArbiter(paymentID)` / `refundByRecipient(paymentID)` → refund flow
- `earlyWithdrawByArbiter(…)` → early arbiter withdrawal with off-chain signature
- `settleDebt(recipient)` → pay outstanding debts

**Contract lifecycle route files**
| File | What it does |
|---|---|
| `app/api/contracts/escrow/route.ts` | `POST /api/contracts/escrow` — deploy contract, create agreement |
| `app/api/contracts/escrow/deposit/route.ts` | `POST` — deposit USDC into deployed contract |
| `app/api/contracts/escrow/deposit/approve/route.ts` | `POST` — USDC approve before deposit |
| `app/api/contracts/escrow/refund/route.ts` | `POST` — trigger refund via contract |
| `app/api/contracts/analyze/route.ts` | `POST` — analyse a document via OpenAI (no contract call) |
| `app/api/contracts/validate-work/route.ts` | `POST` — mark deliverable as validated; call contract to release funds |

**Smart contract helpers (lib)**
| File | Role |
|---|---|
| `lib/utils/executeContract.ts` | Generic contract call driver (viem + Circle SDK) |
| `lib/utils/developer-controlled-wallets-client.ts` | Thin Circle DCW REST wrapper |
| `lib/utils/smart-contract-platform-client.ts` | Thin Circle SCP REST wrapper |

---

## 6 · Auth & Middleware

- **`middleware.ts`**: Requests to `/dashboard/*` are redirected to `/` if no Supabase session
  cookie exists. Index route `/` is public. Matcher pattern: `["/", "/dashboard/:path"]`.
- Auth providers hosted in `app/auth/`: sign-in, sign-up, callback, error, forgot-password.
- Google OAuth: Google Client ID/Secret required in env vars.

---

## 7 · Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_VERCEL_URL` | public | Base URL (default `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon/public key |
| `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` | public | USDC token address on Arc Testnet |
| `NEXT_PUBLIC_AGENT_WALLET_ID` | public | Circle agent wallet ID — auto-generated by `npm run generate-wallet` |
| `NEXT_PUBLIC_AGENT_WALLET_ADDRESS` | public | Circle agent wallet address — auto-generated |
| `CIRCLE_API_KEY` | server | Circle REST API key |
| `CIRCLE_ENTITY_SECRET` | server | Circle entity secret for transaction signing |
| `CIRCLE_BLOCKCHAIN` | server | Blockchain code, e.g. `ARC-TESTNET` |
| `OPENAI_API_KEY` | server | OpenAI API key (GPT-4o vision for validation) |
| `GOOGLE_CLIENT_ID` | server | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | server | Google OAuth |
| `NEXT_PUBLIC_CIRCLE_KIT_KEY` | public | Circle Kit Key for swap/bridge. Format: `KIT_KEY:<id>:<secret>` |

---

## 8 · Key Routes & API Endpoints Reference

### Dash / Frontend Routes
```
/                    Landing page
/dashboard           Agreements dashboard (requires auth)
/dashboard/agents    AI agent identity page
/dashboard/bridge    CCTP bridge UI (USDC Sepolia → Arc)
/dashboard/marketplace  Browse gigs
/dashboard/products  Products & purchases
/dashboard/profile   Profile edit
/dashboard/verify    Identity/badge verification
/creator/[id]        Creator profile
```

### Server API Endpoints (least-comprehensive route counts proxy through Circle)
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/contracts/escrow` | Deploy Refund Protocol + create DB agreement |
| POST | `/api/contracts/escrow/deposit/approve` | USDC approve before deposit |
| POST | `/api/contracts/escrow/deposit` | Deposit USDC into contract |
| POST | `/api/contracts/escrow/refund` | Trigger refund |
| POST | `/api/contracts/analyze` | OpenAI document analysis |
| POST | `/api/contracts/validate-work` | Validate deliverable, release funds |
| POST | `/api/agents` | Register AI agent (ERC-8004) |
| PUT | `/api/agents/profile` | Update agent profile |
| POST | `/api/gigs` | Create a gig |
| POST | `/api/products` | Create a product |
| POST | `/api/products/purchase` | Purchase a product |
| PUT | `/api/profile/edit` | Update user profile |
| POST | `/api/smart-wallet` | Create / update modular wallet |
| POST | `/api/swap` | Fetch Circle swap quote (proxy, no CORS) |
| POST | `/api/usdc/buy` | USDC on-ramp session |
| POST | `/api/usdc/sell` | USDC off-ramp session |
| POST | `/api/verify/connect` | Start identity verification |
| POST | `/api/wallet` | Create Circle developer-controlled wallet |
| POST | `/api/wallet/balance` | Get wallet balance |
| POST | `/api/wallet/balance/request` | Request faucet drip |
| POST | `/api/wallet/transactions` | List txns |
| GET | `/api/wallet/transactions/[id]` | tx detail |
| PUT | `/api/wallet-set` | Update wallet association |
| GET | `/api/circle-proxy/[...path]` | Generic Circle API proxy |
| POST | `/api/webhooks/circle` | Circle webhook handler (sig verified) |

---

## 9 · Arc Testnet Chain Config

From `lib/web3/appkit-provider.tsx`:

| Field | Value |
|---|---|
| Chain name | `Arc Testnet` |
| Chain ID | `5042002` |
| RPC URL | `https://rpc.testnet.arc.network` |
| Native symbol | `ARC` |
| USDC address | `0x3600000000000000000000000000000000000000` |
| EURC address | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| Block explorer | `https://testnet.arcscan.app` |

CCTP source chains supported for bridge:
- Ethereum Sepolia (11155111)
- Base Sepolia (84532)
- Arbitrum Sepolia (421614)

---

## 10 · File-by-File Quick-Index (for Agents That Know Where to Look)

### What to edit when…

| Doing this… | Open this file… |
|---|---|
| Add a new dashboard page | `app/dashboard/<slug>/page.tsx` |
| Add a new API endpoint | `app/api/<domain>/route.ts` (create folder + `route.ts`) |
| Change Supabase schema | `types/database.types.ts` then run `supabase db push` |
| Add a new DB column to a table | `types/database.types.ts` → update the Row/Insert/Update types |
| Fix smart contract ABI | `lib/constants.ts` → update `REFUND_PROTOCOL_ABI_JSON` |
| Change env check / add new env var | `lib/utils/supabase/check-env-vars.ts` + `.env.example` |
| Fix auth / middleware redirect | `middleware.ts` |
| Tweak chain / wallet config | `lib/web3/appkit-provider.tsx`, `lib/web3/wallet-provider.tsx` |
| Add OpenAI prompt / validation model | `lib/utils/assistant-config.ts`, `lib/utils/executeContract.ts` |
| Tweak file upload (PDF/DOCX) | `app/services/file.service.ts` + `lib/constants.ts` (size limits) |
| Add shadcn/ui component | `components/ui/<name>.tsx` |
| Add a new Supabase table query | `app/services/*.ts` or `lib/utils/supabase/<file>.ts` |

---

## 11 · File Sizes (important files only)

| File | Lines | Approx bytes |
|---|---|---|
| `lib/constants.ts` | ~200 | ~42k  (large: contains ABI JSON + bytecode) |
| `app/api/webhooks/circle/route.ts` | ~259 | ~8k  |
| `app/api/contracts/validate-work/route.ts` | ~319 | ~11k  |
| `app/api/contracts/escrow/deposit/route.ts` | ~175 | ~6k  |
| `app/api/contracts/escrow/deposit/approve/route.ts` | ~164 | ~6k  |
| `app/api/contracts/escrow/refund/route.ts` | ~165 | ~6k  |
| `app/api/contracts/escrow/route.ts` | ~223 | ~7k  |
| `lib/web3/wallet-provider.tsx` | ~162 | ~6k  |
| `app/api/agents/profile/route.ts` | ~67 | ~2k  |
| `lib/web3/appkit-provider.tsx` | ~78 | ~3k  |

---

## 12 · Conventions & Patterns (Agents Must Respect)

1. **Server Components by default** — all `app/` pages and route handlers are RSC / server-side.
   Import client components (`"use client"`) only in `components/` files.

2. **No secrets client-side** — Circle API keys, OpenAI key, Google secrets are server-only.
   The `app/api/*` route handlers are the only allowed surface for those credentials.

3. **Supabase SSR pattern** — use `lib/utils/supabase/server-client.ts` for server-side supabase
   client; `lib/utils/supabase/browser-client.ts` for client-side.

4. **Big blobs in lib/constants.ts** — the refund protocol ABI/bytecode go here and are
   imported by `executeContract.ts`. Do not inline them elsewhere.

5. **Swagger / OpenAPI** — no formal OpenAPI spec exists; API contracts are implicit in the
   handler files. Read the handler before extending.

6. **Branch naming** — not formally documented; follow `feat/<slug>` if branching new work.

7. **.env.local is real, .env.example is template** — copy `.env.example` → `.env.local` and
   fill keys before running locally.

8. **Wallet generation** — `npm run generate-wallet` writes `NEXT_PUBLIC_AGENT_WALLET_ID`,
   `NEXT_PUBLIC_AGENT_WALLET_ADDRESS`, and `CIRCLE_BLOCKCHAIN` into `.env.local`.

---

## 13 · Scripts & Commands

```bash
npm run dev              # Next.js dev server at http://localhost:3000
npm run build            # Production build
npm run dev:editor        # Launch video editor sub-package
npm run dev:all           # Both dev servers concurrently
npm run generate-wallet   # Create Circle DCW agent wallet (writes to .env.local)
npx supabase start        # Start local Supabase (Docker)
npx supabase migration up # Apply DB migrations
npx supabase db push      # Push migrations to remote project
```

---

## 14 · Self-Check Before Landing Changes

When you modify ("patch") this `ARCHITECTURE.md` or any file:

- [ ] Does the new route/page/layer appear in this file's tree?
- [ ] Are env-var changes reflected in §7?
- [ ] Are new Supabase tables/columns reflected in §4?
- [ ] Are new API endpoints listed in §8?

Keep this file accurate — it prevents another agent (or yourself) from scanning the tree again.
