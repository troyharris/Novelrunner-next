ALTER TABLE projects
ADD COLUMN cover_color TEXT;

ALTER TABLE projects
ADD COLUMN number_of_episodes INTEGER NOT NULL DEFAULT 1;
