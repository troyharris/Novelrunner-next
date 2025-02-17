-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
CREATE TYPE scene_status AS ENUM ('draft', 'in_progress', 'completed', 'revised');
CREATE TYPE episode_status AS ENUM ('not_started', 'in_progress', 'completed', 'revised');

-- Create users table to extend Supabase auth
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    target_word_count INTEGER NOT NULL,
    pace TEXT NOT NULL,
    status project_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS episodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_word_count INTEGER NOT NULL,
    current_word_count INTEGER DEFAULT 0,
    sequence_number INTEGER NOT NULL,
    status episode_status DEFAULT 'not_started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(project_id, sequence_number)
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    sequence_number INTEGER NOT NULL,
    status scene_status DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(episode_id, sequence_number)
);

-- Create research_notes table
CREATE TABLE IF NOT EXISTS research_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create worldbuilding_notes table
CREATE TABLE IF NOT EXISTS worldbuilding_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create synopses table
CREATE TABLE IF NOT EXISTS synopses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(project_id, episode_id)
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_episodes_project_id ON episodes(project_id);
CREATE INDEX idx_scenes_episode_id ON scenes(episode_id);
CREATE INDEX idx_research_notes_project_id ON research_notes(project_id);
CREATE INDEX idx_worldbuilding_notes_project_id ON worldbuilding_notes(project_id);
CREATE INDEX idx_synopses_project_id_episode_id ON synopses(project_id, episode_id);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE worldbuilding_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE synopses ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only access their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Episodes policies
CREATE POLICY "Users can view own episodes"
    ON episodes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = episodes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can create episodes in own projects"
    ON episodes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = episodes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own episodes"
    ON episodes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = episodes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own episodes"
    ON episodes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = episodes.project_id
        AND projects.user_id = auth.uid()
    ));

-- Scenes policies
CREATE POLICY "Users can view own scenes"
    ON scenes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM episodes
        JOIN projects ON episodes.project_id = projects.id
        WHERE episodes.id = scenes.episode_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can create scenes in own episodes"
    ON scenes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM episodes
        JOIN projects ON episodes.project_id = projects.id
        WHERE episodes.id = scenes.episode_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own scenes"
    ON scenes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM episodes
        JOIN projects ON episodes.project_id = projects.id
        WHERE episodes.id = scenes.episode_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own scenes"
    ON scenes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM episodes
        JOIN projects ON episodes.project_id = projects.id
        WHERE episodes.id = scenes.episode_id
        AND projects.user_id = auth.uid()
    ));

-- Research notes policies
CREATE POLICY "Users can view own research notes"
    ON research_notes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = research_notes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can create research notes in own projects"
    ON research_notes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = research_notes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own research notes"
    ON research_notes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = research_notes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own research notes"
    ON research_notes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = research_notes.project_id
        AND projects.user_id = auth.uid()
    ));

-- Worldbuilding notes policies
CREATE POLICY "Users can view own worldbuilding notes"
    ON worldbuilding_notes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = worldbuilding_notes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can create worldbuilding notes in own projects"
    ON worldbuilding_notes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = worldbuilding_notes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own worldbuilding notes"
    ON worldbuilding_notes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = worldbuilding_notes.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own worldbuilding notes"
    ON worldbuilding_notes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = worldbuilding_notes.project_id
        AND projects.user_id = auth.uid()
    ));

-- Synopses policies
CREATE POLICY "Users can view own synopses"
    ON synopses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = synopses.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can create synopses in own projects"
    ON synopses FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = synopses.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own synopses"
    ON synopses FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = synopses.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own synopses"
    ON synopses FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = synopses.project_id
        AND projects.user_id = auth.uid()
    ));

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
    BEFORE UPDATE ON episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at
    BEFORE UPDATE ON scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_notes_updated_at
    BEFORE UPDATE ON research_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worldbuilding_notes_updated_at
    BEFORE UPDATE ON worldbuilding_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_synopses_updated_at
    BEFORE UPDATE ON synopses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
