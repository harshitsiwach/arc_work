-- ClipArc: Products, purchases, creator profiles, revenue splits

-- Products table (clipping packs, templates, memberships)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_profile_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR NOT NULL,
    description TEXT,
    price_amount DECIMAL(20, 8) NOT NULL,
    price_currency VARCHAR NOT NULL DEFAULT 'USDC',
    product_type VARCHAR NOT NULL DEFAULT 'clip_pack',
    delivery_type VARCHAR NOT NULL DEFAULT 'instant',
    media_urls TEXT[] DEFAULT '{}',
    file_url TEXT,
    access_url TEXT,
    status VARCHAR NOT NULL DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage own products" ON products
    FOR ALL USING (creator_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Product purchases
CREATE TABLE product_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    buyer_profile_id UUID NOT NULL REFERENCES profiles(id),
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR NOT NULL DEFAULT 'USDC',
    status VARCHAR NOT NULL DEFAULT 'completed',
    tx_hash VARCHAR,
    delivered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own purchases" ON product_purchases
    FOR SELECT USING (buyer_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Creators can view purchases of own products" ON product_purchases
    FOR SELECT USING (
        product_id IN (SELECT id FROM products WHERE creator_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    );

-- Creator extended profiles
CREATE TABLE creator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id),
    display_name VARCHAR,
    bio TEXT,
    avatar_url TEXT,
    website VARCHAR,
    social_links JSONB DEFAULT '{}',
    verified_metrics JSONB DEFAULT '{}',
    total_sales DECIMAL(20, 8) DEFAULT 0,
    total_products INTEGER DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view creator profiles" ON creator_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own creator profile" ON creator_profiles
    FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Social account verifications
CREATE TABLE creator_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_profile_id UUID NOT NULL REFERENCES creator_profiles(id),
    platform VARCHAR NOT NULL,
    platform_username VARCHAR,
    platform_user_id VARCHAR,
    followers INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    raw_response JSONB DEFAULT '{}',
    CONSTRAINT unique_platform_per_creator UNIQUE (creator_profile_id, platform)
);

ALTER TABLE creator_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verifications" ON creator_verifications
    FOR SELECT USING (true);

CREATE POLICY "Creators can manage own verifications" ON creator_verifications
    FOR ALL USING (creator_profile_id IN (
        SELECT cp.id FROM creator_profiles cp 
        JOIN profiles p ON p.id = cp.profile_id 
        WHERE p.auth_user_id = auth.uid()
    ));

-- Revenue split rules
CREATE TABLE revenue_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    recipient_address VARCHAR NOT NULL,
    recipient_label VARCHAR,
    share_percent DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE revenue_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view splits" ON revenue_splits
    FOR SELECT USING (true);

CREATE POLICY "Creators can manage splits" ON revenue_splits
    FOR ALL USING (
        product_id IN (SELECT id FROM products WHERE creator_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    );

-- Indexes
CREATE INDEX idx_products_creator ON products(creator_profile_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_purchases_product ON product_purchases(product_id);
CREATE INDEX idx_purchases_buyer ON product_purchases(buyer_profile_id);
CREATE INDEX idx_creator_verifications_platform ON creator_verifications(platform);
CREATE INDEX idx_revenue_splits_product ON revenue_splits(product_id);

-- Triggers
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at
    BEFORE UPDATE ON creator_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
