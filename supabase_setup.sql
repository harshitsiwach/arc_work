-- =============================================================================
-- ARC_WORK: Complete Database Setup (consolidated from all migrations)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- =============================================================================

-- 0. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES (core user table, separate UUID from auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    email VARCHAR(320),
    full_name VARCHAR(255),
    company_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(auth_user_id)
);

-- =============================================================================
-- 2. WALLETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    circle_wallet_id VARCHAR NOT NULL,
    wallet_type VARCHAR NOT NULL,
    balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
    currency VARCHAR NOT NULL,
    wallet_set_id UUID,
    wallet_address VARCHAR(255),
    account_type VARCHAR(50),
    blockchain VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- =============================================================================
-- 3. TRANSACTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    circle_transaction_id VARCHAR,  -- nullable
    transaction_type VARCHAR NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    description TEXT,
    escrow_agreement_id UUID,       -- added later, FK below
    circle_contract_address VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. ESCROW AGREEMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS escrow_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_wallet_id UUID NOT NULL REFERENCES wallets(id),
    depositor_wallet_id UUID NOT NULL REFERENCES wallets(id),
    transaction_id UUID REFERENCES transactions(id),
    circle_contract_id UUID,
    status VARCHAR NOT NULL,
    disbursement_date TIMESTAMP WITH TIME ZONE,
    terms JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FK from transactions → escrow_agreements (added by migration 20241119194545)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transactions_escrow_agreement_id_fkey'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT transactions_escrow_agreement_id_fkey
      FOREIGN KEY (escrow_agreement_id)
      REFERENCES escrow_agreements(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================================================
-- 5. DISPUTE RESOLUTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS dispute_resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_agreement_id UUID NOT NULL REFERENCES escrow_agreements(id),
    resolver_profile_id UUID NOT NULL REFERENCES profiles(id),
    status VARCHAR NOT NULL,
    resolution_type VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 6. GIGS (marketplace)
-- =============================================================================
CREATE TABLE IF NOT EXISTS gigs (
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

-- =============================================================================
-- 7. AGENT PROFILES (ERC-8004)
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_profiles (
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
    -- enhanced columns
    avatar_url TEXT,
    pricing_model VARCHAR DEFAULT 'fixed',
    price_per_clip DECIMAL(10,2),
    price_per_hour DECIMAL(10,2),
    specializations TEXT[] DEFAULT '{}',
    portfolio_urls TEXT[] DEFAULT '{}',
    availability_status VARCHAR DEFAULT 'online',
    max_queue INTEGER DEFAULT 5,
    auto_accept BOOLEAN DEFAULT false,
    welcome_message TEXT,
    llm_provider VARCHAR DEFAULT 'openai',
    llm_model VARCHAR,
    tools_enabled TEXT[] DEFAULT '{}',
    avg_response_time INTEGER,
    total_earnings DECIMAL(20,8) DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. PRODUCTS (ClipArc)
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
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

-- =============================================================================
-- 9. PRODUCT PURCHASES
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_purchases (
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

-- =============================================================================
-- 10. CREATOR PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS creator_profiles (
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

-- =============================================================================
-- 11. CREATOR VERIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS creator_verifications (
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

-- =============================================================================
-- 12. REVENUE SPLITS
-- =============================================================================
CREATE TABLE IF NOT EXISTS revenue_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    recipient_address VARCHAR NOT NULL,
    recipient_label VARCHAR,
    share_percent DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 13. AGENT REVIEWS
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
    reviewer_profile_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 14. AGENT PRODUCTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    commission_percent DECIMAL(5,2) DEFAULT 100.00,
    auto_fulfill BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_wallets_profile_id ON wallets(profile_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_profile_id ON transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_escrow_agreement_id ON transactions(escrow_agreement_id);
CREATE INDEX IF NOT EXISTS idx_escrow_agreements_transaction_id ON escrow_agreements(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_agreements_beneficiary_wallet_id ON escrow_agreements(beneficiary_wallet_id);
CREATE INDEX IF NOT EXISTS idx_escrow_agreements_depositor_wallet_id ON escrow_agreements(depositor_wallet_id);
CREATE INDEX IF NOT EXISTS idx_dispute_resolutions_escrow_agreement_id ON dispute_resolutions(escrow_agreement_id);
CREATE INDEX IF NOT EXISTS idx_dispute_resolutions_resolver_profile_id ON dispute_resolutions(resolver_profile_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category);
CREATE INDEX IF NOT EXISTS idx_gigs_creator ON gigs(creator_profile_id);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_profile ON agent_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_products_creator ON products(creator_profile_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON product_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON product_purchases(buyer_profile_id);
CREATE INDEX IF NOT EXISTS idx_creator_verifications_platform ON creator_verifications(platform);
CREATE INDEX IF NOT EXISTS idx_revenue_splits_product ON revenue_splits(product_id);
CREATE INDEX IF NOT EXISTS idx_agent_reviews_agent ON agent_reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_specializations ON agent_profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities ON agent_profiles USING GIN(capabilities);


-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- updated_at auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DO $$ BEGIN
  -- profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  -- wallets
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_wallets_updated_at') THEN
    CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  -- escrow_agreements
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_escrow_agreements_updated_at') THEN
    CREATE TRIGGER update_escrow_agreements_updated_at BEFORE UPDATE ON escrow_agreements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  -- gigs
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gigs_updated_at') THEN
    CREATE TRIGGER update_gigs_updated_at BEFORE UPDATE ON gigs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  -- agent_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_agent_profiles_updated_at') THEN
    CREATE TRIGGER update_agent_profiles_updated_at BEFORE UPDATE ON agent_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  -- products
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  -- creator_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_creator_profiles_updated_at') THEN
    CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON creator_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    display_name TEXT;
    new_profile_id UUID;
BEGIN
    display_name := COALESCE(
        (NEW.raw_user_meta_data->>'full_name'),
        split_part(NEW.email, '@', 1),
        NEW.email
    );

    BEGIN
        INSERT INTO public.profiles (auth_user_id, name, email)
        VALUES (NEW.id, display_name, NEW.email)
        RETURNING id INTO new_profile_id;

        RAISE LOG 'Created profile % for auth user %', new_profile_id, NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
    END;

    RETURN NEW;
END;
$$;

-- Drop and recreate trigger to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- DISABLE RLS FOR DEVELOPMENT (all tables)
-- =============================================================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_agreements DISABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_resolutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE gigs DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE creator_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_splits DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_products DISABLE ROW LEVEL SECURITY;


-- =============================================================================
-- PERMISSIONS  (so the anon key used by the app can read/write)
-- =============================================================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO anon;
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO authenticated;
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO service_role;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;


-- =============================================================================
-- ENABLE REALTIME (for transactions, escrow_agreements, wallets)
-- =============================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Could not add transactions to realtime: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE escrow_agreements;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Could not add escrow_agreements to realtime: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE wallets;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Could not add wallets to realtime: %', SQLERRM;
END $$;


-- =============================================================================
-- DONE! Your database is fully set up.
-- =============================================================================
