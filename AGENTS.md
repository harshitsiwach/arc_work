# ClipArc (arc_work) — Agent Notes

> Decentralized creator marketplace on Circle's Arc testnet.
> Next.js 14 + Supabase + Arc Testnet (Chain ID 5042002) + Reown AppKit.
> Branch: `master`. React 18, TypeScript 5.3, Tailwind v4, framer-motion.

## Quick start (order matters)

1. `cp .env.example .env.local` — fill `CIRCLE_API_KEY` and `CIRCLE_ENTITY_SECRET` only. Leave wallet/blockchain vars blank.
2. `npm run generate-wallet` — auto-writes `NEXT_PUBLIC_AGENT_WALLET_ID/ADDRESS` and `CIRCLE_BLOCKCHAIN=ARC-TESTNET` into `.env.local`. Required before dev; the app breaks on wallet reads if skipped.
3. Supabase: local `npx supabase start && npx supabase migration up` (Docker) or remote `npx supabase link --project-ref <ref> && npx supabase db push`.
4. `npm run dev` (Next.js on `:3000`) and/or `npm run dev:editor` (OpenReel on `:5173`), or `npm run dev:all` for both concurrently.

## Commands

| Task | Command |
| --- | --- |
| Dev (Next) | `npm run dev` |
| Dev (editor) | `npm run dev:editor` (uses `pnpm`; needs `editor/pnpm-lock.yaml`) |
| Dev (both) | `npm run dev:all` |
| Build / Start | `npm run build` / `npm start` |
| Lint | `npx next lint` (no `npm run lint` script exists) |
| Typecheck | `npx tsc --noEmit` (no `npm run typecheck` script) |
| Tests | none at root — do not invent `npm test` |
| Editor sub-app | `cd editor && pnpm -r typecheck` / `pnpm -r test:run` / `pnpm -r lint` |
| Agent wallet | `npm run generate-wallet` (one-shot; rewrites `.env.local`) |

## Layout

- `app/` — Next.js app router. Top-level routes: `/`, `/explore`, `/agents`, `/agents/create`, `/agents/marketplace`, `/dashboard/*`.
- `components/` — shared UI; shadcn/ui primitives in `components/ui/`.
- `hooks/` — escrow transaction hooks (`use-fund-job`, `use-claim-refund`, `use-submit-work`, `use-accept-bid`, …).
- `lib/web3/` — Reown AppKit + wallet providers. `lib/web3/appkit-provider.tsx` registers Arc testnet as a custom chain.
- `lib/supabase/`, `lib/contracts/`, `lib/x402.ts`.
- `editor/` — pnpm-workspace Vite sub-app (OpenReel video editor). **Excluded from root `tsconfig.json`**; has its own scripts.
- `contracts/` — Solidity (`RefundProtocol.sol`, `SubscriptionController.sol`).
- `supabase.bak/migrations/` — SQL migrations.

## Conventions & gotchas

- `.npmrc` has `legacy-peer-deps=true`. Keep it — removing breaks install (mixed React 18 / wagmi 3 / wallet-SDK peer ranges).
- Path alias: `@/*` → repo root.
- `middleware.ts` only auth-gates `/dashboard/*`. `/explore`, `/agents`, `/agents/marketplace`, and `/` are public.
- `next.config.js` rewrites `/api/circle-direct/:path*` → `https://api.circle.com/:path*`; swap quote lives at `/api/swap`. Always call Circle server-side; the browser hits CORS otherwise.
- `app/layout.tsx` already wraps content in `max-w-7xl mx-auto px-4 sm:px-6 py-6` — don't add a second page-level container.
- `next.config.js` marks `pdf-parse`, `mammoth`, `openai` as `serverComponentsExternalPackages`; keep them server-only.
- Design tokens: `var(--color-accent)`, `var(--color-bg-elevated)`, `var(--color-bd)`. OKLCH dark-first, light supported. See `DESIGN.md`.
- Animation lib is `framer-motion`; respect `prefers-reduced-motion`.
- Arc testnet constants: Chain ID `5042002`, RPC `https://rpc.testnet.arc.network`, USDC `0x3600000000000000000000000000000000000000`, EURC `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`.
- Signup rate limit: Supabase email signups cap at 2/hr by default; local Inbucket at `http://127.0.0.1:54324`.

## Things that look done but aren't

- Marketplace "Buy" records a purchase in DB but does **not** transfer real USDC. Don't verify on-chain settlement there.
- Social verification (YouTube / TikTok / IG / Twitch / X) is mock data unless OAuth keys are configured.
- `useWalletBalance.ts` must handle `undefined` walletId and not spam toasts on failure. Do not "fix" by adding retry storms.
- `wallet-balance.tsx` mirrors the same `undefined` walletId rule.

## Key files

| File | Purpose |
| --- | --- |
| `app/layout.tsx` | Root layout, providers, page container. |
| `middleware.ts` | Auth gating (dashboard only). |
| `lib/web3/appkit-provider.tsx` | Reown AppKit config + Arc testnet registration. |
| `lib/web3/wallet-provider.tsx` | Wallet context provider. |
| `lib/supabase/` | Supabase clients (server + browser). |
| `supabase.bak/migrations/` | All DB schema migrations. |
| `editor/` | OpenReel video editor (pnpm workspace). |
| `.env.local` | Local env (gitignored). Required for dev. |

## Environment variables

| Variable | Scope | Source / notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | `app.supabase.com` → Project Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | `app.supabase.com` → Project Settings (`.env.example` uses `_PUBLISHABLE_KEY` name) |
| `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS` | public | Arc testnet: `0x36…0000` |
| `NEXT_PUBLIC_EURC_CONTRACT_ADDRESS` | public | Arc testnet: `0x89B5…D72a` |
| `NEXT_PUBLIC_AGENTIC_COMMERCE_ADDRESS` | public | ERC-8183 job marketplace contract |
| `NEXT_PUBLIC_CIRCLE_KIT_KEY` | public | Format `KIT_KEY:<id>:<secret>`; `developers.circle.com/w3s/keys#kit-keys` |
| `NEXT_PUBLIC_TRANSAK_API_KEY` | public | Transak staging key |
| `CIRCLE_API_KEY` | server | `console.circle.com` → API Keys |
| `CIRCLE_ENTITY_SECRET` | server | Generated + registered via SDK |
| `CIRCLE_BLOCKCHAIN` | server | Auto-set to `ARC-TESTNET` by `generate-wallet` |
| `NEXT_PUBLIC_AGENT_WALLET_ID` | public | Auto-set by `generate-wallet` |
| `NEXT_PUBLIC_AGENT_WALLET_ADDRESS` | public | Auto-set by `generate-wallet` |
| `OPENAI_API_KEY` | server | For AI work validation |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | server | Google sign-in (optional) |
| `VERCEL_URL` / `NEXT_PUBLIC_VERCEL_URL` | both | Base URL of deployment |

## CI

`.github/workflows/workflow.yml` is a weekly repository-traffic cron, not a build/lint/test pipeline. There is no CI to gate on — verify with `npx next lint` and `npx tsc --noEmit` locally.

## References

- `ARCHITECTURE.md` — system architecture.
- `llms.txt` — full project context for LLMs.
- `DESIGN.md` / `PRODUCT.md` — design and product context.
- `STATUS.md` — recent IA / nav restructure worklog and current routes.
- `.agents/skills/` — vendored skills: `appkit`, `impeccable`, `oauth`, `supabase-postgres-best-practices`.
