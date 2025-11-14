-- User Presets Table
-- Stores user-specific saved phrases and common descriptions
-- This enables Accorria to learn from each user's patterns

CREATE TABLE IF NOT EXISTS public.user_presets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    preset_type VARCHAR(50) NOT NULL, -- 'description_phrase', 'title_status', 'common_damage', etc.
    preset_value TEXT NOT NULL, -- The actual phrase/value (e.g., "front bumper cover", "rebuilt title")
    usage_count INTEGER DEFAULT 1, -- How many times user has used this
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique presets per user per type
    UNIQUE(user_id, preset_type, preset_value)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_presets_user_id ON public.user_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presets_type ON public.user_presets(preset_type);
CREATE INDEX IF NOT EXISTS idx_user_presets_usage ON public.user_presets(user_id, usage_count DESC);

-- Enable Row Level Security
ALTER TABLE public.user_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own presets
CREATE POLICY "Users can view own presets" ON public.user_presets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presets" ON public.user_presets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets" ON public.user_presets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets" ON public.user_presets
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update usage_count and last_used_at
CREATE OR REPLACE FUNCTION public.increment_preset_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_presets
    SET usage_count = usage_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We'll call this function from the backend when a preset is used
-- (Not using trigger since we need to check if preset exists first)

