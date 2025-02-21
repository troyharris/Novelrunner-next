import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const episodes = await request.json();

    if (!episodes || !Array.isArray(episodes) || episodes.length === 0) {
      return new NextResponse("Invalid episode data", { status: 400 });
    }

    // Insert episodes into the database
    // Get the project ID from the first episode
    const projectId = episodes[0].projectId;

    // Fetch existing episodes to determine the next sequence number
    const { data: existingEpisodes, error: sequenceError } = await supabase
      .from("episodes")
      .select("sequence_number")
      .eq("project_id", projectId)
      .order("sequence_number", { ascending: false })
      .limit(1);

    if (sequenceError) {
      console.error("Error fetching existing episodes:", sequenceError);
      return new NextResponse("Database error", { status: 500 });
    }

    const nextSequenceNumber =
      existingEpisodes && existingEpisodes.length > 0
        ? existingEpisodes[0].sequence_number + 1
        : 1;

    // Insert episodes into the database
    const { data, error } = await supabase
      .from("episodes")
      .insert(
        episodes.map((episode, index) => ({
          project_id: episode.projectId,
          title: episode.title,
          target_word_count: episode.targetWordCount,
          sequence_number: nextSequenceNumber + index,
        }))
      )
      .select();

    if (error) {
      console.error("Error creating episodes:", error);
      return new NextResponse("Database error", { status: 500 });
    }

    return NextResponse.json({
      message: "Episodes created successfully",
      data,
    });
  } catch (error) {
    console.error("Error creating episodes:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
