# Arc Work — AI Agent Project Overview

> **Purpose:** Single entry-point for any AI agent to understand the full project in one read,
> without scanning the directory tree repeatedly. Read this file first, then jump directly to
> the relevant section and file paths.

---

## 1 · What Is This Project?

**Arc Work** is a decentralized creator and AI-worker marketplace on the **Arc blockchain**
(Circle's Ethereum L2 for consumer apps). Creators sell products, AI agents complete gigs, and
USDC settles instantly — all backed by escrow and AI-validated deliverables.

The app has grown into two major surfaces:

| Surface | Description |
|---|---|
| **Creator Marketplace** | Post products and gigs; browse and purchase; AI agents auto-complete work |
| **AI Agent Platform** | Multi-step agent creation wizard, agent profile management, marketplace listing |
| **Bridge & Swap** | CCTP bridge from Sepolia → Arc; native USDC ↔ EURC swap on Arc |

**Tagline:** *The operating system for internet creators and AI workers*

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
| Animation | **framer-motion** (landing page, hero visual, agent/product cards) |
| Misc | React Query, Sonner toasts, Lucide icons |

---

## 3 · Directory Tree

```
arc_work/                          ← repo root
├── app/
│   ├── layout.tsx                  Root layout: NavBar, provider stack, env-check gate
│   ├── page.tsx                    Thin wrapper → <LandingPage />
│   ├── globals.css                 Full design system: OKLCH tokens, animations, tokens
│   ├── middleware.ts               Auth guard: /dashboard/* requires login
│   ├── actions/                    Server Actions (signUpAction, signInAction, signOutAction)
│   │   └── index.ts              226 lines
│   ├── hooks/                      React client hooks
│   │   ├── useWalletBalance.ts    Balance polling + Realtime subscription
│   │   ├── useEscrowAgreements.ts
│   │   ├── useContractUpload.ts
│   │   └── useSmartContract.ts
│   ├── services/                   Server-side business-logic modules
│   │   ├── agreement.service.ts   CRUD + AI validation lifecycle
│   │   ├── escrow.service.ts      Escrow agreement queries
│   │   └── file.service.ts        PDF/DOCX upload + text extraction
│   ├── (auth-pages)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── auth/
│   │   └── callback/route.ts      OAuth callback → auto-creates Circle wallet
│   ├── dashboard/
│   │   ├── page.tsx               Main dashboard: stats + wallet + quick actions
│   │   │                           + recent products + AI agents + agreements + txns
│   │   ├── agents/                AI agent management
│   │   │   ├── page.tsx            Agent list, toggle status, delete, re-register
│   │   │   └── create/page.tsx     Multi-step agent creation wizard (5 steps)
│   │   ├── bridge/                 CCTP bridge UI
│   │   ├── clipper/                Video fragmenter
│   │   ├── marketplace/            Browse gigs / products
│   │   ├── products/
│   │   │   ├── page.tsx            Product marketplace with search + type filter
│   │   │   └── create/
│   │   │       ├── page.tsx        6-product-type form with live preview
│   │   │       └── product-preview.tsx  Live marketplace card preview
│   │   ├── profile/               Profile edit
│   │   ├── reset-password/
│   │   ├── transaction/
│   │   └── verify/                Identity / badge verification
│   ├── creator/[id]/page.tsx       Creator profile
│   └── api/                        ← Next.js Route Handlers (all server-side)
│       ├── agents/route.ts         POST → register an AI agent (ERC-8004 model)
│       ├── agents/profile/route.ts PATCH → update agent (PATCH not POST)
│       ├── gigs/route.ts           POST → create a gig post
│       ├── products/route.ts       POST → create a product listing
│       ├── products/purchase/route.ts POST → purchase a product
│       ├── profile/edit/route.ts   PUT → upsert creator profile
│       ├── contract/…              (same as before — see §5)
│       ├── smart-wallet/route.ts   POST → create/modular wallet
│       ├── swap/route.ts           POST → Circle swap quote (CORS proxy)
│       ├── usdc/…                  USDC buy/sell
│       ├── verify/connect/route.ts POST → social account OAuth (mock data for most platforms)
│       ├── wallet/route.ts         POST → Circle developer-controlled wallet
│       ├── wallet/…                balance + tx history + faucet request
│       ├── wallet-set/route.ts     PUT → update wallet association
│       ├── circle-proxy/...        Generic Circle proxy
│       └── webhooks/circle/…       POST Circle webhook (sig verified)
│
├── components/
│   ├── nav-bar.tsx                NavBar component (mobile drawer, scroll effects, 217 lines)
│   ├── landing-page.tsx           LandingPage component (551 lines — full marketing page)
│   ├── hero-visual.tsx            HeroVisual component (393 lines — animated marketplace mock)
│   ├── activity-ticker.tsx        Horizontal ticker with rAF animation (77 lines)
│   ├── user-menu.tsx              Dropdown avatar menu with sign-out (86 lines)
│   ├── wallet-connect-button.tsx  Connect/disconnect dropdown + Smart Wallet button (130 lines)
│   ├── wallet-balance.tsx         Realtime USDC balance display (33 lines)
│   ├── wallet-information-dialog.tsx  Dialog with wallet ID / address / blockchain copy (81 lines)
│   ├── env-var-warning.tsx        Shows env var warning banner
│   ├── header-auth.tsx            Auth header
│   ├── theme-switcher.tsx         Dark/light/system toggle
│   ├── escrow-agreements.tsx
│   ├── escrow-agreements-item.tsx
│   ├── smart-wallet.tsx
│   ├── usdc-button.tsx
│   ├── request-usdc-button.tsx
│   ├── agreements-table.tsx
│   ├── agreement-details-dialog.tsx
│   ├── agreement-delete-dialog.tsx
│   ├── copy-button.tsx
│   ├── deploy-smart-contract-button.tsx
│   ├── upload-contract-button.tsx
│   ├── validation-succeeded-dialog.tsx
│   ├── validation-failed-dialog.tsx
│   ├── form-message.tsx
│   ├── google-login-button.tsx
│   ├── submit-button.tsx
│   ├── verified-badges.tsx
│   ├── hero.tsx                   (older — superseded by LandingPage)
│   ├── transactions.tsx
│   └── ui/                        shadcn/ui primitives
│
├── lib/
│   ├── constants.ts               SYSTEM_AGENT_ADDRESS, REFUND_PROTOCOL_ABI + bytecode (~42 KB)
│   ├── utils/
│   │   ├── cn.ts                  cn() — clsx + tailwind-merge
│   │   ├── amount.ts              USDC amount formatter
│   │   ├── escrow.ts              Status colors, formatAmount
│   │   ├── sleep.ts               Delay helper
│   │   ├── assistant-config.ts    OpenAI call config
│   │   ├── openAIClient.ts        Shared OpenAI client
│   │   ├── openai-error-handler.ts
│   │   ├── executeContract.ts     Generic contract-call driver
│   │   ├── developer-controlled-wallets-client.ts   Circle DCW REST wrapper
│   │   ├── smart-contract-platform-client.ts        Circle SCP REST wrapper
│   │   ├── create-circle-ramp-session.ts            USDC on-ramp session
│   │   ├── utils.ts               General helpers
│   │   └── supabase/              Supabase client factories + env checks
│   └── web3/
│       ├── appkit-provider.tsx    Reown AppKit + Arc Testnet chain config
│       └── wallet-provider.tsx    Wallet state: connect, approve, swap, bridge, disconnect
│
├── types/
│   ├── database.types.ts          Generated Supabase types (may be stale — see §4)
│   ├── escrow.ts                  EscrowAgreementWithDetails + AgreementStatus
│   └── agreements.ts
│
├── contracts/                     Solidity source / deployment artifacts
├── editor/                        Video editor sub-package (pnpm workspace)
├── public/                        Static assets
├── .agents/skills/                Skills (appkit, oauth, supabase-best-practices, impeccable)
├── .env.example                   Env var template
├── .env.local                     ACTUAL env vars — DO NOT COMMIT
├── next.config.js                 Circle API rewrite + SSR externals + pdf-parse
├── tsconfig.json
├── tailwind.config.ts
├── package.json
├── DESIGN.md                      Design system docs
├── PRODUCT.md                      Product / feature design doc
├── SECURITY.md                     Security considerations
├── README.md                       User setup guide
├── llms.txt                       Short LLM-friendly link/summary page
├── ARCHITECTURE.md                ← THIS FILE
└── supabase.bak                    Supabase backup
```

---

## 4 · Supabase Data Model

> ⚠️ **`types/database.types.ts` may be out-of-date.** The following tables are used in code
> but are not present in the generated types file. Regenerate with `supabase gen types typescript`
> and replace `types/database.types.ts`.

### Tables in code (all confirmed)

```sql
-- 1. profiles  (generated types ✓)
profile          auth_user_id TEXT PK   → Supabase Auth user id
                 name TEXT
                 created_at TIMESTAMPTZ

-- 2. wallets  (generated types ✓)
wallet           id UUID PK
                 profile_id FK → profiles
                 wallet_address TEXT
                 circle_wallet_id TEXT
                 wallet_type TEXT           -- custody type (e.g. "DEVELOPER_CONTROLLED")
                 wallet_set_id TEXT         -- Circle Wallet Set ID
                 account_type TEXT          -- e.g. "WALLET"
                 blockchain TEXT
                 balance TEXT
                 currency TEXT              -- "USDC"
                 created_at TIMESTAMPTZ
                 NOTE: types/database.types.ts is MISSING wallet_type,
                       wallet_set_id, account_type, currency columns

-- 3. transactions  (generated types ✓)
transaction      id UUID PK
                 wallet_id FK → wallets
                 profile_id FK → profiles
                 circle_transaction_id TEXT
                 transaction_type TEXT
                 amount NUMERIC
                 currency TEXT
                 status TEXT
                 description TEXT
                 created_at TIMESTAMPTZ

-- 4. escrow_agreements  (generated types ✓)
escrow_agreement id UUID PK
                 beneficiary_wallet_id FK → wallets
                 depositor_wallet_id FK    → wallets
                 transaction_id FK → transactions
                 circle_contract_id TEXT
                 status TEXT  -- PENDING | OPEN | LOCKED | CLOSED
                 terms JSONB
                 created_at, updated_at TIMESTAMPTZ

-- 5. agent_profiles  (NOT in generated types — ⚠️)
agent_profiles   id UUID PK
                 profile_id FK → profiles
                 agent_name TEXT
                 agent_type TEXT              -- default "ai"
                 description TEXT | NULL
                 capabilities TEXT[]          -- e.g. ["Video Clipping","Thumbnail Generation"]
                 specializations TEXT[]
                 pricing_model TEXT           -- "fixed" | "per_clip" | "per_hour"
                 price_per_clip NUMERIC | NULL
                 price_per_hour  NUMERIC | NULL
                 max_queue INT
                 auto_accept BOOLEAN
                 welcome_message TEXT | NULL
                 avatar_url TEXT | NULL
                 llm_provider TEXT            -- "openai"
                 llm_model TEXT               -- "gpt-4o"
                 tools_enabled TEXT[]         -- e.g. ["OpenAI Vision","FFmpeg"]
                 availability_status TEXT     -- "online" | "offline"
                 reputation_score INT         -- default 0
                 total_jobs_completed INT     -- default 0
                 created_at TIMESTAMPTZ

-- 6. products  (NOT in generated types — ⚠️)
products         id UUID PK
                 creator_profile_id FK → profiles
                 title TEXT
                 description TEXT | NULL
                 price_amount NUMERIC
                 price_currency TEXT           -- "USDC"
                 product_type TEXT             -- "clip_pack"|"template"|"membership"|"automation"|"service"|"community"
                 delivery_type TEXT            -- "instant"|"escrow"
                 media_urls TEXT[] | NULL
                 file_url TEXT | NULL
                 access_url TEXT | NULL
                 tags TEXT[] | NULL
                 featured BOOLEAN
                 status TEXT                   -- "active"|…
                 created_at TIMESTAMPTZ

-- 7. product_purchases  (NOT in generated types — ⚠️)
product_purchases id UUID PK
                  product_id FK → products
                  buyer_profile_id FK → profiles
                  amount NUMERIC
                  currency TEXT
                  status TEXT                  -- "completed"|…
                  created_at TIMESTAMPTZ

-- 8. gigs  (NOT in generated types — ⚠️)
gigs             id UUID PK
                 creator_profile_id FK → profiles
                 title TEXT
                 description TEXT
                 category TEXT
                 price_amount NUMERIC
                 delivery_days INT | NULL
                 agent_only BOOLEAN
                 skills_required TEXT[] | NULL
                 status TEXT
                 created_at TIMESTAMPTZ

-- 9. creator_profiles  (NOT in generated types — ⚠️)
creator_profiles id UUID PK
                 profile_id FK → profiles
                 display_name TEXT
                 bio TEXT | NULL
                 avatar_url TEXT | NULL
                 website TEXT | NULL
                 created_at TIMESTAMPTZ

-- 10. creator_verifications  (NOT in generated types — ⚠️)
creator_verifications  id UUID PK
                        creator_profile_id FK → creator_profiles
                        platform TEXT            -- "tiktok"|"youtube"|"instagram"|"twitch"|"x"
                        platform_username TEXT
                        platform_user_id TEXT
                        followers INT
                        total_views INT
                        verified_at TIMESTAMPTZ
                        raw_response JSONB | NULL  -- mock data placeholder
```

### Agreement status flow

```
PENDING  →  OPEN     (client deposits USDC into the Refund Protocol contract)
OPEN     →  LOCKED   (worker submits deliverable + AI validates)
OPEN     →  CLOSED   (manual / unresolved)
```

---

## 5 · Smart Contract — EIP-712 Refund Protocol

The contract is built from `REFUND_PROTOCOL_BYTECODE` + `REFUND_PROTOCOL_ABI_JSON`,
both defined in **`lib/constants.ts`** (embedded blobs — never inline).

| Role | Address |
|---|---|
| Arbiter (agent wallet) | `0x3d7ffed295e555052233544ba74eaa1c0920fa20` |
| USDC address | `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` |
| EURC address | `NEXT_PUBLIC_EURC_CONTRACT_ADDRESS` |
| Circle blockchain | `CIRCLE_BLOCKCHAIN` (e.g. `ARC-TESTNET`) |

**Key contract functions** (`pay`, `withdraw`, `withdrawArbiterFunds`, `refundByArbiter`,
`refundByRecipient`, `earlyWithdrawByArbiter`, `settleDebt`, `depositArbiterFunds`)

**Contract route files**
| File | Purpose |
|---|---|
| `app/api/contracts/escrow/route.ts` | `POST /api/contracts/escrow` deploy + DB create |
| `app/api/contracts/escrow/deposit/approve/route.ts` | USDC approve before deposit |
| `app/api/contracts/escrow/deposit/route.ts` | Deposit USDC into contract |
| `app/api/contracts/escrow/refund/route.ts` | Trigger refund via contract |
| `app/api/contracts/analyze/route.ts` | OpenAI document analysis (no contract) |
| `app/api/contracts/validate-work/route.ts` | Validate + release funds (largest handler: ~320 lines) |

**Contract helper modules (lib)**
| File | Role |
|---|---|
| `lib/utils/executeContract.ts` | Generic contract call driver (viem + Circle SDK) |
| `lib/utils/developer-controlled-wallets-client.ts` | Thin Circle DCW REST wrapper |
| `lib/utils/smart-contract-platform-client.ts` | Thin Circle SCP REST wrapper |

---

## 6 · Auth & Middleware

- **`middleware.ts`** (`app/middleware.ts`): Matches `["/", "/dashboard/:path"]`
  — redirects unauthenticated visitors from `/dashboard/*` to `/`.
- **Auth pages**: `app/auth/callback/route.ts`, `app/(auth-pages)/sign-in/page.tsx`,
  `sign-up/page.tsx`, `forgot-password/page.tsx`.
- **`app/actions/index.ts`**: Server Actions — `signUpAction`, `signInAction`, `signOutAction`.
- **OAuth callback** (`app/auth/callback/route.ts`): On email confirmation, automatically
  (a) finds or creates the `creator_profiles` row, (b) calls `PUT /api/wallet-set` to obtain
  a Circle Wallet Set, (c) calls `POST /api/wallet` to create the developer-controlled wallet,
  then (d) writes wallet info to the `wallets` table. **NOTE:** Line 98 has a typo
  `createdwallet?.blockchain` — should be `createdWallet?.blockchain`.
- **Google OAuth** via Supabase + Supabase SSR client.

---

## 7 · Environment Variables

Copy `.env.example` → `.env.local` before running.

### `.env.example` source of truth (current)

```bash
# Deployment
VERCEL_URL=                  # server-side (e.g. http://localhost:3000)
NEXT_PUBLIC_VERCEL_URL=      # public mirror

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sbetkvtdazoxyddexnnm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_kYAWoKAxbL4ohnHQTqyDmw_Un5H8M68
# NOTE: Both NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY
# appear to be accepted (publishable is the new name in Supabase CLI v2+)

# Blockchain token addresses
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=
NEXT_PUBLIC_EURC_CONTRACT_ADDRESS=

# Agent wallet (auto-generated by npm run generate-wallet)
NEXT_PUBLIC_AGENT_WALLET_ID=
NEXT_PUBLIC_AGENT_WALLET_ADDRESS=

# Circle
CIRCLE_API_KEY=                     # server-side
CIRCLE_ENTITY_SECRET=               # server-side
CIRCLE_BLOCKCHAIN=                  # e.g. ARC-TESTNET

# OpenAI
OPENAI_API_KEY=                     # server-side

# Google OAuth
GOOGLE_CLIENT_ID=                   # server-side
GOOGLE_CLIENT_SECRET=               # server-side

# Circle App Kit (swap/bridge)
NEXT_PUBLIC_CIRCLE_KIT_KEY=KIT_KEY:<keyId>:<keySecret>
```

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_VERCEL_URL` | public | Base URL — dev: `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Supabase public/publishable key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Accepted alias for publishable key |
| `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` | public | USDC token on Arc Testnet |
| `NEXT_PUBLIC_EURC_CONTRACT_ADDRESS` | public | EURC token on Arc Testnet |
| `NEXT_PUBLIC_AGENT_WALLET_ID` | public | Circle DCW wallet ID (auto-generated) |
| `NEXT_PUBLIC_AGENT_WALLET_ADDRESS` | public | Circle DCW address (auto-generated) |
| `CIRCLE_API_KEY` | server | Circle REST API key |
| `CIRCLE_ENTITY_SECRET` | server | Circle entity secret |
| `CIRCLE_BLOCKCHAIN` | server | Blockchain code, e.g. `ARC-TESTNET` |
| `OPENAI_API_KEY` | server | OpenAI API key |
| `GOOGLE_CLIENT_ID` | server | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | server | Google OAuth |
| `NEXT_PUBLIC_CIRCLE_KIT_KEY` | public | Circle App Kit key for swap/bridge |

---

## 8 · Routes & API Endpoints Reference

### Frontend Routes

```
/                           Landing page (now <LandingPage /> — full marketing page)
/sign-in                    Email/password sign-in
/sign-up                    Sign-up with optional companyName + fullName
/forgot-password            Password reset
/auth/callback              OAuth redirect handler
/creator/[id]               Creator profile page

/dashboard                  Main dashboard (stats, wallet, products, agents, agreements)
/dashboard/agents           AI agent list + management
/dashboard/agents/create    Agent creation wizard (5-step form)
/dashboard/marketplace      Product/gig marketplace
/dashboard/products         Product catalog with search + type filter
/dashboard/products/create  Product creation form (6 types + live preview)
/dashboard/profile          Profile edit
/dashboard/bridge           CCTP bridge (USDC Sepolia → Arc)
/dashboard/verify           Creator identity verification (YouTube, TikTok, etc.)
/dashboard/transaction      Transaction history
```

### NavBar Primary Links (from `components/nav-bar.tsx`)

```
/dashboard/marketplace  →  "Marketplace"
/dashboard/agents       →  "Agents"
/dashboard/products/create  →  "Create"
/dashboard              →  "Dashboard"
```

### Server API Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/agents` | Register new AI agent (inserts `agent_profiles`) |
| PATCH | `/api/agents/profile` | Update existing agent fields |
| POST | `/api/gigs` | Create a gig listing |
| POST | `/api/products` | Create a product listing |
| POST | `/api/products/purchase` | Purchase a product (inserts `product_purchases`) |
| PUT | `/api/profile/edit` | Upsert creator profile (`creator_profiles`) |
| POST | `/api/contracts/escrow` | Deploy refund contract + create escrow |
| POST | `/api/contracts/escrow/deposit/approve` | USDC approve call |
| POST | `/api/contracts/escrow/deposit` | Deposit USDC into contract |
| POST | `/api/contracts/escrow/refund` | Trigger refund |
| POST | `/api/contracts/analyze` | OpenAI document analysis |
| POST | `/api/contracts/validate-work` | AI-validate deliverable + release funds |
| POST | `/api/smart-wallet` | Create / update modular smart wallet |
| POST | `/api/swap` | Fetch Circle swap quote (server-side, no CORS) |
| POST | `/api/usdc/buy` | USDC on-ramp session |
| POST | `/api/usdc/sell` | USDC off-ramp session |
| POST | `/api/verify/connect` | Social account OAuth + mock metrics |
| POST | `/api/wallet` | Create Circle DCW wallet |
| POST | `/api/wallet/balance` | Get wallet USDC balance |
| POST | `/api/wallet/balance/request` | Request faucet drip |
| POST | `/api/wallet/transactions` | List transactions |
| GET | `/api/wallet/transactions/[id]` | Single tx detail |
| PUT | `/api/wallet-set` | Update / create wallet-set association |
| GET | `/api/circle-proxy/[...path]` | Generic Circle API proxy |
| POST | `/api/webhooks/circle` | Circle webhook (verified)

---

## 9 · Arc Testnet Chain Config

From `lib/web3/appkit-provider.tsx`:

| Field | Value |
|---|---|
| Chain name | Arc Testnet |
| Chain ID | 5042002 |
| RPC | `https://rpc.testnet.arc.network` |
| Native symbol | ARC |
| USDC address | `0x3600000000000000000000000000000000000000` |
| EURC address | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| Explorer | `https://testnet.arcscan.app` |

CCTP source chains (bridge): Ethereum Sepolia (11155111), Base Sepolia (84532), Arbitrum Sepolia (421614).

---

## 10 · Colours & Design System

**Source:** `app/globals.css` (314 lines) — all colours are OKLCH tokens, defined in both
`:root` (light) and `.dark` blocks. CSS custom properties are also bridged to shadcn via
`--background`, `--foreground`, `--primary`, etc.

| Token | Light | Dark |
|---|---|---|
| bg | oklch(0.97 0.005 80) | oklch(0.13 0.008 260) |
| bg-elevated | oklch(0.95 0.005 80) | oklch(0.16 0.01 260) |
| bg-inset | oklch(0.99 0.003 80) | oklch(0.10 0.006 260) |
| fg | oklch(0.15 0.01 260) | oklch(0.93 0.01 260) |
| fg-secondary | oklch(0.40 0.012 260) | oklch(0.65 0.015 260) |
| fg-muted | oklch(0.55 0.01 260) | oklch(0.45 0.012 260) |
| bd | oklch(0.85 0.008 80) | oklch(0.22 0.012 260) |
| accent | oklch(0.50 0.18 260) | oklch(0.55 0.15 260) |
| success | — | oklch(0.55 0.18 150) |
| warning | — | oklch(0.60 0.16 80) |
| error | — | oklch(0.55 0.20 30) |

**Utility animations defined in `globals.css`**

| Class | Effect |
|---|---|
| `animate-fade-in` | 0.2s opacity |
| `animate-fade-in-up` | 0.25s translateY(8px→0), ease-out |
| `animate-fade-in-down` | 0.2s translateY(-4px→0) |
| `animate-scale-in` | 0.2s scale(0.95→1) |
| `animate-pulse-soft` | 2s infinite opacity breath |
| `animate-skeleton` | shimmer gradient |
| `animate-float-subtle` | 6s translateY(0→-4px→0) |
| `hover-lift` / `hover-scale` | Interactive hover helpers |
| `avatar-ring` | Focus/hover ring on user avatar |

**Default theme is dark** — `next-themes` is configured with `defaultTheme="dark" enableSystem`.

**Radius tokens:** `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px`, `--radius-xl: 16px`.

---

## 11 · Component Map (landing + shared)

| Component | File | What it does |
|---|---|---|
| `NavBar` | `components/nav-bar.tsx` | Top nav: logo, 4 primary links, theme toggle, wallet connect, user menu, mobile drawer + scroll effect |
| `LandingPage` | `components/landing-page.tsx` | Full marketing page: hero, social proof, feature grid, AI agent showcase, how it works, CTA (~550 lines, framer-motion) |
| `HeroVisual` | `components/hero-visual.tsx` | Animated stack of marketplace cards + workflow progress + creator avatars (~393 lines) |
| `ActivityTicker` | `components/activity-ticker.tsx` | Horizontal rAF-scrolling live ticker bar |
| `UserMenu` | `components/user-menu.tsx` | Avatar dropdown — Dashboard / Profile / Sign out |
| `WalletConnectButton` | `components/wallet-connect-button.tsx` | Connect EOA or create Smart Wallet (dropdown) |
| `WalletBalance` | `components/wallet-balance.tsx` | Format + display USDC balance via Supabase Realtime |
| `WalletInformationDialog` | `components/wallet-information-dialog.tsx` | Wallet detail dialog: balance, ID, address, blockchain |
| `ProductPreview` | `components/products/create/product-preview.tsx` | Live marketplace card preview alongside the product form |
| `env-var-warning` | `components/env-var-warning.tsx` | Shows env variable warning banner |

---

## 12 · Dashboard Overview (`app/dashboard/page.tsx`)

Server Component (RSC) — fetches profile, wallet, agents, products, agreements via Supabase.
Renders:
```
[ Stats ]   Active Products | AI Agents | Total Listed | Wallet Balance
[ Wallet Card ]   Big balance + USDC button (buy/sell/request) + info icon
[ Quick Actions ] 6-card grid: Marketplace / Bridge / Products / Agents / Profile / Verify
[ Recent Products ]   List of user's latest listings with badge + price
[ AI Agents ]  Agent cards showing name, type, status, jobs, earnings (server-fetched)
[ Escrow Agreements ]  <EscrowAgreements /> client component (Realtime)
[ Recent Transactions ] <Transactions /> dynamic client import
```

---

## 13 · AI Agent Platform

### Agent Creation (`app/dashboard/agents/create/page.tsx`)

5-step wizard:

| Step | Fields |
|---|---|
| Info | agent_name, description, welcome_message, avatar_url |
| Capabilities | capabilities (checkbox), specializations (checkbox) |
| Pricing | pricing_model (fixed/per_clip/per_hour), price_per_clip, price_per_hour, max_queue, auto_accept |
| Tools | llm_provider, llm_model, tools_enabled (checkbox) |
| Deploy | API POST → `/api/agents`, createAgent PATCH helper |

### Agent Management (`app/dashboard/agents/page.tsx`)

Client Component. Fetches `agent_profiles` via Supabase browser client. Supports:
- `toggleAvailability()` — switch `online ←→ offline`
- `deleteAgent()` — soft-delete with confirmation dialog
- `reRegister()` — re-register as ERC-8004 on-chain identity

### Agent Types & Tools

Capabilities: Video Clipping, Auto-Caption, Thumbnail Generation, Audio Enhancement,
Transcript Extraction, Viral Hook Detection, Format Conversion, Color Grading, Background Removal.

Specializations: TikTok Clips, YouTube Shorts, IG Reels, Vertical Editing, Gaming Content,
Podcast Clips, Stream Highlights, Thumbnail Design, Caption Writing, Audio Cleanup, Viral Hooks.

Tools: OpenAI Vision, FFmpeg, Whisper (Transcript), Stable Diffusion, ElevenLabs (Voice),
Remotion (Render), Auto-Caption, Chroma Key.

---

## 14 · Creator Products & Marketplace

### Product Types

| Type | Value | Description |
|---|---|---|
| Clip Pack | `clip_pack` | Batch of edited short-form clips |
| Template | `template` | Editable presets / assets / workflows |
| Membership | `membership` | Recurring access |
| AI Automation | `automation` | Automated workflow / agent service |
| Service | `service` | Done-for-you creative service |
| Community | `community` | Private group or channel |

Delivery: `instant` (immediate access) or `escrow` (reviewed before release).

### Product Creation (`app/dashboard/products/create/page.tsx`)

Form fields: title, description, price_amount, product_type, delivery_type, tags (auto-suggested + comma-confirmed, max 8), media_urls (cover image upload), file_url, access_url, featured toggle.
Includes `ProductPreview` sticky panel showing marketplace card + platform fee breakdown (5% fee).

### Marketplace (`app/dashboard/products/page.tsx`)

Client Component. Fetches all active `products` with `creator_profile`. Search by title/description +
type filter (`clip_pack`, `template`, …).

### Product Purchase (`app/api/products/purchase/route.ts`)

Validates the product, checks `status === "active"`, inserts `product_purchases` row.

---

## 15 · Creator Verification

`app/api/verify/connect/route.ts` — social OAuth with mock data.

| Platform | Status |
|---|---|
| YouTube | Has live OAuth endpoint |
| TikTok, Instagram, Twitch, X | Mock data only (placeholder `MOCK_METRICS` object) |

`app/api/profile/edit/route.ts` — upserts `creator_profiles`. Fields: `display_name`, `bio`, `avatar_url`, `website`.

---

## 16 · How to Edit / Common Tasks

| Doing this… | Open this file… |
|---|---|
| Add a new dashboard page | `app/dashboard/<slug>/page.tsx` |
| Add a new API endpoint | `app/api/<domain>/route.ts` (create folder + `route.ts`) |
| Fix auth callback wallet creation bug | `app/auth/callback/route.ts` (line 98: `createdwallet` → `createdWallet`) |
| Change Supabase schema | `types/database.types.ts` needs `supabase gen types typescript` — 6 tables are missing |
| Add a new DB column | Find the relevant table row above, add to `types/database.types.ts` |
| Fix smart contract ABI | `lib/constants.ts` |
| Tweak colour tokens | `app/globals.css` (all colours are OKLCH CSS vars) |
| Add animation | `app/globals.css` keyframes section |
| Change nav items | `components/nav-bar.tsx` primaryNav array (line 16-21) |
| Tweak chain / wallet config | `lib/web3/appkit-provider.tsx` |
| Tweak landing page copy | `components/landing-page.tsx` |
| Add OpenAI prompt | `lib/utils/assistant-config.ts`, `lib/utils/executeContract.ts` |
| Add shadcn/ui component | `components/ui/<name>.tsx` |

---

## 17 · File Sizes (largest, sorted)

| File | Lines | Bytes |
|---|---|---|
| `app/dashboard/agents/create/page.tsx` | 475 | ~21 KB |
| `app/dashboard/products/create/page.tsx` | 475 | ~20 KB |
| `components/landing-page.tsx` | 551 | ~23 KB |
| `components/hero-visual.tsx` | 393 | ~16 KB |
| `lib/constants.ts` | ~200 | ~42 KB (bytecode blob) |
| `app/api/contracts/validate-work/route.ts` | 319 | ~11 KB |
| `app/dashboard/products/page.tsx` | 345 | ~13 KB |
| `app/dashboard/page.tsx` | 357 | ~15 KB |
| `components/nav-bar.tsx` | 217 | ~7 KB |
| `app/globals.css` | 314 | ~10 KB |
| `app/dashboard/agents/page.tsx` | 277 | ~12 KB |
| `app/api/webhooks/circle/route.ts` | 259 | ~8 KB |

---

## 18 · Conventions & Patterns

1. **Server Components by default.** Client components (`"use client"`) are only in `components/`
   and `app/dashboard/*` pages. All `app/api/*` and `app/layout.tsx` are RSC.
2. **No secrets client-side.** Circle keys, OpenAI key, Google secrets are server-only.
3. **Supabase SSR pattern:** `lib/utils/supabase/server-client.ts` for server-side;
   `lib/utils/supabase/client.ts` (renamed from `browser-client`) for client-side.
4. **Big blobs go in `lib/constants.ts`.** Refund protocol ABI and bytecode are there.
5. **Toast notifications via `sonner`** and `toast.success/error()` from `sonner`.
6. **Dynamic imports for heavy client components:** e.g. `Transactions` uses `dynamic(() => import(...), { ssr: false })`.
7. **Environment gating:** `hasEnvVars` from `check-env-vars.ts` gates NavBar — if env vars are
   missing a standalone warning bar is shown instead.
8. **Wallet creation happens automatically on OAuth callback** (`app/auth/callback/route.ts`) —
   creates the `creator_profiles`, `wallets`, and `wallet_set` records in one flow.
9. **Framer Motion for landing page only** — dashboards and forms use Tailwind transitions.
10. **`.env.example` uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** (Supabase CLI v2+ convention).
    The code still accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a fallback alias.

---

## 19 · Known Issues / Observations

1. **`auth/callback/route.ts:98`** — Typo: `createdwallet?.blockchain` should be `createdWallet?.blockchain`.
2. **`types/database.types.ts` is stale** — 6 tables (`agent_profiles`, `products`,
   `product_purchases`, `gigs`, `creator_profiles`, `creator_verifications`) are used in the
   live code but absent from generated types. Regenerate before any TypeScript refactor that
   touches DB queries.
3. **`wallets` table** has gained new columns (`wallet_type`, `wallet_set_id`, `account_type`,
   `currency`) since the last type generation. These appear in `app/auth/callback/route.ts`
   but are absent from `types/database.types.ts`.
4. **Creator verification is mock data** for all platforms except YouTube. Real OAuth is
   noted as TODO in `app/api/verify/connect/route.ts` comments.
5. **No git root enforcement** — the app loads with any env-check logic at the visual layer.
6. **Gig listing (`gigs` table)** is currently only an API endpoint (`POST /api/gigs`);
   there is no frontend page yet.
7. **`lib/utils/supabase/browser-client.ts`** and `server-client.ts` were moved/renamed to
   `lib/utils/supabase/client.ts` and `lib/utils/supabase/middleware.ts` — old import paths
   still appear in some handler files under `lib/utils/supabase/server.ts` and `middleware.ts`.
   Verify no stale imports exist.

---

## 20 · Self-Check Before Committing

When modifying this `ARCHITECTURE.md` or any file:

- [ ] Do new routes / pages / components appear in §3 tree?
- [ ] Do new Supabase tables appear in §4 (and `types/database.types.ts` regenerated)?
- [ ] Are env-var changes reflected in §7 / `.env.example`?
- [ ] Are new API endpoints listed in §8?
- [ ] Does the file appear in the correct components/helpers section?

Keep this file honest — it prevents the next agent (or you in a fresh session) from
re-scanning the whole tree.
