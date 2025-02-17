import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or key");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { title, genre, targetWordCount, pace, coverColor } =
      await request.json();

    // Validate input
    if (!title || !genre || !targetWordCount || !pace) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Calculate number of episodes based on pace
    let wordsPerEpisode = 0;
    switch (pace) {
      case "Slow":
        wordsPerEpisode = 15000;
        break;
      case "Medium":
        wordsPerEpisode = 10000;
        break;
      case "Fast":
        wordsPerEpisode = 7500;
        break;
      default:
        return new NextResponse("Invalid pace", { status: 400 });
    }

    const numberOfEpisodes = Math.floor(targetWordCount / wordsPerEpisode);
    const adjustedTargetWordCount = numberOfEpisodes * wordsPerEpisode;

    // Store the project in the database
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          title,
          genre,
          target_word_count: adjustedTargetWordCount,
          pace,
          cover_color: coverColor,
          number_of_episodes: numberOfEpisodes,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      return new NextResponse("Database error", { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
