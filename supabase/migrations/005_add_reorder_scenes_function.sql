-- Create function to reorder scenes
CREATE OR REPLACE FUNCTION reorder_scenes(
  p_episode_id UUID,
  p_scene_ids UUID[],
  p_sequence_numbers INT[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to these scenes
  IF NOT EXISTS (
    SELECT 1 FROM episodes
    JOIN projects ON episodes.project_id = projects.id
    WHERE episodes.id = p_episode_id
    AND projects.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- First move all sequence numbers to negative to avoid conflicts
  UPDATE scenes
  SET sequence_number = -sequence_number
  WHERE episode_id = p_episode_id
  AND id = ANY(p_scene_ids);

  -- Then update with new sequence numbers
  UPDATE scenes
  SET sequence_number = p_sequence_numbers[array_position(p_scene_ids, id)]
  WHERE episode_id = p_episode_id
  AND id = ANY(p_scene_ids);
END;
$$;
