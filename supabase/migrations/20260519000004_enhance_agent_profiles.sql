-- ClipArc: Enhanced AI agent profiles
ALTER TABLE agent_profiles
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS pricing_model VARCHAR DEFAULT 'fixed',
    ADD COLUMN IF NOT EXISTS price_per_clip DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS availability_status VARCHAR DEFAULT 'online',
    ADD COLUMN IF NOT EXISTS max_queue INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS auto_accept BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS welcome_message TEXT,
    ADD COLUMN IF NOT EXISTS llm_provider VARCHAR DEFAULT 'openai',
    ADD COLUMN IF NOT EXISTS llm_model VARCHAR,
    ADD COLUMN IF NOT EXISTS tools_enabled TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS avg_response_time INTEGER, -- in minutes
    ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(20,8) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Agent reviews/ratings
CREATE TABLE IF NOT EXISTS agent_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
    reviewer_profile_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON agent_reviews
    FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews" ON agent_reviews
    FOR INSERT WITH CHECK (reviewer_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Agent products (auto-generated service listings)
CREATE TABLE IF NOT EXISTS agent_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    commission_percent DECIMAL(5,2) DEFAULT 100.00,
    auto_fulfill BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE agent_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agent products" ON agent_products
    FOR SELECT USING (true);

CREATE POLICY "Agent owners can manage" ON agent_products
    FOR ALL USING (
        agent_id IN (SELECT id FROM agent_profiles WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_reviews_agent ON agent_reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_specializations ON agent_profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities ON agent_profiles USING GIN(capabilities);
