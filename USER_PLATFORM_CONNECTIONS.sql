-- User Platform Connections Table
-- Stores user-specific OAuth2 tokens for each platform (Facebook, Craigslist, etc.)
-- This enables multi-tenant architecture where each user connects their own accounts

-- Create user_platform_connections table
CREATE TABLE public.user_platform_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'facebook', 'craigslist', 'offerup', etc.
    platform_user_id VARCHAR(255), -- User's ID on the platform (Facebook user ID, etc.)
    platform_username VARCHAR(255), -- User's username/display name on platform
    access_token TEXT, -- Encrypted OAuth2 access token
    refresh_token TEXT, -- Encrypted OAuth2 refresh token (if available)
    token_expires_at TIMESTAMP WITH TIME ZONE, -- When the token expires
    scopes TEXT[], -- OAuth2 scopes granted (e.g., ['pages_manage_posts', 'pages_read_engagement'])
    platform_data JSONB, -- Additional platform-specific data (page IDs, permissions, etc.)
    is_active BOOLEAN DEFAULT TRUE, -- Whether the connection is active
    last_used_at TIMESTAMP WITH TIME ZONE, -- When the connection was last used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one connection per user per platform
    UNIQUE(user_id, platform)
);

-- Create indexes for performance
CREATE INDEX idx_user_platform_connections_user_id ON public.user_platform_connections(user_id);
CREATE INDEX idx_user_platform_connections_platform ON public.user_platform_connections(platform);
CREATE INDEX idx_user_platform_connections_active ON public.user_platform_connections(is_active);

-- Enable Row Level Security
ALTER TABLE public.user_platform_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own connections
CREATE POLICY "Users can view own platform connections" ON public.user_platform_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platform connections" ON public.user_platform_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platform connections" ON public.user_platform_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own platform connections" ON public.user_platform_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_platform_connections_updated_at 
    BEFORE UPDATE ON public.user_platform_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.user_platform_connections IS 'Stores OAuth2 tokens and connection data for each user''s platform accounts';
COMMENT ON COLUMN public.user_platform_connections.platform IS 'Platform name: facebook, craigslist, offerup, etc.';
COMMENT ON COLUMN public.user_platform_connections.platform_user_id IS 'User''s ID on the external platform';
COMMENT ON COLUMN public.user_platform_connections.access_token IS 'Encrypted OAuth2 access token for API calls';
COMMENT ON COLUMN public.user_platform_connections.platform_data IS 'Platform-specific data like Facebook page IDs, permissions, etc.';
