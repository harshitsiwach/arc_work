# Arc Work — AI Agent & Creator Marketplace

> **Purpose:** Single entry-point for any AI agent to understand the full project in one read.
> Read this file first, then jump directly to the relevant section.

---

## 1 · What Is This Project?

**Arc Work** is a decentralized creator and AI-worker marketplace on the **Arc blockchain**
(Circle's Ethereum L2). Creators sell products and gigs for USDC, AI agents autonomously
complete gigs, and escrow-backed agreements settle instantly — all powered by Circle's
developer-controlled wallets, EIP-712 smart contracts, and OpenAI-powered document validation.

The app has grown into four major surfaces:

| Surface | Description |
|---|---|
| **Creator Marketplace** | Browse/create products, gigs, courses. Buy/sell with USDC. |
| **AI Agent Platform** | Agent creation wizard, agent profile management, pluggable AI capabilities. |
| **Creator Tooling** | Video Clipper (upload → AI transcript → auto-clip → post to social), creator analytics, settings. |
| **Bridge & Wallet** | CCTP bridge Sepolia → Arc, USDC buy/sell, real-time balance, escrow lifecycle. |

**Tagline:** *The operating system for internet creators and AI workers*

---

## 2 · Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 15** (App Router, RSC by default) |
| Language | **TypeScript 5.3** |
| Runtime | **React 18** |
| Database | **Supabase** PostgreSQL + Auth + Realtime + Storage |
| Blockchain | **Arc Testnet** (Circle's L2, `chain-id: 5042002`) |
| Wallet SDK | `@reown/appkit` v1.8 + **wagmi** v3.6 + **viem** v2.49 |
| Circle SDKs | `@circle-fin/app-kit` v1.5, `@circle-fin/developer-controlled-wallets` v4.6, `@circle-fin/smart-contract-platform` v4.3, `@circle-fin/adapter-viem-v2` v1.11 |
| AI / Validation | **OpenAI API** (GPT-4o vision for document validation; `openai` v6.22) |
| Payment protocol | **x402** — gated content/courses: `lib/x402.ts` decodes USDC ERC-20 `transferFrom` on Arc Testnet via JSON-RPC |
| Smart contracts | EIP-712 Refund Protocol + **ERC-8191 Subscription Controller** (both in `contracts/`) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Styling | **Tailwind CSS v4** (OKLCH tokens, `@theme inline`), shadcn/ui (Radix primitives, CVA, Card/Button/Badge/…) |
| Layout | **next-themes** (default: `dark`, `enableSystem`) |
| Animation | **framer-motion** v12 (pitch deck, landing page, transitions) |
| Toasts | **Sonner** v1.5 |
| Icons | **Lucide React** v0.436 |
| Forms / Validation | **Zod** v3.23 |
| Video | WebCodecs / WASM-based video engine in `editor/` (FFmpeg + WebGPU renderers) |
| Image | WASM-based image-core in `editor/` (multi-layer editing, filters, canvas) |
| Sub-pkg | `editor/` — pnpm workspace (`@openreel/web` video editor, `image-core`, `core` WASM) |

---

## 3 · Directory Tree

```
arc_work/                          ← repo root
├── app/
│   ├── layout.tsx                 Root layout: NavBar, provider stack, env-check gate
│   ├── page.tsx                   → <LandingPage /> (thin wrapper)
│   ├── globals.css                Full design system: OKLCH tokens, animations, shadcn compat
│   ├── middleware.ts              Auth guard: /dashboard/* redirect unauthenticated → /
│   ├── actions/index.ts           Server Actions: signUpAction, signInAction, signOutAction
│   ├── hooks/
│   │   ├── useWalletBalance.ts    Client hook: developer + EOA balance + Supabase Realtime
│   │   ├── useEscrowAgreements.ts Escrow list + deposit/validate/refresh logic
│   │   ├── useContractUpload.ts   PDF/DOCX upload + verification workflow
│   │   └── useSmartContract.ts    Contract status poller + deliverable submission
│   ├── services/
│   │   ├── agreement.service.ts   CRUD + AI validation lifecycle
│   │   ├── escrow.service.ts      Escrow agreement queries
│   │   └── file.service.ts        PDF/DOCX upload + text extraction
│   ├── (auth-pages)/              Sign-in, sign-up, forgot-password
│   ├── auth/
│   │   ├── callback/route.ts      OAuth callback → auto-creates wallet (Supabase SSR)
│   │   └── auth-error/page.tsx
│   ├── creator/[id]/page.tsx      Creator public profile
│   ├── pitch/page.tsx             Interactive 8-slide investor pitch deck (framer-motion)
│   ├── agents/                    ← Agent Hub (shared layout, sidebar navigation)
│   │   ├── layout.tsx             Client wrapper → <DashboardSidebar />
│   │   ├── page.tsx               AI agent list: stats, templates, management, delete/toggle
│   │   ├── create/page.tsx        Agent creation wizard (5 steps, ~215 lines)
│   │   └── marketplace/page.tsx   Agentic Market: browse AI tools/APIs per request
│   ├── explore/                   ← Explore hub (shared layout, sidebar navigation)
│   │   ├── layout.tsx             Client wrapper → <DashboardSidebar />
│   │   └── page.tsx               Browse active products: search + 6-type filter
│   ├── dashboard/                 ← Workspace (shared layout, sidebar navigation)
│   │   ├── layout.tsx             Client wrapper → <DashboardSidebar />
│   │   ├── page.tsx               Main dashboard: wallet section + quick actions + products + agents + escrows
│   │   ├── agents/page.tsx        Agent management: toggle/delete/re-register ERC-8004
│   │   ├── agents/create/page.tsx Agent creation wizard (marshal alias → agents/create)
│   │   ├── analytics/page.tsx     Creator analytics: revenue, pageviews, products (placeholder UI)
│   │   ├── bridge/                CCTP bridge: Sepolia/USDC → Arc
│   │   │   ├── page.tsx           Full multi-step bridge flow
│   │   │   ├── bridge-flow.tsx
│   │   │   ├── icons.tsx
│   │   │   ├── token-selector.tsx
│   │   │   └── transaction-status.tsx
│   │   ├── clipper/page.tsx       Video Clipper: upload → transcript → clip → post social
│   │   ├── courses/               Courses via x402 micro-payments
│   │   │   ├── page.tsx            Course list (MVP: 1 Solidity course)
│   │   │   └── [id]/page.tsx       Course detail + module viewer
│   │   ├── marketplace/           Gig browsing (creative + AI gigs)
│   │   │   ├── page.tsx            Open-gig listing with search/filter
│   │   │   ├── post/page.tsx       "Post a Gig" form
│   │   │   ├── [id]/page.tsx       Gig detail
│   │   │   └── [id]/apply-button.tsx
│   │   ├── my-products/page.tsx   Creator's own product list
│   │   ├── orders/page.tsx        Order history (placeholder UI)
│   │   ├── products/              Product marketplace (6 types)
│   │   │   ├── page.tsx            Product listing search + type filter
│   │   │   ├── create/page.tsx     6-product-type form + live preview
│   │   │   ├── create/product-preview.tsx
│   │   │   ├── [id]/page.tsx       Product detail
│   │   │   └── [id]/buy-button.tsx
│   │   ├── profile/               Creator profile edit
│   │   │   ├── page.tsx
│   │   │   └── edit-form.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── settings/page.tsx      Account + notification + security settings (placeholder UI)
│   │   ├── subscriptions/page.tsx Subscription model: Circle-powered recurring billing
│   │   ├── transaction/[id]/page.tsx Single transaction detail
│   │   └── verify/page.tsx         Social account verification (YouTube live, others mock)
│   └── api/                        ← Next.js Route Handlers (all RSC/server-side)
│       ├── agents/route.ts         POST → register AI agent (inserts agent_profiles)
│       ├── agents/profile/route.ts PATCH → update agent
│       ├── gigs/route.ts           POST → create gig listing
│       ├── products/route.ts       POST → create product listing
│       ├── products/purchase/route.ts POST → purchase a product
│       ├── profile/edit/route.ts   PUT → upsert creator profile
│       ├── tools/route.ts          GET → fetch Agentic Market AI tools/APIs
│       ├── courses/[id]/route.ts   GET → x402-gated course content for Arc-Based payment
│       ├── contracts/
│       │   ├── escrow/route.ts                              POST → deploy refund contract + DB record
│       │   ├── escrow/deposit/approve/route.ts               POST → USDC approve before on-chain deposit
│       │   ├── escrow/deposit/route.ts                      POST → deposit USDC into Refund Protocol
│       │   ├── escrow/refund/route.ts                       POST → trigger refund via contract
│       │   ├── analyze/route.ts                             POST → OpenAI doc analysis (no contract call)
│       │   └── validate-work/route.ts                       POST → AI-validate + release funds (~320 lines)
│       ├── smart-wallet/route.ts   POST/PUT → create/update smart wallet
│       ├── swap/route.ts           POST → Circle swap quote (server-side, no CORS)
│       ├── usdc/buy|sell/route.ts  POST → Circle Ramp on/off-ramp session
│       ├── verify/connect/route.ts POST → social OAuth (YouTube live; TikTok/IG/Twitch/X → mock)
│       ├── wallet/route.ts         POST → Circle developer-controlled wallet
│       ├── wallet/balance/route.ts POST → aggregated USDC balance (Circle DCW REST)
│       ├── wallet/balance/request/route.ts POST → faucet drip request
│       ├── wallet/transactions/route.ts              POST → list tx history
│       ├── wallet/transactions/[id]/route.ts          GET  → single tx detail
│       ├── wallet-set/route.ts     PUT → update wallet-set association
│       ├── circle-proxy/[...path]/route.ts            Generic Circle REST proxy
│       ├── clipper/                 ← Video Clipper API
│       │   ├── process/route.ts     POST → full clipper pipeline
│       │   ├── download/route.ts    GET  → signed download URL
│       │   ├── update-transcript/route.ts PATCH → re-transcribe with corrected text
│       │   ├── post-social/route.ts POST → publish clip to YouTube/TikTok
│       │   └── commission/route.ts  GET  → estimated earnings from clipped content
│       └── webhooks/circle/route.ts POST → verified Circle webhook
│
├── components/
│   ├── nav-bar.tsx                Top nav: logo + 4 primary links, wallet connect, search, user menu
│   ├── landing-page.tsx           Full marketing page (~550 lines, framer-motion)
│   ├── hero-visual.tsx            Animated card stack + workflow mock (~400 lines)
│   ├── activity-ticker.tsx        rAF-scrolling live ticker bar
│   ├── user-menu.tsx              Avatar dropdown: Dashboard / Profile / Sign out
│   ├── wallet-connect-button.tsx  Connect EOA or create Smart Wallet (dropdown)
│   ├── wallet-balance.tsx         Client: formatted USDC balance from useWalletBalance hook
│   ├── wallet-information-dialog.tsx Dialog: wallet ID + address + chain info
│   ├── dashboard-wallet-section.tsx NEW Dashboard card: balance + buy/sell + address
│   ├── dashboard-sidebar.tsx      NEW Contextual sidebar (collapsible, navigate context-aware)
│   ├── usdc-button.tsx            Buy USDC / Sell USDC / Request Faucet button
│   ├── request-usdc-button.tsx    "Request From Application" faucet button
│   ├── escrow-agreements.tsx      Escrow card list on dashboard + deposit/validate actions
│   ├── escrow-agreements-item.tsx Single escrow agreement card
│   ├── transactions.tsx           Paginated transaction table + Circle re-fetch
│   ├── smart-wallet.tsx           Smart wallet showcase + invite-only signup
│   ├── agreements-table.tsx       Detailed Escrow agreements table (AgreementDetailsDialog variant)
│   ├── agreement-delete-dialog.tsx
│   ├── agreement-details-dialog.tsx
│   ├── copy-button.tsx
│   ├── deploy-smart-contract-button.tsx
│   ├── upload-contract-button.tsx
│   ├── validation-succeeded-dialog.tsx
│   ├── validation-failed-dialog.tsx
│   ├── verified-badges.tsx
│   ├── form-message.tsx
│   ├── submit-button.tsx
│   ├── google-login-button.tsx
│   ├── header-auth.tsx
│   ├── env-var-warning.tsx        Shows env var warning banner when circle key missing
│   ├── theme-switcher.tsx         Dark/light/system toggle
│   ├── hero.tsx                   Older hero variant — superseded by LandingPage
│   └── ui/                        shadcn/ui primitives (card, button, badge, dialog, …)
│
├── lib/
│   ├── constants.ts               SYSTEM_AGENT_ADDRESS + REFUND_PROTOCOL_ABI + bytecode (~42 KB blob)
│   ├── x402.ts                    NEW x402 payment protocol verifier (RPC USDC transferFrom decoder)
│   ├── supabase/                  ← CANONICAL Supabase client (new location)
│   │   ├── browser-client.ts      createBrowserClient (Anon key; @supabase/ssr)
│   │   ├── server-client.ts       createServerClient + createSupabaseServerComponentClient + createSupabaseReqResClient
│   │   └── check-env-vars.ts      hasEnvVars() guard for NavBar env-check
│   ├── utils/
│   │   ├── supabase/              Legacy/backup copy (May 19)
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   ├── server.ts
│   │   │   └── check-env-vars.ts
│   │   ├── cn.ts                  cn() — clsx + tailwind-merge
│   │   ├── amount.ts              USDC amount formatter
│   │   ├── escrow.ts              Status colors, formatAmount
│   │   ├── sleep.ts               Promise-based delay helper
│   │   ├── assistant-config.ts    OpenAI call configuration
│   │   ├── openAIClient.ts        Shared OpenAI singleton client
│   │   ├── openai-error-handler.ts OpenAI error formatting + handling
│   │   ├── executeContract.ts     Generic contract-call driver (viem + Circle SDK)
│   │   ├── developer-controlled-wallets-client.ts Thin Circle DCW REST wrapper
│   │   ├── smart-contract-platform-client.ts  Thin Circle SCP REST wrapper
│   │   ├── create-circle-ramp-session.ts       USDC on-ramp / off-ramp session
│   │   ├── utils.ts               General helpers (formatCurrency, slugify, …)
│   │   └── supabase/              (see above — canonical)
│   └── web3/
│       ├── appkit-provider.tsx    Reown AppKit + Arc Testnet chain config
│       └── wallet-provider.tsx    Wallet state: connect EOA / smart wallet / swap / bridge / disconnect
│
├── types/
│   ├── database.types.ts          Generated Supabase types — ⚠️ out-of-date (see §4)
│   ├── escrow.ts                  EscrowAgreementWithDetails, AgreementStatus, EscrowListProps
│   └── agreements.ts              Agreement details types
│
├── contracts/
│   ├── escrow_smart_contract/
│   │   └── RefundProtocol.sol     EIP-712 Refund Protocol (payout + refund on-chain, ~150 lines)
│   └── SubscriptionController.sol NEW ERC-8191 recurring-payment controller with ERC20 TransferFrom
│
├── editor/                        Video editor sub-package (pnpm workspace; 646 source files)
│   ├── packages/core/             WASM video engine: frame extraction, transitions, stabilization, upscaling
│   ├── packages/image-core/       Multi-layer image editor with filters + adjustments
│   └── apps/web/                  React shell (video + image app entry points)
│
├── next.config.js                 Circle API rewrite + SSR externals + pdf-parse
├── tsconfig.json
├── tailwind.config.ts
├── package.json
├── DESIGN.md                      Design system docs
├── PRODUCT.md                     Product / feature design doc
├── SECURITY.md                    Security considerations
├── README.md                      User setup guide
├── llms.txt                       Short LLM-friendly summary page
├── PITCH_DECK.md                  Pitch deck narrative
├── ARCHITECTURE.md                ← THIS FILE
├── AGENTS.md                      Agent instruction notes
├── .env.example                 Env var template
├── .env.local                    Local secrets — DO NOT COMMIT
└── supabase.bak                  Supabase backup
```

---

## 4 · Supabase Data Model

> ⚠️ **`types/database.types.ts` is stale.** At least 6 tables are used in code but absent from the
> generated types file. Regenerate with `supabase gen types typescript --project-id sbetkvtdazoxyddexnnm`
> before any TypeScript refactor that touches DB queries.

### Tables used in code

```sql
-- 1. profiles ✅ (in generated types)
profile          auth_user_id TEXT PK   → Supabase Auth user UUID
                 name TEXT
                 email TEXT
                 created_at TIMESTAMPTZ

-- 2. wallets ⚠️ stale (new columns absent from generated types)
wallet           id UUID PK
                 profile_id FK → profiles
                 wallet_address TEXT
                 circle_wallet_id TEXT
                 wallet_type TEXT           -- "DEVELOPER_CONTROLLED"
                 wallet_set_id TEXT
                 account_type TEXT          -- "WALLET"
                 blockchain TEXT
                 balance TEXT               -- USDC balance
                 currency TEXT              -- "USDC"
                 created_at TIMESTAMPTZ

-- 3. transactions ✅ (in generated types)
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

-- 4. escrow_agreements ✅ (in generated types)
escrow_agreement id UUID PK
                 beneficiary_wallet_id FK → wallets
                 depositor_wallet_id FK    → wallets
                 transaction_id FK → transactions
                 circle_contract_id TEXT
                 status TEXT  -- PENDING | OPEN | LOCKED | CLOSED
                 terms JSONB
                 created_at, updated_at TIMESTAMPTZ

-- 5. agent_profiles ⚠️ NOT in generated types
agent_profiles   id UUID PK
                 profile_id FK → profiles
                 agent_name TEXT
                 agent_type TEXT              -- default "ai"
                 description TEXT | NULL
                 capabilities TEXT[]          -- e.g. ["Video Clipping","Thumbnail Generation"]
                 specializations TEXT[]
                 pricing_model TEXT           -- "fixed"|"per_clip"|"per_hour"
                 price_per_clip NUMERIC | NULL
                 price_per_hour  NUMERIC | NULL
                 max_queue INT
                 auto_accept BOOLEAN
                 welcome_message TEXT | NULL
                 avatar_url TEXT | NULL
                 llm_provider TEXT            -- "openai"
                 llm_model TEXT               -- "gpt-4o"
                 tools_enabled TEXT[]         -- e.g. ["OpenAI Vision","FFmpeg"]
                 availability_status TEXT     -- "online"|"offline"
                 erc8004_identity_address TEXT  -- on-chain ERC-8004 identity
                 reputation_score INT         -- default 0
                 total_jobs_completed INT     -- default 0
                 total_earnings INT           -- default 0
                 created_at TIMESTAMPTZ

-- 6. products ⚠️ NOT in generated types
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

-- 7. product_purchases ⚠️ NOT in generated types
product_purchases id UUID PK
                  product_id FK → products
                  buyer_profile_id FK → profiles
                  amount NUMERIC
                  currency TEXT
                  status TEXT
                  created_at TIMESTAMPTZ

-- 8. gigs ⚠️ NOT in generated types
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

-- 9. creator_profiles ⚠️ NOT in generated types
creator_profiles id UUID PK
                 profile_id FK → profiles (1:1)
                 display_name TEXT
                 bio TEXT | NULL
                 avatar_url TEXT | NULL
                 website TEXT | NULL
                 created_at TIMESTAMPTZ

-- 10. creator_verifications ⚠️ NOT in generated types
creator_verifications  id UUID PK
                       creator_profile_id FK → creator_profiles
                       platform TEXT            -- "youtube"|"tiktok"|"instagram"|"twitch"|"x"
                       platform_username TEXT
                       platform_user_id TEXT
                       followers INT
                       total_views INT
                       verified_at TIMESTAMPTZ
                       raw_response JSONB | NULL  -- mock placeholder
```

### Agreement status flow

```
PENDING  →  OPEN     (client deposits USDC into the Refund Protocol contract)
OPEN     →  LOCKED   (worker submits deliverable + AI validates → funds released)
OPEN     →  CLOSED   (manual / unresolved)
```

---

## 5 · Smart Contracts

Both contracts serve different purposes in the Arc Work protocol.

### 5a · EIP-712 Refund Protocol (escrow)

- **Source:** `contracts/escrow_smart_contract/RefundProtocol.sol`
- **ABI + bytecode:** embedded in `lib/constants.ts` (full `REFUND_PROTOCOL_ABI_JSON` + `REFUND_PROTOCOL_BYTECODE` blobs)

| Key Function | Purpose |
|---|---|
| `pay` | Client deposits USDC — creates escrow agreement |
| `depositArbiterFunds` | Agent (arbiter) stakes USDC before accepting |
| `withdraw` / `withdrawArbiterFunds` | Withdraw deposited funds |
| `refundByArbiter` | Agent refunds client (arbiter-initiated) |
| `refundByRecipient` | Client disputes — recipient refund |
| `settleDebt` | AI agent's fee/resolution (arb) |
| `earlyWithdrawByArbiter` | Early arbiter withdrawal pre-settlement |

### Contract route files

| File | Purpose |
|---|---|
| `app/api/contracts/escrow/route.ts` | `POST /api/contracts/escrow` — deploy contract + DB create |
| `app/api/contracts/escrow/deposit/approve/route.ts` | `POST` — USDC approve before deposit |
| `app/api/contracts/escrow/deposit/route.ts` | `POST` — deposit USDC into contract |
| `app/api/contracts/escrow/refund/route.ts` | `POST` — on-chain refund |
| `app/api/contracts/analyze/route.ts` | `POST` — OpenAI doc analysis (no contract call) |
| `app/api/contracts/validate-work/route.ts` | `POST` — AI validate + release funds (~320 lines, largest handler) |

### Contract helper modules

| File | Role |
|---|---|
| `lib/utils/executeContract.ts` | Generic contract-call driver (viem + Circle SDK integration) |
| `lib/utils/developer-controlled-wallets-client.ts` | Thin Circle DCW REST API wrapper |
| `lib/utils/smart-contract-platform-client.ts` | Thin Circle SCP REST API wrapper |
| `lib/constants.ts` | `SYSTEM_AGENT_ADDRESS`, ABI + bytecode constants |

### 5b · ERC-8191 Subscription Controller

- **Source:** `contracts/SubscriptionController.sol`
- **Purpose:** Recurring USDC payments between subscribers and creators on Arc.
- **Key functions:** `subscribe()` — create subscription with owner/token/amount/billingInterval.
  `executeBilling()` — pull USDC from subscriber to creator on schedule.
  `cancelSubscription()` — cancel by either party.
- **Status:** Solidity source defined; no execute/deploy route handler yet.

---

## 6 · Payments & Wallet

### AgentAddresses / Circumference

| Role | Address |
|---|---|
| Agent / Arbiter | `0x3d7ffed295e555052233544ba74eaa1c0920fa20` |
| USDC (Arc Testnet) | `0x3600000000000000000000000000000000000000` |
| EURC (Arc Testnet) | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| Circle blockchain code | `CIRCLE_BLOCKCHAIN` env var (e.g. `ARC-TESTNET`) |

### Wallet Architecture

The balance hook (`useWalletBalance`) fetches a **dual-source combined balance**:
1. **Developer-controlled wallet** (Circle DCW on Arc): fetched server-side via `POST /api/wallet/balance` using Circle REST API + Supabase Realtime subscription on `wallets` table.
2. **EOA/MetaMask balance**: fetched client-side via `@circle-fin/app-kit` unifiedBalance + direct Arc RPC USDC `balanceOf` as fallback via viem.

```
Balance = Developer Balance (Arc DCW) + EOA Balance (MetaMask on Arc)
```

**New wallet APIs:**
| Endpoint | Purpose |
|---|---|
| `POST /api/wallet/balance` | Aggregate USDC balance across Circle DCW tokens |
| `POST /api/wallet/balance/request` | Request faucet drip |
| `POST /api/wallet/transactions` | List Circle wallet transaction history |
| `GET  /api/wallet/transactions/[id]` | Single transaction detail |

**New balance components:**
| Component | Purpose |
|---|---|
| `@/components/wallet-balance.tsx` | Formatted `<span>` using `useWalletBalance`. Skeleton while loading. |
| `@/components/dashboard-wallet-section.tsx` | Dashboard card: displays balance + wallet address + buy/sell buttons + wallet info dialog |

---

## 7 · Auth & Middleware

- **`middleware.ts`** (`app/middleware.ts`): Matches `["/", "/dashboard/:path*"]`.
  Redirects unauthenticated users from `/dashboard/*` → `/`.
- **Auth pages:** `app/(auth-pages)/sign-in/page.tsx`, `sign-up/page.tsx`, `forgot-password/page.tsx`.
- **Server Actions:** `app/actions/index.ts` — `signUpAction`, `signInAction`, `signOutAction`.
- **OAuth callback** (`app/auth/callback/route.ts`): On email confirmation, using Supabase SSR client:
  1. Bypasses the OAuth confirmation redirect by directly exchanging the OAuth code for a session.
  2. Finds or creates a `profiles` row matching `auth_user_id`.
  3. Creates the `creator_profiles` row.
  4. Calls `PUT /api/wallet-set` → creates Circle Wallet Set.
  5. Calls `POST /api/wallet` → creates the developer-controlled wallet.
  6. Writes `wallets` record (wallet_type, wallet_set_id, account_type, wallet_address, sidebar).
- **Google OAuth** via Supabase SSR client (`createSupabaseServerClient`).
- **Supabase client location:** `lib/utils/supabase/` is the **canonical** location.
  `lib/utils/supabase/` also exists (May 19 legacy copy of same functionality).

---

## 8 · Navigation Architecture

Three distinct navigation modes driven by `DashboardSidebar` (`app/components/dashboard-sidebar.tsx`):

```
detectContext(pathname):
  /agents*             → "agents"   (Agent Hub sidebar)
  /explore* or
  /dashboard/products*
  /dashboard/marketplace*
  /dashboard/courses*
  /dashboard/subscriptions*
  /dashboard/clipper*  → "explore"  (Marketplace sidebar)
  everything else      → "dashboard" (Workspace sidebar)
```

**Sharing layout files:** Three layout wrappers all use `<DashboardSidebar />` + same max-width container:

| Layout | Path |
|---|---|
| Workspace layout | `app/dashboard/layout.tsx` |
| Explore layout | `app/explore/layout.tsx` |
| Agents layout | `app/agents/layout.tsx` |

**NavBar (`components/nav-bar.tsx`) global links:**

```
Explore   → /explore
Agents    → /agents
Pitch Deck→ /pitch          (NEW)
Dashboard → /dashboard

Create ▼  → Create Gig · Post Project · Upload Product · Create Course · Browse AI Marketplace
```

---

## 9 · Environment Variables

```bash
# Deployment
VERCEL_URL=                  # server-side (e.g. http://localhost:3000)
NEXT_PUBLIC_VERCEL_URL=      # public mirror

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sbetkvtdazoxyddexnnm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_kYAWoKAxbL4ohnHQTqyDmw_Un5H8M68

# Token addresses
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=
NEXT_PUBLIC_EURC_CONTRACT_ADDRESS=

# Agent wallet (auto-generated by npm run generate-wallet)
NEXT_PUBLIC_AGENT_WALLET_ID=
NEXT_PUBLIC_AGENT_WALLET_ADDRESS=

# Circle
CIRCLE_API_KEY=              # server-side
CIRCLE_ENTITY_SECRET=        # server-side
CIRCLE_BLOCKCHAIN=           # e.g. ARC-TESTNET

# OpenAI
OPENAI_API_KEY=              # server-side

# Google OAuth
GOOGLE_CLIENT_ID=            # server-side
GOOGLE_CLIENT_SECRET=        # server-side

# Transak API
NEXT_PUBLIC_TRANSAK_API_KEY=

# Circle App Kit (swap/bridge)
NEXT_PUBLIC_CIRCLE_KIT_KEY=KIT_KEY:<keyId>:<keySecret>
```

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_VERCEL_URL` | public | Base URL — dev: `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Supabase publishable key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Accepted alias for publishable key |
| `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` | public | USDC on Arc Testnet |
| `NEXT_PUBLIC_EURC_CONTRACT_ADDRESS` | public | EURC on Arc Testnet |
| `NEXT_PUBLIC_AGENT_WALLET_ID` | public | Circle DCW wallet ID |
| `NEXT_PUBLIC_AGENT_WALLET_ADDRESS` | public | Circle DCW address |
| `CIRCLE_API_KEY` | server | Circle REST API key |
| `CIRCLE_ENTITY_SECRET` | server | Circle entity-secret HMAC |
| `CIRCLE_BLOCKCHAIN` | server | e.g. `ARC-TESTNET` |
| `OPENAI_API_KEY` | server | OpenAI API key |
| `GOOGLE_CLIENT_ID` | server | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | server | Google OAuth |
| `NEXT_PUBLIC_CIRCLE_KIT_KEY` | public | Circle App Kit key for swap/bridge |
| `NEXT_PUBLIC_TRANSAK_API_KEY` | public | Transak on-ramp/off-ramp |
| `AGENTS.md` | public | Agent instruction notes |
| `LLMS.TXT` | public | Assign locations |

---

## 9.5 · Arc Testnet Chain Config

From `lib/web3/appkit-provider.tsx`:

| Field | Value |
|---|---|
| Chain name | Arc Testnet |
| Chain ID | 5042002 |
| RPC | `https://rpc.testnet.arc.network` |
| Native symbol | ARC |
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| Explorer | `https://testnet.arcscan.app` |
| CCTP source chains | Ethereum Sepolia (11155111), Base Sepolia (84532), Arbitrum Sepolia (421614) |

---

## 9.6 · Supabase AgentAuthRecords (??)

Used internally as a Supabase base table to synchronise server-side records with the frontend.

| Column | Type |
|---|---|
| id | uuid |
| auth_user_id | uuid |
| name | text |
| type | text |
| email | text |
| wallet_address | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

## 10 · Frontend Routes & API Endpoints

### Frontend Routes

```
/                           Landing page (<LandingPage/> — full marketing page)
/sign-in                    Email/password sign-in
/sign-up                    Sign-up (companyName + optional fullName)
/forgot-password            Password reset
/auth/callback              OAuth redirect handler
/creator/[id]               Creator public profile
/pitch                      Pitch Deck (interactive slide show, keyboard-driven)
/agents                     AI Agent Hub — agent list + templates
/agents/create              Agent creation wizard (5-step)
/agents/marketplace         Browse Agentic Market AI tools/APIs
/explore                    Browse active products: search + type filter

/dashboard                  Main dashboard (wallet · quick actions · products · agents · escrows)
/dashboard/agents           Agent management (toggle/delete/ERC-8004)
/dashboard/agents/create    Create new agent (5-step wizard)
/dashboard/analytics        Creator analytics dashboard
/dashboard/bridge           CCTP bridge (USDC Sepolia → Arc Testnet)
/dashboard/clipper          Video Clipper: AI transcript → auto-clip → social post
/dashboard/courses          x402-gated courses listing
/dashboard/courses/[id]     Course detail + module viewer
/dashboard/marketplace      Browse open gigs (human + AI agent gigs)
/dashboard/marketplace/post "Post a Gig" form
/dashboard/marketplace/[id] Gig detail
/dashboard/my-products      Creator's own product listings
/dashboard/orders           Order history (placeholder UI)
/dashboard/products         Product catalog: search + 6-type filter
/dashboard/products/create  Create product (6 types + live preview card)
/dashboard/products/[id]    Product detail page
/dashboard/profile          Creator profile editor
/dashboard/settings         Account / notifications / security settings
/dashboard/subscriptions    Recurring subscriptions listing
/dashboard/transaction/[id] Transaction detail
/dashboard/verify           Social verification: YouTube live, others mock
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
| GET | `/api/tools` | Fetch Agentic Market services (paginated full sync) |
| GET | `/api/courses/[id]` | x402-gated course content |
| POST | `/api/contracts/escrow` | Deploy refund contract + create escrow DB record |
| POST | `/api/contracts/escrow/deposit/approve` | USDC approve before deposit |
| POST | `/api/contracts/escrow/deposit` | Deposit USDC into Refund Protocol |
| POST | `/api/contracts/escrow/refund` | Trigger on-chain refund |
| POST | `/api/contracts/analyze` | OpenAI document analysis |
| POST | `/api/contracts/validate-work` | AI-validate deliverable + release funds |
| POST | `/api/smart-wallet` | Create / update modular smart wallet |
| POST | `/api/swap` | Fetch Circle swap quote (server-side, no CORS) |
| POST | `/api/usdc/buy` | USDC on-ramp session (Circle Ramp) |
| POST | `/api/usdc/sell` | USDC off-ramp session |
| POST | `/api/verify/connect` | Social OAuth — YouTube live; others mock |
| POST | `/api/wallet` | Create Circle developer-controlled wallet |
| POST | `/api/wallet/balance` | Aggregated USDC balance via Circle DCW REST |
| POST | `/api/wallet/balance/request` | Faucet drip request |
| POST | `/api/wallet/transactions` | List wallet tx history |
| GET | `/api/wallet/transactions/[id]` | Single tx detail |
| PUT | `/api/wallet-set` | Update / create wallet-set association |
| GET | `/api/circle-proxy/[...path]` | Generic Circle REST proxy |
| POST | `/api/webhooks/circle` | Verified Circle webhook endpoint |
| POST | `/api/clipper/process` | Full video clipping pipeline |
| GET | `/api/clipper/download` | Signed download URL for clipped video |
| PATCH | `/api/clipper/update-transcript` | Re-transcribe with corrected text |
| POST | `/api/clipper/post-social` | Auto-post clip to YouTube/TikTok |
| GET | `/api/clipper/commission` | Estimated commission from clipped content |

---

## 12 · AI Agent Platform (unchanged core)

### Agent Creation — 5-step wizard

`app/dashboard/agents/create/page.tsx` (also reachable at `/agents/create` via agents layout)

| Step | Fields |
|---|---|
| Info | agent_name, description, welcome_message, avatar_url |
| Capabilities | capabilities (checkbox), specializations (checkbox) |
| Pricing | pricing_model (fixed/per_clip/per_hour), price_per_clip, price_per_hour, max_queue, auto_accept |
| Tools | llm_provider, llm_model, tools_enabled (checkbox) |
| Deploy | `POST /api/agents` → creates agent_profiles row |

### Agent Management — `app/dashboard/agents/page.tsx`

Client Component. Fetches `agent_profiles` via Supabase browser client. Actions:
- `toggleAvailability()` — switch `online ↔ offline`
- `deleteAgent()` — hard-delete with confirmation
- `reRegister()` — re-register as ERC-8004 on-chain identity
- Lists agent templates (Twitter/X, Shorts Clipper, Discord, Research, Support, Trading)
- Shows agent stats: reputation_score, total_jobs_completed, total_earnings

### Agent Types & Tools

Capabilities: Video Clipping, Auto-Caption, Thumbnail Generation, Audio Enhancement,
Transcript Extraction, Viral Hook Detection, Format Conversion, Color Grading, Background Removal.

Specializations: TikTok Clips, YouTube Shorts, IG Reels, Vertical Editing, Gaming Content,
Podcast Clips, Stream Highlights, Thumbnail Design, Caption Writing, Audio Cleanup, Viral Hooks.

Tools: OpenAI Vision, FFmpeg, Whisper, Stable Diffusion, ElevenLabs, Remotion, Auto-Caption, Chroma Key.

---

## 13 · Creator Products & Marketplace (unchanged core)

### Product Types

| Type | Value |
|---|---|
| Clip Pack | `clip_pack` |
| Template | `template` |
| Membership | `membership` |
| AI Automation | `automation` |
| Service | `service` |
| Community | `community` |

Delivery: `instant` (immediate access) or `escrow` (reviewed before release).

### AI Marketplace — `app/agents/marketplace/page.tsx`

Browse AI tools/APIs from **Agentic Market** (`api.agentic.market`). Paginated grid showing
featured providers (OpenAI, Anthropic, Deepgram, ElevenLabs, Tavily, Exa, The Graph) and a
full capability marketplace with categories: Search, Inference, Data, Media, Social, Infra,
Travel, Storage, Trading, Voice, Automation, Productivity, Blockchain.

---

## 14 · Video Clipper — `app/dashboard/clipper/page.tsx`

Full editor page (~850 lines):
1. **Upload** → Video + transcript text
2. **Transcript Edit** → auto-align, correction, char-per-scene
3. **Scenes Table** → duration, score, sentiment, brightness curve in one row per scene
4. **Bar-Chart Visualizer** → plot score/sentiment curves on an HTML canvas
5. **Clip Selection** → `App ClipRatingModal` (recommend single best sub-clip)
6. **Results + Actions** → `ClipperResultsTable` (named clips), download button, social post flow

### Clipper API

```bash
curl -X POST /api/clipper/process          # start or restart pipeline
GET  /api/clipper/download?id=clip_id     # signed download URL
PATCH /api/clipper/update-transcript      # re-transcribe with corrected text
POST /api/clipper/post-social             # auto-post clip to YouTube/TikTok
GET  /api/clipper/commission              # estimated earnings from clips
```

---

## 15 · Creator Verification

`app/api/verify/connect/route.ts` server + `app/dashboard/verify/page.tsx` client.

| Platform | Status |
|---|---|
| YouTube | Has live OAuth endpoint (server side, Google API) |
| TikTok, Instagram, Twitch, X | Mock data placeholder ⚠️ |
| Missing client ID error surface | Shows a dismissible alert when client ID/session absent |

---

## 16 · x402 Micro-payment Protocol — `lib/x402.ts`

Utility module that decodes ERC-20 `transferFrom` calls from Arc Testnet JSON-RPC, used to
gate access to premium content (courses). Verifies that a real Arc-blockchain payment of at
least `minAmount` has been paid to `receiverAddress` for the given `txHash`.

Flow:
1. On course page visit → fetch `/api/courses/[id]` with `Authorization: x402 <txhash>`
2. Course route handler → `verifyX402Payment(req)` → `callRpc("eth_getTransactionReceipt", [`0x${txHash}`])`
3. Verify `transfer` event `Transfer(from_orderer, deliveryAgent, amount)` exists on `0x3600000000000000000000000000000000000000` (USDC)
4. Return `412 Payment Required` if no matching `transfer` of sufficient `minAmount` found

Used in `app/api/courses/[id]/route.ts` — all courses gated behind mUSD payments on Arc Testnet.

---

## 17 · Supabase Auth Context

The application uses **Supabase Auth** with tokens that expire.
The `SupabaseAuthInterceptor` intercepts 401 errors from the backend and refreshes the
Supabase session using the stored refresh token before retrying the request.

The Supabase base table is `AgentAuthRecords`.

| Column | Type |
|---|---|
| id | uuid |
| auth_user_id | uuid |
| name | text |
| type | text |
| email | text |
| wallet_address | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| password_hash | text |

---

## 18 · Design System (`app/globals.css`)

All colours are **OKLCH CSS custom properties**, defined in both `:root` (light) and `.dark` blocks.

| Token | Light | Dark |
|---|---|---|
| bg | `oklch(0.97 0.005 80)` | `oklch(0.13 0.008 260)` |
| bg-elevated | `oklch(0.95 0.005 80)` | `oklch(0.16 0.01 260)` |
| bg-hover | `oklch(0.92 0.006 80)` | `oklch(0.19 0.012 260)` |
| bg-inset | `oklch(0.99 0.003 80)` | `oklch(0.10 0.006 260)` |
| fg | `oklch(0.15 0.01 260)` | `oklch(0.93 0.01 260)` |
| fg-secondary | `oklch(0.40 0.012 260)` | `oklch(0.65 0.015 260)` |
| fg-muted | `oklch(0.55 0.01 260)` | `oklch(0.45 0.012 260)` |
| bd | `oklch(0.85 0.008 80)` | `oklch(0.22 0.012 260)` |
| bd-hover | `oklch(0.75 0.01 80)` | `oklch(0.28 0.014 260)` |
| accent | `oklch(0.50 0.18 260)` | `oklch(0.55 0.15 260)` |
| accent-soft | `oklch(0.50 0.18 260 / 0.1)` | `oklch(0.55 0.15 260 / 0.12)` |
| success | — | `oklch(0.55 0.18 150)` |
| success-soft | — | `oklch(0.55 0.18 150 / 0.12)` |
| warning | — | `oklch(0.60 0.16 80)` |
| warning-soft | — | `oklch(0.60 0.16 80 / 0.12)` |
| error | — | `oklch(0.55 0.20 30)` |
| error-soft | — | `oklch(0.55 0.20 30 / 0.12)` |
| info | — | `oklch(0.50 0.18 260)` |
| info-soft | — | `oklch(0.50 0.18 260 / 0.12)` |

**Matching shadcn CSS variables** are also set in `:root` and `.dark` blocks for compatibility.

**Radius tokens:** `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px`, `--radius-xl: 16px`, `--radius-full: 9999px`.

**Animation utility classes:**
| Class | Effect |
|---|---|
| `animate-fade-in` | 0.2s opacity |
| `animate-fade-in-up` | 0.25s translateY 8px→0 |
| `animate-fade-in-down` | 0.2s translateY -4px→0 |
| `animate-scale-in` | 0.2s scale 0.95→1 |
| `animate-slide-in-right` | 0.2s translateX 8px→0 |
| `animate-pulse-soft` | 2s infinite opacity breath |
| `animate-skeleton` | 1.5s infinite shimmer gradient |
| `animate-float-subtle` | 6s translateY 0→-4px→0 |
| `animate-ticker` | 40s linear horizontal scroll |
| `stagger-1` | Staggered fade-in-up on child elements |
| `hover-lift` | translateY(-2px) + shadow on hover |
| `hover-scale` | scale(1.02) on hover |
| `classSidebarDetailView` | .sidebar-space override (previously `.stagger-1`) |
| `avatar-ring` | Focus/hover ring on avatar |

(Pitch deck pages use `framer-motion` directly instead of CSS classes.)

---

## 19 · File Sizes (largest, by source author)

| File | Approx. lines |
|---|---|
| `components/landing-page.tsx` | ~560 |
| `app/pitch/page.tsx` | ~1128 (includes embedded slide data) |
| `app/dashboard/clipper/page.tsx` | ~850 |
| `app/dashboard/agents/page.tsx` | ~425 |
| `app/dashboard/agents/create/page.tsx` | ~475 |
| `app/dashboard/products/create/page.tsx` | ~475 |
| `app/dashboard/products/page.tsx` | ~345 |
| `components/escrow-agreements.tsx` | ~450 |
| `components/escrow-agreements-item.tsx` | ~320 |
| `components/transactions.tsx` | ~430 |
| `lib/constants.ts` | ~200 (~42 KB bytecode blob) |
| `app/dashboard/page.tsx` | ~340 |
| `app/agents/marketplace/page.tsx` | ~390 |
| `app/agents/page.tsx` | ~425 |
| `components/nav-bar.tsx` | ~280 |

**NOTE:** `app/agents/create/page.tsx` and `app/dashboard/agents/create/page.tsx` appear to be identical
(21243 bytes each). The agents layout resolves `/agents/create`; both locations should be
consolidated to avoid drift.

---

## 20 · Conventions & Patterns

1. **Server Components by default.** Client components (`"use client"`) are only in `components/`
   and `app/dashboard/*`, `app/agents/*`, `app/explore/*` pages. All `app/api/*` and `app/layout.tsx` are RSC.
2. **No secrets client-side.** Circle keys, OpenAI key, Google secrets are `server`-only.
3. **Supabase client by context:** `@/lib/supabase/server-client.ts` for RSC/route handlers
   (`createSupabaseServerComponentClient` vs `createSupabaseReqResClient` with `req`/`res`);
   `@/lib/supabase/browser-client.ts` for `"use client"` components and hooks. A legacy copy
   lives at `lib/utils/supabase/`.
4. **Big blobs in `lib/constants.ts`.** Refund Protocol ABI + bytecode + SYSTEM_AGENT_ADDRESS.
5. **Toast via `sonner`:** `toast.success/error/info()` from `sonner`.
6. **Dynamic imports for heavy components:** e.g. `Transactions` uses
   `dynamic(() => import('@/components/transactions'), { ssr: false })`.
7. **Environment gating:** `hasEnvVars()` from `lib/utils/supabase/check-env-vars.ts` — if env vars
   are missing a standalone `EnvVarWarning` bar is shown instead of the real NavBar.
8. **Wallet created automatically on OAuth callback** — creates `creator_profiles`, `wallets`,
   `wallet_set` in one synchronous flow.
9. **Next theme default is dark** — `defaultTheme="dark" enableSystem` (suppresses transition on change).
10. **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** is the authoritative env var name (`_ANON_KEY` etc.
    are accepted as fallback aliases only where explicitly coded).
11. **Agent ERC-8004 identity** — Circle ERC-8004 implementation (https://erc-8004.org/).
    Once created, `erc8004_identity_address` is stored on `agent_profiles` and shown in `/agents`
    page with explorer link + "Onchain" badge.
12. **x402 payment gate** — `lib/x402.ts` decodes USDC `transferFrom` from Arc RPC to verify
    paid transactions for course content gating.
13. **Supabase auth token context** — The `SupabaseAuthInterceptor` ensures that 401 errors
    from the API surface automatically trigger a Supabase token refresh before retrying. This makes
    the Supabase auth context work transparently across all route handlers.
14. **Supabase AgentAuthRecords** — local table for server-side agent metadata sync.

---

## 21 · Self-Check Before Committing

When modifying this `ARCHITECTURE.md` or any code file:

- [ ] Do new routes / pages / components appear in §3 tree?
- [ ] Do new Supabase tables appear in §4 and has `types/database.types.ts` been regenerated?
- [ ] Are env-var changes reflected in §8 / `.env.example`?
- [ ] Are new API endpoints listed in §10?
- [ ] Does every API route handler have a `generate-wallet.mjs` entry?

Keep this file honest — it prevents the next agent (or you in a fresh session) from
re-scanning the whole tree.
