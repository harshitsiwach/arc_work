-- =============================================================================
-- BOUNTIES (Bounty Board)
-- =============================================================================
CREATE TABLE IF NOT EXISTS bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_usdc NUMERIC(18,6) NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    worker_type TEXT NOT NULL CHECK (worker_type IN ('HUMAN', 'AGENT', 'BOTH')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FUNDED', 'SUBMITTED', 'COMPLETED', 'REFUNDED', 'DISPUTED')),
    winner_id UUID REFERENCES auth.users(id),
    contract_bounty_id TEXT,
    escrow_tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BOUNTY SUBMISSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS bounty_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
    submitter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    proof_hash TEXT NOT NULL,
    proof_url TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    ai_validation_score NUMERIC,
    ai_validation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for bounties
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bounties" ON bounties FOR SELECT USING (true);
CREATE POLICY "Creator can insert bounty" ON bounties FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator can update own bounty" ON bounties FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Anyone can read submissions" ON bounty_submissions FOR SELECT USING (true);
CREATE POLICY "Submitter can insert submission" ON bounty_submissions FOR INSERT WITH CHECK (auth.uid() = submitter_id);
