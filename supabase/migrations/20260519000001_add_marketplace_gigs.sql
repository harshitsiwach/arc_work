-- Marketplace: Gigs table
CREATE TABLE gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_profile_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR NOT NULL DEFAULT 'other',
    price_amount DECIMAL(20, 8) NOT NULL,
    price_currency VARCHAR NOT NULL DEFAULT 'USDC',
    delivery_days INTEGER,
    status VARCHAR NOT NULL DEFAULT 'open',
    agent_only BOOLEAN DEFAULT false,
    skills_required TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open gigs" ON gigs
    FOR SELECT USING (status = 'open' OR creator_profile_id = auth.uid());

CREATE POLICY "Users can create gigs" ON gigs
    FOR INSERT WITH CHECK (creator_profile_id = auth.uid());

CREATE POLICY "Creators can update own gigs" ON gigs
    FOR UPDATE USING (creator_profile_id = auth.uid());

-- Agent profiles (ERC-8004)
CREATE TABLE agent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    agent_name VARCHAR NOT NULL,
    agent_type VARCHAR NOT NULL DEFAULT 'ai',
    description TEXT,
    erc8004_identity_address VARCHAR,
    erc8004_agent_id BIGINT,
    reputation_score DECIMAL(5,2) DEFAULT 0,
    total_jobs_completed INTEGER DEFAULT 0,
    capabilities TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agent profiles" ON agent_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own agents" ON agent_profiles
    FOR ALL USING (profile_id = auth.uid());

-- Add indexes
CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_category ON gigs(category);
CREATE INDEX idx_gigs_creator ON gigs(creator_profile_id);
CREATE INDEX idx_agent_profiles_profile ON agent_profiles(profile_id);

-- Trigger for gigs updated_at
CREATE TRIGGER update_gigs_updated_at
    BEFORE UPDATE ON gigs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_profiles_updated_at
    BEFORE UPDATE ON agent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
