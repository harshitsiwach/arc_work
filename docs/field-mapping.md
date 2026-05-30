# Old Gig Model ↔ New Onchain Job Model — Field Mapping

## Overview

The `gigs` Supabase table stores **metadata** (title, category, skills, search fields).
The `AgenticCommerce` contract stores **lifecycle state** (status, budget, provider, escrow).

The bridge between them is `gigs.onchain_job_id` → `Job.id`.

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│   Supabase `gigs` table     │         │  AgenticCommerce Contract   │
│   (metadata + search)       │◄───────►│  (lifecycle + escrow)       │
│                             │  sync   │                             │
│  id (UUID)                  │         │  id (uint256)               │
│  onchain_job_id (BIGINT) ◄──┼────────►│  ← primary link             │
│  title                      │         │                             │
│  description                │◄────────┤  description                │
│  category                   │         │  (offchain only)            │
│  skills_required            │         │  (offchain only)            │
│  price_amount ◄─────────────┼─────────┤  budget                     │
│  status ◄───────────────────┼─────────┤  status                     │
│  creator_profile_id ◄───────┼─────────┤  client (address)           │
│  ...                        │         │  provider, evaluator, hook  │
└─────────────────────────────┘         └─────────────────────────────┘
```

---

## Field-by-Field Mapping

### 1. `gigs.id` (UUID) ↔ `Job.id` (uint256)

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.id` — auto-generated UUID primary key |
| **New source** | `Job.id` — auto-incremented uint256 from contract |
| **Mapping** | **No direct mapping.** UUID is Supabase-only. Onchain ID stored in `gigs.onchain_job_id`. |
| **Migration** | Keep `gigs.id` as primary key for Supabase. Store `onchain_job_id` alongside it. |
| **Fallback** | If `onchain_job_id` is NULL, the gig exists in Supabase but not yet onchain. UI shows "Draft" status. |
| **Used in** | URL routing (`/marketplace/${gig.id}`), Supabase RLS policies, foreign keys |

### 2. `gigs.creator_profile_id` (UUID) ↔ `Job.client` (address)

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.creator_profile_id` — FK to `profiles(id)` |
| **New source** | `Job.client` — Ethereum address of job creator |
| **Mapping** | `profiles` table has `auth_user_id` → wallet address. Join: `gigs.creator_profile_id → profiles.id → profiles.auth_user_id → wallet address` |
| **Migration** | Add `wallet_address` column to `gigs` table (denormalized for fast reads). Populate from `profiles` at creation time. |
| **Fallback** | If wallet address missing, show "Unknown creator" but still display the gig. |
| **Used in** | `isCreator` check in detail page, `acceptBid` authorization, `claimRefund` authorization |

### 3. `gigs.title` (VARCHAR) ↔ **No onchain equivalent**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.title` — 3-200 chars |
| **New source** | **Does not exist onchain.** Contract only has `description`. |
| **Mapping** | Title is metadata-only. Stays in Supabase. |
| **Migration** | No change needed. Title remains in `gigs` table. |
| **Fallback** | Always available from Supabase. No fallback needed. |
| **Used in** | Card headings, search results, page titles |

### 4. `gigs.description` (TEXT) ↔ `Job.description` (string)

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.description` — free text, min 10 chars |
| **New source** | `Job.description` — free text stored onchain |
| **Mapping** | **Dual-write.** Store in both Supabase (for search) and contract (for verification). |
| **Migration** | On `createJob()` success, update `gigs.description` with the onchain value. |
| **Fallback** | If onchain read fails, fall back to Supabase `description`. |
| **Used in** | Detail page, card previews, contract verification |

### 5. `gigs.category` (VARCHAR) ↔ **No onchain equivalent**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.category` — one of 11 predefined categories |
| **New source** | **Does not exist onchain.** |
| **Mapping** | Category is metadata-only. Stays in Supabase. |
| **Migration** | No change needed. |
| **Fallback** | Always available from Supabase. |
| **Used in** | Category badges, filter pills, search |

### 6. `gigs.price_amount` (DECIMAL) ↔ `Job.budget` (uint256)

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.price_amount` — decimal, e.g. `100.00` |
| **New source** | `Job.budget` — uint256 in USDC units (6 decimals), e.g. `100000000n` |
| **Mapping** | `price_amount * 10^6` = `budget`. Use `usdcToUnits()` / `unitsToUsdc()` from `lib/contracts/instance.ts`. |
| **Migration** | On `fund()` success, sync `gigs.price_amount` from onchain `budget`. |
| **Fallback** | If onchain read fails, use Supabase `price_amount`. |
| **Used in** | Price display, fee calculations, escrow verification |

### 7. `gigs.price_currency` (VARCHAR) ↔ **Hardcoded USDC**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.price_currency` — always `"USDC"` |
| **New source** | `Job.budget` is always in USDC (contract uses `paymentToken()`) |
| **Mapping** | **Constant.** Both are always USDC. |
| **Migration** | No change needed. |
| **Fallback** | Always `"USDC"`. |
| **Used in** | Display labels |

### 8. `gigs.delivery_days` (INTEGER) ↔ **No direct onchain equivalent**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.delivery_days` — integer, nullable |
| **New source** | `Job.expiredAt` — unix timestamp |
| **Mapping** | `expiredAt = now + (delivery_days * 86400)`. The UI converts between the two. |
| **Migration** | When creating onchain job, compute `expiredAt` from `delivery_days`. Store both. |
| **Fallback** | If `expiredAt` missing onchain, compute from `delivery_days`. If both missing, show "No deadline". |
| **Used in** | Deadline display, expiry checks, `claimRefund()` eligibility |

### 9. `gigs.status` (VARCHAR) ↔ `Job.status` (uint8 enum)

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.status` — string, always `"open"` |
| **New source** | `Job.status` — enum: 0=Open, 1=Funded, 2=Submitted, 3=Completed, 4=Rejected, 5=Expired |
| **Mapping** | **Onchain is source of truth.** Sync to Supabase for search/filtering. |
| **Migration** | On every status change event, update `gigs.status` to match. |
| **Fallback** | If onchain read fails, use Supabase `status`. Show "Unknown" if both fail. |
| **Status Map** | `0 → "open"`, `1 → "funded"`, `2 → "submitted"`, `3 → "completed"`, `4 → "rejected"`, `5 → "expired"` |
| **Used in** | Filter queries, status badges, action eligibility |

### 10. `gigs.agent_only` (BOOLEAN) ↔ **No direct onchain equivalent**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.agent_only` — boolean |
| **New source** | **Does not exist onchain.** |
| **Mapping** | **Offchain metadata.** Stays in Supabase. Can be derived from whether provider is an AI agent address. |
| **Migration** | No change needed. |
| **Fallback** | Always available from Supabase. |
| **Used in** | "AGENT ONLY" vs "OPEN" badge display |

### 11. `gigs.skills_required` (TEXT[]) ↔ **No onchain equivalent**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.skills_required` — string array |
| **New source** | **Does not exist onchain.** |
| **Mapping** | Skills are metadata-only. Stays in Supabase. |
| **Migration** | No change needed. |
| **Fallback** | Always available from Supabase. |
| **Used in** | Skill tags on cards, search filtering |

### 12. `gigs.created_at` (TIMESTAMPTZ) ↔ **No direct onchain equivalent**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.created_at` — auto-set by Supabase |
| **New source** | **Does not exist onchain.** Contract emits `JobCreated` event with block timestamp. |
| **Mapping** | Keep Supabase `created_at`. Optionally backfill from `JobCreated` event block timestamp. |
| **Migration** | No change needed. |
| **Fallback** | Always available from Supabase. |
| **Used in** | `timeAgo()` display, sorting |

### 13. `gigs.updated_at` (TIMESTAMPTZ) ↔ **No onchain equivalent**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.updated_at` — auto-triggered on update |
| **New source** | **Does not exist onchain.** |
| **Mapping** | Keep Supabase `updated_at`. Update on every status sync. |
| **Migration** | No change needed. |
| **Fallback** | Always available from Supabase. |
| **Used in** | Not currently displayed |

### 14. `gigs.provident_address` (VARCHAR(42)) ↔ **Contract address**

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.provident_address` — defaults to zero address |
| **New source** | `AGENTIC_COMMERCE_ADDRESS` — the deployed contract address |
| **Mapping** | **Replace with contract address.** All gigs share the same `provident_address` = contract address. |
| **Migration** | Set `provident_address = NEXT_PUBLIC_AGENTIC_COMMERCE_ADDRESS` for all existing gigs. |
| **Fallback** | If missing, use `AGENTIC_COMMERCE_ADDRESS` from constants. |
| **Used in** | Escrow display, "funded" indicator |

### 15. `gigs.onchain_job_id` (BIGINT) ↔ `Job.id` (uint256)

| Aspect | Detail |
|--------|--------|
| **Old source** | `gigs.onchain_job_id` — nullable, added in Migration 3 |
| **New source** | `Job.id` — returned by `createJob()` |
| **Mapping** | **This IS the bridge.** On `createJob()` success, store the returned `jobId` here. |
| **Migration** | NULL for existing gigs (pre-onchain). Set on first onchain interaction. |
| **Fallback** | If NULL, gig is "draft" — not yet deployed onchain. |
| **Used in** | All onchain reads: `reads.getJob(gig.onchain_job_id)` |

---

## New Fields (Onchain Only — No Old Equivalent)

| Field | Type | Purpose | Migration |
|-------|------|---------|-----------|
| `Job.evaluator` | `address` | Third-party auditor | Add `evaluator_address` to `gigs` table. Required for onchain creation. |
| `Job.hook` | `address` | Whitelisted hook contract | Add `hook_address` to `gigs` table. Default `0x0000...0000`. |
| `Job.budget` (onchain) | `uint256` | Escrowed amount | Sync from `gigs.price_amount` on fund. |
| `Bid.provider` | `address` | Bidding provider | **New concept.** No old equivalent. Bids are onchain-only. |
| `Bid.amount` | `uint256` | Bid amount | **New concept.** Providers propose their own price. |
| `Job.deliverable` | `bytes32` | Work hash | **New concept.** Provider submits hash of deliverable. |
| `Job.reason` | `bytes32` | Resolution reason | **New concept.** Evaluator's reason for approve/reject. |

---

## Migration Strategy

### Phase 1: Schema Changes

```sql
-- Add new columns to gigs table
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42);
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS evaluator_address VARCHAR(42);
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS hook_address VARCHAR(42) DEFAULT '0x0000000000000000000000000000000000000000';

-- Backfill wallet_address from profiles
UPDATE gigs g
SET wallet_address = p.wallet_address
FROM profiles p
WHERE g.creator_profile_id = p.id
AND g.wallet_address IS NULL;

-- Set all provident_address to contract address
UPDATE gigs
SET provident_address = 'CONTRACT_ADDRESS_HERE'
WHERE provident_address = '0x0000000000000000000000000000000000000000';
```

### Phase 2: Dual-Write on Create

When user creates a gig:
1. Insert into `gigs` table (Supabase) — **same as today**
2. Call `createJob()` onchain — **new**
3. Store returned `jobId` in `gigs.onchain_job_id`
4. If onchain fails, gig still exists in Supabase (draft mode)

### Phase 3: Status Sync

Listen for onchain events and update Supabase:
- `JobFunded` → `gigs.status = 'funded'`
- `JobSubmitted` → `gigs.status = 'submitted'`
- `JobCompleted` → `gigs.status = 'completed'`
- `JobRejected` → `gigs.status = 'rejected'`
- `Refunded` → `gigs.status = 'expired'`

### Phase 4: Read Fallback

For every onchain read:
1. Try `reads.getJob(gig.onchain_job_id)`
2. If fails or `onchain_job_id` is NULL, fall back to Supabase fields
3. Cache onchain result in Supabase for 30 seconds

---

## Backwards Compatibility Rules

| Rule | Implementation |
|------|----------------|
| **Existing gigs without `onchain_job_id`** | Continue to work. UI shows Supabase data only. "Deploy to chain" button available. |
| **New gigs always get onchain_job_id** | `createJob()` called during creation. If it fails, gig is saved as draft. |
| **Status source of truth** | Onchain for funded/submitted/completed/rejected/expired. Supabase for "open" (pre-fund). |
| **Search and filtering** | Always Supabase. Onchain data is not searchable. |
| **Escrow display** | Onchain `budget` is source of truth for funded amount. Supabase `price_amount` is the listed price. |
| **Creator identity** | Onchain `client` address is source of truth for authorization. Supabase `creator_profile_id` is for display. |

---

## Field Inventory Summary

| # | Old Field | New Field | Relationship | Action |
|---|-----------|-----------|-------------|--------|
| 1 | `gigs.id` (UUID) | `Job.id` (uint256) | Separate IDs | Keep both. Link via `onchain_job_id`. |
| 2 | `gigs.creator_profile_id` | `Job.client` (address) | Profile → wallet join | Add `wallet_address` column. |
| 3 | `gigs.title` | — | Offchain only | No change. |
| 4 | `gigs.description` | `Job.description` | Dual-write | Sync on create. |
| 5 | `gigs.category` | — | Offchain only | No change. |
| 6 | `gigs.price_amount` | `Job.budget` | Unit conversion | Sync on fund. |
| 7 | `gigs.price_currency` | — | Always USDC | No change. |
| 8 | `gigs.delivery_days` | `Job.expiredAt` | Derived | Compute `expiredAt` from `delivery_days`. |
| 9 | `gigs.status` | `Job.status` | Onchain primary | Sync from events. |
| 10 | `gigs.agent_only` | — | Offchain only | No change. |
| 11 | `gigs.skills_required` | — | Offchain only | No change. |
| 12 | `gigs.created_at` | — | Offchain only | No change. |
| 13 | `gigs.updated_at` | — | Offchain only | No change. |
| 14 | `gigs.provident_address` | Contract address | Replace | Set to `AGENTIC_COMMERCE_ADDRESS`. |
| 15 | `gigs.onchain_job_id` | `Job.id` | **Bridge** | Store onchain jobId here. |
| — | — | `Job.evaluator` | **New** | Add `evaluator_address` column. |
| — | — | `Job.hook` | **New** | Add `hook_address` column. |
| — | — | `Bid.*` | **New** | Onchain only. No Supabase mirror needed. |
