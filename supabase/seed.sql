-- Seed data for development
INSERT INTO auth.users (id, email)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'test@example.com');

INSERT INTO public.users (id, display_name)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Test User');

-- Sample project
INSERT INTO public.projects (
  id,
  user_id,
  title,
  genre,
  target_word_count,
  pace,
  status,
  cover_color,
  number_of_episodes
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'Sample Novel',
  'Science Fiction',
  100000,
  'Medium',
  'draft',
  '#4A90E2',
  10
);

-- Sample episodes
INSERT INTO public.episodes (
  id,
  project_id,
  title,
  target_word_count,
  sequence_number,
  status
) VALUES 
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Episode 1', 10000, 1, 'not_started'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Episode 2', 10000, 2, 'not_started');

-- Sample scenes
INSERT INTO public.scenes (
  id,
  episode_id,
  title,
  content,
  word_count,
  sequence_number,
  status,
  notes
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'Opening Scene',
  'The story begins...',
  2,
  1,
  'draft',
  'Introduce main character and setting'
);

-- Sample research note
INSERT INTO public.research_notes (
  id,
  project_id,
  title,
  content
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'World Building Research',
  'Key concepts for the sci-fi setting...'
);

-- Sample worldbuilding note
INSERT INTO public.worldbuilding_notes (
  id,
  project_id,
  title,
  content
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  'Technology',
  'Advanced technology in this universe includes...'
);

-- Sample synopsis
INSERT INTO public.synopses (
  id,
  project_id,
  episode_id,
  content
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'In this episode, we introduce the main conflict...'
);
