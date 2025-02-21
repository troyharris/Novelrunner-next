import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, genre, targetWordCount, pace, coverColor } =
      await request.json();

    // Validate input
    if (!title || !genre || !targetWordCount || !pace) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (targetWordCount <= 0) {
      return new NextResponse("Target word count must be greater than zero", {
        status: 400,
      });
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
    console.log("User Id is:");
    console.log(user.id);

    // Check if the user exists in the users table, create if not
    const { data: existingUsers, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id);

    if (userError) {
      console.error("Error checking user existence:", userError);
      return new NextResponse("Error checking user existence", { status: 500 });
    }

    if (!existingUsers || existingUsers.length === 0) {
      // Create user record if it doesn't exist
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id,
          display_name: user.email?.split("@")[0], // Use part before @ as display name
        },
      ]);

      if (insertError) {
        console.error("Error creating user record:", insertError);
        return new NextResponse("Error creating user record", { status: 500 });
      }
    }

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
          user_id: user.id,
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

export async function GET() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.from("projects").select("*");

    if (error) {
      console.error(error);
      return new NextResponse("Database error", { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
