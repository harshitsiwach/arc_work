-- Fix RLS policies for gigs and agent_profiles
-- auth.uid() returns auth.users.id, but creator_profile_id/profiles.id are different UUIDs

DROP POLICY IF EXISTS "Anyone can view open gigs" ON gigs;
DROP POLICY IF EXISTS "Users can create gigs" ON gigs;
DROP POLICY IF EXISTS "Creators can update own gigs" ON gigs;

CREATE POLICY "Anyone can view open gigs" ON gigs
    FOR SELECT USING (
        status = 'open' OR 
        creator_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can create gigs" ON gigs
    FOR INSERT WITH CHECK (
        creator_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Creators can update own gigs" ON gigs
    FOR UPDATE USING (
        creator_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );

-- Fix agent_profiles too (same issue)
DROP POLICY IF EXISTS "Users can manage own agents" ON agent_profiles;

CREATE POLICY "Users can manage own agents" ON agent_profiles
    FOR ALL USING (
        profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );
