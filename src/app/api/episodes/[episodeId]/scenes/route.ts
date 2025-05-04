import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { episodeId: string } }
) {
  const supabase = await createClient();
  const { episodeId } = await params;

  const { data: scenes, error } = await supabase
    .from("scenes")
    .select("id, title, content, word_count, status, sequence_number")
    .eq("episode_id", episodeId)
    .order("sequence_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scenes });
}

export async function PATCH(
  request: Request,
  { params }: { params: { episodeId: string } }
) {
  const supabase = await createClient();
  const { episodeId } = await params;
  const { sceneId, newIndex, content } = await request.json();

  // If content is provided, update the scene content
  if (content !== undefined) {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word: string) => word.length > 0);
    const { error: contentError } = await supabase
      .from("scenes")
      .update({
        content,
        word_count: words.length,
      })
      .eq("id", sceneId)
      .eq("episode_id", episodeId);

    if (contentError) {
      return NextResponse.json(
        { error: contentError.message },
        { status: 500 }
      );
    }

    // --- Recalculate and update episode word count ---
    const { data: episodeScenes, error: episodeScenesError } = await supabase
      .from("scenes")
      .select("word_count")
      .eq("episode_id", episodeId);

    if (episodeScenesError) {
      console.error(
        "Error fetching scenes for word count:",
        episodeScenesError
      );
      // Proceed without updating episode count, but log the error
    }

    let newEpisodeWordCount = 0;
    if (episodeScenes) {
      newEpisodeWordCount = episodeScenes.reduce(
        (sum: number, scene: { word_count: number | null }) =>
          sum + (scene.word_count || 0),
        0
      );

      const { error: updateEpisodeError } = await supabase
        .from("episodes")
        .update({ current_word_count: newEpisodeWordCount })
        .eq("id", episodeId);

      if (updateEpisodeError) {
        console.error("Error updating episode word count:", updateEpisodeError);
        // Proceed, but log the error
      }
    } // Correct closing brace for if(episodeScenes)
    // --- End episode word count update ---

    // --- Recalculate and update project word count ---
    let newProjectWordCount = 0;
    // First, get the project_id for the current episode
    const { data: episodeData, error: episodeError } = await supabase
      .from("episodes")
      .select("project_id")
      .eq("id", episodeId)
      .single();

    if (episodeError || !episodeData) {
      console.error(
        "Error fetching episode data for project update:",
        episodeError
      );
      // Proceed without updating project count, but log the error
    } else {
      const projectId = episodeData.project_id;
      // Fetch all episodes for this project
      const { data: projectEpisodes, error: projectEpisodesError } =
        await supabase
          .from("episodes")
          .select("current_word_count")
          .eq("project_id", projectId);

      if (projectEpisodesError) {
        console.error(
          "Error fetching project episodes for word count:",
          projectEpisodesError
        );
        // Proceed without updating project count, but log the error
      } else if (projectEpisodes) {
        newProjectWordCount = projectEpisodes.reduce(
          (sum: number, ep: { current_word_count: number | null }) =>
            sum + (ep.current_word_count || 0),
          0
        );

        const { error: updateProjectError } = await supabase
          .from("projects")
          .update({ words_written: newProjectWordCount })
          .eq("id", projectId);

        if (updateProjectError) {
          console.error(
            "Error updating project word count:",
            updateProjectError
          );
          // Proceed, but log the error
        }
      }
    }
    // --- End project word count update ---

    // Return the updated scene, episode word count, and project word count
    const { data: scene, error: getSceneError } = await supabase
      .from("scenes")
      .select("id, title, content, word_count, status, sequence_number")
      .eq("id", sceneId)
      .single();

    if (getSceneError) {
      return NextResponse.json(
        { error: getSceneError.message },
        { status: 500 }
      );
    }

    // Return updated scene, episode word count, and project word count
    return NextResponse.json({
      scene,
      episodeWordCount: newEpisodeWordCount,
      projectWordCount: newProjectWordCount, // Add project word count here
    });
  } // Correct closing brace for if(content !== undefined)

  // --- Handle Scene Reordering ---
  // (Keep existing reordering logic below)
  // Check if newIndex is provided for reordering
  else if (newIndex !== undefined && sceneId) {
    // Get all scenes for this episode (for reordering)
    const { data: scenes, error: getScenesError } = await supabase
      .from("scenes")
      .select("id, sequence_number")
      .eq("episode_id", episodeId)
      .order("sequence_number", { ascending: true });

    if (getScenesError) {
      console.log(getScenesError);
      return NextResponse.json(
        { error: getScenesError.message },
        { status: 500 }
      );
    }

    if (!scenes) {
      return NextResponse.json({ error: "No scenes found" }, { status: 404 });
    }

    // Find the scene being moved
    const sceneIndex = scenes.findIndex(
      (s: { id: string }) => s.id === sceneId
    );
    if (sceneIndex === -1) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    // Create new array with scene in new position
    const reorderedScenes = [...scenes];
    const [movedScene] = reorderedScenes.splice(sceneIndex, 1);
    reorderedScenes.splice(newIndex, 0, movedScene);

    // Assign new sequential numbers
    const updates = reorderedScenes.map(
      (scene: { id: string }, index: number) => ({
        id: scene.id,
        sequence_number: index + 1,
      })
    );

    // Update all scenes at once using a CASE statement
    const { error: updateError } = await supabase.rpc("reorder_scenes", {
      p_episode_id: episodeId,
      p_scene_ids: updates.map((u) => u.id),
      p_sequence_numbers: updates.map((u) => u.sequence_number),
    });

    if (updateError) {
      console.log(updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Return updated scenes
    const { data: updatedScenes, error: getUpdatedError } = await supabase
      .from("scenes")
      .select("id, title, content, word_count, status, sequence_number")
      .eq("episode_id", episodeId)
      .order("sequence_number", { ascending: true });

    if (getUpdatedError) {
      console.log(getUpdatedError);
      return NextResponse.json(
        { error: getUpdatedError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ scenes: updatedScenes });
  }
  // If neither content nor newIndex is provided
  else {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { episodeId: string } }
) {
  const supabase = await createClient();
  const { episodeId } = await params;
  const { title } = await request.json();

  // Get the highest sequence number for this episode
  const { data: existingScenes, error: queryError } = await supabase
    .from("scenes")
    .select("sequence_number")
    .eq("episode_id", episodeId)
    .order("sequence_number", { ascending: false })
    .limit(1);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  // Calculate next sequence number (start at 1 if no existing scenes)
  const nextSequenceNumber =
    existingScenes && existingScenes.length > 0
      ? existingScenes[0].sequence_number + 1
      : 1;

  const { data: scene, error } = await supabase
    .from("scenes")
    .insert([
      {
        episode_id: episodeId,
        title,
        word_count: 0,
        status: "draft",
        sequence_number: nextSequenceNumber,
      },
    ])
    .select("id, title, content, word_count, status, sequence_number")
    .single();

  if (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scene });
}
