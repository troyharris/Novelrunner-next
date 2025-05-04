-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create scene_types table
CREATE TABLE IF NOT EXISTS scene_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create scene_types_junction table
CREATE TABLE IF NOT EXISTS scene_types_junction (
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    scene_type_id UUID REFERENCES scene_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (scene_id, scene_type_id)
);

-- Create scene_characters table
CREATE TABLE IF NOT EXISTS scene_characters (
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (scene_id, character_id)
);

-- Create scene_synopsis table
CREATE TABLE IF NOT EXISTS scene_synopsis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE UNIQUE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_scene_types_junction_scene_id ON scene_types_junction(scene_id);
CREATE INDEX idx_scene_types_junction_type_id ON scene_types_junction(scene_type_id);
CREATE INDEX idx_scene_characters_scene_id ON scene_characters(scene_id);
CREATE INDEX idx_scene_characters_character_id ON scene_characters(character_id);
CREATE INDEX idx_scene_synopsis_scene_id ON scene_synopsis(scene_id);

-- Enable RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_types_junction ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_synopsis ENABLE ROW LEVEL SECURITY;

-- Characters policies
CREATE POLICY "Users can view characters in their projects"
    ON characters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = characters.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can create characters in their projects"
    ON characters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = characters.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update characters in their projects"
    ON characters FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = characters.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete characters in their projects"
    ON characters FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = characters.project_id
        AND projects.user_id = auth.uid()
    ));

-- Scene types policies (viewable by all, managed by admins)
CREATE POLICY "Scene types are viewable by all authenticated users"
    ON scene_types FOR SELECT
    TO authenticated
    USING (true);

-- Scene types junction policies
CREATE POLICY "Users can view scene types for their scenes"
    ON scene_types_junction FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_types_junction.scene_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can add scene types to their scenes"
    ON scene_types_junction FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_types_junction.scene_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can remove scene types from their scenes"
    ON scene_types_junction FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_types_junction.scene_id
        AND projects.user_id = auth.uid()
    ));

-- Scene characters policies
CREATE POLICY "Users can view characters in their scenes"
    ON scene_characters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_characters.scene_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can add characters to their scenes"
    ON scene_characters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_characters.scene_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can remove characters from their scenes"
    ON scene_characters FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_characters.scene_id
        AND projects.user_id = auth.uid()
    ));

-- Scene synopsis policies
CREATE POLICY "Users can view synopsis for their scenes"
    ON scene_synopsis FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_synopsis.scene_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can create synopsis for their scenes"
    ON scene_synopsis FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_synopsis.scene_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update synopsis for their scenes"
    ON scene_synopsis FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_synopsis.scene_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete synopsis for their scenes"
    ON scene_synopsis FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM scenes
        JOIN episodes ON scenes.episode_id = episodes.id
        JOIN projects ON episodes.project_id = projects.id
        WHERE scenes.id = scene_synopsis.scene_id
        AND projects.user_id = auth.uid()
    ));

-- Create triggers for updating timestamps
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scene_types_updated_at
    BEFORE UPDATE ON scene_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scene_synopsis_updated_at
    BEFORE UPDATE ON scene_synopsis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default scene types
INSERT INTO scene_types (name, description) VALUES
    ('Action', 'A scene focused on physical activity, conflict, or movement'),
    ('Dialogue', 'A scene primarily driven by character conversations'),
    ('Exposition', 'A scene that provides background information or world-building details'),
    ('Character Development', 'A scene that develops character personalities, relationships, or arcs'),
    ('Plot Development', 'A scene that advances the main story or subplot'),
    ('World Building', 'A scene that expands the understanding of the story''s setting or universe'),
    ('Climax', 'A scene representing a turning point or peak of tension'),
    ('Resolution', 'A scene that resolves conflict or provides closure'),
    ('Setup', 'A scene that establishes new plot elements or future developments'),
    ('Flashback', 'A scene that shows past events')
ON CONFLICT (name) DO NOTHING;
